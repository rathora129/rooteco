import prisma from '@/lib/prisma';
import { ApiError, apiSuccess, handleRoute, readJson } from '@/lib/api/response';
import { eventSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async (request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`events:${ip}`, { limit: 120, windowMs: 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many events.');
  }

  const body = await readJson(request);
  const event = eventSchema.parse(body);

  await prisma.marketingEvent.create({
    data: {
      type: event.type,
      path: event.path || null,
      productId: event.productId || null,
      metadata: event.metadata ?? undefined,
    },
  });

  return apiSuccess({ tracked: true }, undefined, 201);
});
