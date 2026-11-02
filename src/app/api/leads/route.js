import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, buildMeta, handleRoute, parseListParams, readJson, serialize } from '@/lib/api/response';
import { leadCreateSchema } from '@/lib/validation';
import { upsertClientByContact } from '@/lib/crm';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const due = searchParams.get('due');

  const where = {
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
    ...(due === 'true' ? { followUpDate: { lte: new Date() }, status: { notIn: ['won', 'lost'] } } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: 'insensitive' } },
            { company: { contains: params.q, mode: 'insensitive' } },
            { email: { contains: params.q, mode: 'insensitive' } },
            { phone: { contains: params.q, mode: 'insensitive' } },
            { city: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, company: true } },
        followUps: { orderBy: { dueDate: 'asc' }, take: 3 },
        quotes: { select: { id: true, status: true, amount: true }, orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: params.sort === 'follow-up' ? { followUpDate: 'asc' } : { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return apiSuccess(serialize(leads), buildMeta(total, params.page, params.pageSize));
});

export const POST = handleRoute(async (request) => {
  await requireOwner();
  const body = await readJson(request);
  const data = leadCreateSchema.parse(body);

  const client = await upsertClientByContact({
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    city: data.city,
  });

  if (!client) throw new ApiError(422, 'A valid phone number is required.');

  const lead = await prisma.lead.create({
    data: {
      ...data,
      email: data.email || null,
      source: data.source || 'manual',
      status: 'new',
      clientId: client.id,
    },
    include: { client: true },
  });

  return apiSuccess(serialize(lead), undefined, 201);
});
