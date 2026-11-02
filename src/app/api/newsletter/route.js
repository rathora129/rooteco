import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ApiError, apiSuccess, handleRoute, readJson } from '@/lib/api/response';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const newsletterSchema = z.object({
  email: z.string().trim().email().max(200),
  source: z.string().trim().max(60).optional(),
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
