import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { ApiError, apiSuccess, buildMeta, handleRoute, parseListParams, readJson, serialize } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const createClientSchema = z.object({
  name: z.string().trim().min(2).max(160),
  company: z.string().trim().max(200).optional().nullable(),
  email: z.preprocess(
    (value) => (value === '' || value === undefined ? null : value),
    z.string().trim().email().max(200).nullable()
  ).optional(),
  phone: z.string().trim().min(6).max(30),
  city: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
});

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);

  const where = params.q
    ? {
        OR: [
          { name: { contains: params.q, mode: 'insensitive' } },
          { company: { contains: params.q, mode: 'insensitive' } },
          { email: { contains: params.q, mode: 'insensitive' } },
          { phone: { contains: params.q, mode: 'insensitive' } },
        ],
      }
    : {};

  const [total, clients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      include: {
        _count: { select: { leads: true, quotes: true, orders: true, whatsappMessages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return apiSuccess(serialize(clients), buildMeta(total, params.page, params.pageSize));
});

export const POST = handleRoute(async (request) => {
  await requireOwner();
  const body = await readJson(request);
  const data = createClientSchema.parse(body);

  const client = await prisma.client.create({
    data: {
      name: data.name,
      company: data.company || null,
      email: data.email ? String(data.email).toLowerCase() : null,
      phone: String(data.phone).replace(/[^\d+]/g, ''),
      city: data.city || null,
      notes: data.notes || null,
    },
  });

  return apiSuccess(serialize(client), undefined, 201);
});
