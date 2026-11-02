import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, buildMeta, handleRoute, parseListParams, readJson, serialize } from '@/lib/api/response';
import { orderCreateSchema } from '@/lib/validation';
import { createOrder } from '@/lib/orders';
import { rateLimit } from '@/lib/rate-limit';
import { getSettings } from '@/lib/settings';
import { paymentAvailability } from '@/lib/payments';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('paymentStatus');

  const where = {
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(params.q
      ? {
          OR: [
            { number: { contains: params.q, mode: 'insensitive' } },
            { customerName: { contains: params.q, mode: 'insensitive' } },
            { email: { contains: params.q, mode: 'insensitive' } },
            { phone: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return apiSuccess(serialize(orders), buildMeta(total, params.page, params.pageSize));
});

export const POST = handleRoute(async (request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`checkout:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many checkout attempts. Please try again shortly.');
  }

  const body = await readJson(request);
  const data = orderCreateSchema.parse(body);

  if (data.paymentMethod === 'online') {
    const availability = paymentAvailability(await getSettings());
    if (!availability.enabled) {
      throw new ApiError(400, 'Online payment is not available right now. Please choose bank transfer or cash on delivery.');
    }
  }

  const order = await createOrder({
    customer: data,
    items: data.items,
    couponCode: data.couponCode,
    paymentMethod: data.paymentMethod,
  });

  return apiSuccess(
    serialize({
      id: order.id,
      number: order.number,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      paymentStatus: order.paymentStatus,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items,
    }),
    undefined,
    201
  );
});
