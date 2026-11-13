import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import {
  ApiError,
  apiSuccess,
  buildMeta,
  handleRoute,
  parseListParams,
  readJson,
  serialize,
} from '@/lib/api/response';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const newsletterSchema = z.object({
  email: z.string().trim().email().max(200),
  source: z.string().trim().max(60).optional(),
});

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);
  const state = searchParams.get('state');

  const where = {
    ...(params.q ? { email: { contains: params.q, mode: 'insensitive' } } : {}),
    ...(state === 'active' ? { active: true } : {}),
    ...(state === 'unsubscribed' ? { active: false } : {}),
  };

  const [total, active, unsubscribed, subscribers] = await Promise.all([
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.newsletterSubscriber.count({ where: { active: false } }),
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return apiSuccess(serialize(subscribers), {
    ...buildMeta(total, params.page, params.pageSize),
    active,
    unsubscribed,
  });
});

export const POST = handleRoute(async (request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`newsletter:${ip}`, { limit: 6, windowMs: 10 * 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many sign-up attempts. Please try again later.');
  }

  const body = await readJson(request);
  const data = newsletterSchema.parse(body);
  const email = data.email.toLowerCase();

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { active: true },
    create: { email, source: data.source || 'footer' },
  });

  return apiSuccess({ subscribed: true }, undefined, 201);
});
