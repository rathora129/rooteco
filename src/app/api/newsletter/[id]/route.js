import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({ active: z.boolean() });

export const PATCH = handleRoute(async (request, { params }) => {
  await requireOwner();
  const { id } = await params;
  const body = await readJson(request);
  const data = updateSchema.parse(body);

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Subscriber not found.');

  const updated = await prisma.newsletterSubscriber.update({
    where: { id },
    data: { active: data.active },
  });

  return apiSuccess(serialize(updated));
});

export const DELETE = handleRoute(async (request, { params }) => {
  await requireOwner();
  const { id } = await params;
  await prisma.newsletterSubscriber.delete({ where: { id } });
  return apiSuccess({ deleted: true });
});
