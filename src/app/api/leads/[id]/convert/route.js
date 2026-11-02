import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, handleRoute, readJson, serialize } from '@/lib/api/response';
import { upsertClientByContact } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export const POST = handleRoute(async (request, context) => {
  await requireOwner();
  const { id } = await context.params;
  const body = await readJson(request).catch(() => ({}));

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new ApiError(404, 'Lead not found.');

  const client = lead.clientId
    ? await prisma.client.findUnique({ where: { id: lead.clientId } })
    : await upsertClientByContact({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
      });

  if (!client) throw new ApiError(500, 'Could not create the client record.');

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      clientId: client.id,
      status: body?.status || 'won',
    },
    include: { client: true },
  });

  return apiSuccess(serialize({ lead: updated, client }));
});
