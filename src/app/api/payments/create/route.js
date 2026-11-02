import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ApiError, apiSuccess, handleRoute, readJson } from '@/lib/api/response';
import { getSettings } from '@/lib/settings';
import { createRazorpayOrder, paymentAvailability } from '@/lib/payments';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({ orderId: z.string().trim().min(1).max(100) });

export const POST = handleRoute(async (request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`payment-create:${ip}`, { limit: 15, windowMs: 10 * 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many payment attempts. Please try again shortly.');
  }

  const data = await readJson(request);
  const { orderId } = schema.parse(data);

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id: orderId } }),
    getSettings(),
  ]);
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.paymentStatus === 'paid') {
    throw new ApiError(409, 'This order is already paid.');
  }
  if (order.paymentMethod !== 'online') {
    throw new ApiError(400, 'This order is not set up for online payment.');
  }

  const availability = paymentAvailability(settings);
  if (!availability.enabled || !availability.keyId) {
    throw new ApiError(503, 'Online payment is not available right now. Please choose bank transfer or contact us.');
  }

  const amount = Math.round(Number(order.total) * 100);
  if (!Number.isFinite(amount) || amount < 100) {
    throw new ApiError(400, 'This order total cannot be charged online. Please contact us.');
  }

  let providerOrder;
  try {
    providerOrder = await createRazorpayOrder({
      amount,
      receipt: order.number.slice(0, 40),
      notes: { orderId: order.id, orderNumber: order.number },
    });
  } catch (error) {
    throw new ApiError(502, error.message || 'Could not start the online payment.');
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentRef: providerOrder.id },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'payment_initiated',
      message: 'Online payment initiated through Razorpay.',
      paymentStatus: order.paymentStatus,
      actor: 'system',
    },
  }).catch(() => {});

  return apiSuccess({
    provider: 'razorpay',
    keyId: availability.keyId,
    providerOrderId: providerOrder.id,
    amount,
    currency: providerOrder.currency || 'INR',
    orderNumber: order.number,
  });
});
