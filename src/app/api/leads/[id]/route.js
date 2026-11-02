import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { leadUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      client: true,
      followUps: { orderBy: { dueDate: 'desc' } },
      quotes: {
        orderBy: { createdAt: 'desc' },
        include: { order: { select: { id: true, number: true, status: true } } },
      },
    },
  });
  if (!lead) throw new ApiError(404, 'Lead not found.');
  return apiSuccess(serialize(lead));
});

export const PATCH = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const body = await readJson(request);
  const data = leadUpdateSchema.parse(body);
  const lead = await prisma.lead.update({
    where: { id },
    data,
    include: { client: true },
  });
  return apiSuccess(serialize(lead));
});

export const DELETE = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  await prisma.lead.delete({ where: { id } });
  return apiSuccess({ id });
});
