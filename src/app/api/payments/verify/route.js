import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ApiError, apiSuccess, handleRoute, readJson } from '@/lib/api/response';
import { verifyCheckoutSignature } from '@/lib/payments';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  orderId: z.string().trim().min(1).max(100),
  razorpay_order_id: z.string().trim().min(1).max(200),
  razorpay_payment_id: z.string().trim().min(1).max(200),
  razorpay_signature: z.string().trim().min(1).max(500),
});

export const POST = handleRoute(async (request) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!rateLimit(`payment-verify:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 }).allowed) {
    throw new ApiError(429, 'Too many verification attempts. Please try again shortly.');
  }

  const data = await readJson(request);
  const parsed = schema.parse(data);

  const order = await prisma.order.findUnique({ where: { id: parsed.orderId } });
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.paymentStatus === 'paid') {
    return apiSuccess({ orderNumber: order.number, paymentStatus: 'paid' });
  }
  if (order.paymentMethod !== 'online') {
    throw new ApiError(400, 'This order is not set up for online payment.');
  }
  if (order.paymentRef && order.paymentRef !== parsed.razorpay_order_id) {
    throw new ApiError(400, 'The payment does not match this order.');
  }

  const valid = verifyCheckoutSignature({
    orderId: parsed.razorpay_order_id,
    paymentId: parsed.razorpay_payment_id,
    signature: parsed.razorpay_signature,
  });
  if (!valid) {
    throw new ApiError(400, 'Payment signature could not be verified.');
  }

  const before = order.paymentStatus;
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'paid', paymentRef: parsed.razorpay_payment_id },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'payment_paid',
      message: `Payment confirmed by Razorpay (${parsed.razorpay_payment_id}).`,
      fromPaymentStatus: before,
      paymentStatus: 'paid',
      actor: 'payment-provider',
    },
  }).catch(() => {});

  return apiSuccess({ orderNumber: updated.number, paymentStatus: updated.paymentStatus });
});
