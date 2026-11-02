import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { clientUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      leads: { orderBy: { createdAt: 'desc' }, include: { followUps: { orderBy: { dueDate: 'desc' } } } },
      quotes: {
        orderBy: { createdAt: 'desc' },
        include: { order: { select: { id: true, number: true, status: true } } },
      },
      orders: { orderBy: { createdAt: 'desc' }, include: { items: true } },
      whatsappMessages: { orderBy: { createdAt: 'desc' }, take: 50 },
      _count: { select: { leads: true, quotes: true, orders: true, whatsappMessages: true } },
    },
  });
  if (!client) throw new ApiError(404, 'Client not found.');
  return apiSuccess(serialize(client));
});

export const PATCH = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const body = await readJson(request);
  const data = clientUpdateSchema.parse(body);
  if (data.email) data.email = String(data.email).toLowerCase();
  const client = await prisma.client.update({ where: { id }, data });
  return apiSuccess(serialize(client));
});

export const DELETE = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  await prisma.client.delete({ where: { id } });
  return apiSuccess({ id });
});
