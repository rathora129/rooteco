import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { orderUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, events: { orderBy: { createdAt: 'desc' } } },
  });
  if (!order) throw new ApiError(404, 'Order not found.');
  return apiSuccess(serialize(order));
});

export const PATCH = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const body = await readJson(request);
  const data = orderUpdateSchema.parse(body);

  if (data.paymentStatus === 'paid') {
    throw new ApiError(
      422,
      'Paid status can only be set by a confirmed payment provider webhook.'
    );
  }

  const before = await prisma.order.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Order not found.');

  const order = await prisma.order.update({
    where: { id },
    data,
    include: { items: true },
  });

  const statusChanged = data.status && data.status !== before.status;
  const paymentChanged = data.paymentStatus && data.paymentStatus !== before.paymentStatus;
  if (statusChanged || paymentChanged) {
    const parts = [];
    if (statusChanged) parts.push(`Status ${before.status} → ${order.status}`);
    if (paymentChanged) parts.push(`Payment ${before.paymentStatus} → ${order.paymentStatus}`);
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: statusChanged && paymentChanged ? 'status+payment' : statusChanged ? 'status' : 'payment',
        message: parts.join(' · '),
        fromStatus: statusChanged ? before.status : null,
        toStatus: statusChanged ? order.status : null,
        fromPaymentStatus: paymentChanged ? before.paymentStatus : null,
        paymentStatus: paymentChanged ? order.paymentStatus : null,
        actor: 'owner',
      },
    }).catch(() => {});
  } else if (data.notes !== undefined || data.paymentRef !== undefined) {
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'note',
        message: data.notes !== undefined ? 'Internal notes updated.' : 'Payment reference updated.',
        actor: 'owner',
      },
    }).catch(() => {});
  }

  return apiSuccess(serialize(order));
});

export const DELETE = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  await prisma.order.delete({ where: { id } });
  return apiSuccess({ id });
});
