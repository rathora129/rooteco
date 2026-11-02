import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { apiSuccess, buildMeta, handleRoute, parseListParams, serialize } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);
  const type = searchParams.get('type');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where = {
    ...(type ? { type } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  };

  const [total, events] = await Promise.all([
    prisma.marketingEvent.count({ where }),
    prisma.marketingEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    }),
  ]);

  return apiSuccess(serialize(events), buildMeta(total, params.page, params.pageSize));
});
