import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { quoteUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, slug: true, images: true, price: true, salePrice: true } },
      client: { select: { id: true, name: true, company: true, email: true, phone: true } },
      lead: { select: { id: true, name: true, status: true } },
      order: { select: { id: true, number: true, status: true } },
      events: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!quote) throw new ApiError(404, 'Quote not found.');
  return apiSuccess(serialize(quote));
});

export const PATCH = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const body = await readJson(request);
  const data = quoteUpdateSchema.parse(body);

  const before = await prisma.quote.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Quote not found.');

  const quote = await prisma.quote.update({
    where: { id },
    data,
    include: {
      product: { select: { id: true, name: true, slug: true } },
      client: { select: { id: true, name: true, company: true } },
      order: { select: { id: true, number: true } },
    },
  });

  const events = [];
  if (data.status && data.status !== before.status) {
    events.push({
      type: 'status',
      message: `Status ${before.status} → ${quote.status}`,
      status: quote.status,
    });
  }
  if (data.amount !== undefined && String(data.amount) !== String(before.amount)) {
    events.push({
      type: 'amount',
      message: data.amount === null ? 'Quoted amount cleared.' : `Quoted amount set to ₹${Number(data.amount).toLocaleString('en-IN')}.`,
    });
  }
  if (data.followUpDate !== undefined) {
    events.push({
      type: 'follow-up',
      message: data.followUpDate ? 'Follow-up date updated.' : 'Follow-up date cleared.',
    });
  }
  if (data.internalNotes !== undefined) {
    events.push({ type: 'note', message: 'Internal notes updated.' });
  }
  if (!events.length) {
    events.push({ type: 'updated', message: 'Quote details updated.' });
  }
  await prisma.quoteEvent.createMany({
    data: events.map((event) => ({ ...event, quoteId: id, actor: 'owner' })),
  }).catch(() => {});

  return apiSuccess(serialize(quote));
});

export const DELETE = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  await prisma.quote.delete({ where: { id } });
  return apiSuccess({ id });
});
