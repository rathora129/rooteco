import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { apiSuccess, buildMeta, handleRoute, parseListParams, serialize } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);
  const direction = searchParams.get('direction');

  const where = {
    ...(direction ? { direction } : {}),
    ...(params.q
      ? {
          OR: [
            { body: { contains: params.q, mode: 'insensitive' } },
            { from: { contains: params.q, mode: 'insensitive' } },
            { to: { contains: params.q, mode: 'insensitive' } },
            { client: { name: { contains: params.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [total, messages] = await Promise.all([
    prisma.whatsAppMessage.count({ where }),
    prisma.whatsAppMessage.findMany({
      where,
      include: { client: { select: { id: true, name: true, company: true } } },
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return apiSuccess(serialize(messages), buildMeta(total, params.page, params.pageSize));
});
