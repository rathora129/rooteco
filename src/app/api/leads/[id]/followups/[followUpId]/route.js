import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { followUpSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const body = await readJson(request);
  const data = followUpSchema.parse(body);

  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true, followUpDate: true } });
  if (!lead) throw new ApiError(404, 'Lead not found.');

  const followUp = await prisma.followUp.create({
    data: {
      leadId: id,
      dueDate: data.dueDate,
      note: data.note || null,
      status: data.status || 'pending',
    },
  });

  if (!lead.followUpDate || data.dueDate < lead.followUpDate) {
    await prisma.lead.update({ where: { id }, data: { followUpDate: data.dueDate } });
  }

  return apiSuccess(serialize(followUp), undefined, 201);
});

export const PATCH = handleRoute(async (request, context) => {
  await requireOwner();
  const { id, followUpId } = await context.params;
  const body = await readJson(request);
  const data = followUpSchema.partial().parse(body);

  const followUp = await prisma.followUp.update({
    where: { id: followUpId },
    data,
  });
  return apiSuccess(serialize(followUp));
});

export const DELETE = handleRoute(async (request, context) => {
  await requireOwner();
  const { followUpId } = await context.params;
  await prisma.followUp.delete({ where: { id: followUpId } });
  return apiSuccess({ id: followUpId });
});
