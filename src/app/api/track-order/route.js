import prisma from '@/lib/prisma';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { trackOrderSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async (request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`track:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many lookups. Please try again later.');
  }

  const body = await readJson(request);
  const { number, email } = trackOrderSchema.parse(body);

  const order = await prisma.order.findFirst({
    where: { number: number.trim().toUpperCase(), email: email.trim().toLowerCase() },
    include: { items: { select: { name: true, qty: true, image: true } } },
  });

  if (!order) {
    throw new ApiError(404, 'No order found with that number and email.');
  }

  return apiSuccess(
    serialize({
      number: order.number,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      total: order.total,
      city: order.city,
      state: order.state,
      items: order.items,
    })
  );
});
