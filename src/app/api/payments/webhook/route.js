import prisma from '@/lib/prisma';
import { ApiError, apiSuccess, handleRoute } from '@/lib/api/response';
import { verifyWebhookSignature } from '@/lib/payments';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function parsePayload(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const POST = handleRoute(async (request) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    throw new ApiError(503, 'Payment webhook is not configured.');
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new ApiError(400, 'Invalid webhook signature.');
  }

  const payload = parsePayload(rawBody);
  if (!payload) throw new ApiError(400, 'Invalid webhook payload.');

  const event = payload.event;
  const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
  if (!entity) return apiSuccess({ received: true, ignored: true });

  const providerOrderId = entity.order_id || entity.id;
  const paymentId = payload.payload?.payment?.entity?.id || null;
  const notesOrderId = entity.notes?.orderId;

  const order = notesOrderId
    ? await prisma.order.findUnique({ where: { id: notesOrderId } })
    : await prisma.order.findFirst({
        where: {
          OR: [
            { paymentRef: providerOrderId },
            { paymentRef: paymentId || providerOrderId },
          ],
        },
      });

  if (!order) return apiSuccess({ received: true, ignored: true });

  if (event === 'payment.failed') {
    if (order.paymentStatus !== 'paid') {
      const before = order.paymentStatus;
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'failed' },
      });
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          type: 'payment_failed',
          message: 'Razorpay reported a failed payment attempt.',
          fromPaymentStatus: before,
          paymentStatus: 'failed',
          actor: 'payment-provider',
        },
      }).catch(() => {});
    }
    return apiSuccess({ received: true });
  }

  const captured =
    event === 'payment.captured' || event === 'order.paid';
  if (!captured) return apiSuccess({ received: true, ignored: true });

  const expectedAmount = Math.round(Number(order.total) * 100);
  if (entity.amount && Number(entity.amount) !== expectedAmount) {
    throw new ApiError(400, 'Webhook amount does not match the order total.');
  }

  if (order.paymentStatus === 'paid') {
    return apiSuccess({ received: true });
  }

  const before = order.paymentStatus;
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'paid',
      paymentRef: paymentId || order.paymentRef,
    },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'payment_paid',
      message: `Payment confirmed by Razorpay webhook (${paymentId || providerOrderId}).`,
      fromPaymentStatus: before,
      paymentStatus: 'paid',
      actor: 'payment-provider',
    },
  }).catch(() => {});

  return apiSuccess({ received: true });
});
