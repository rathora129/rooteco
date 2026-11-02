import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { buildMeta, handleRoute, parseListParams, apiSuccess } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

export const GET = handleRoute(async (request) => {
  await requireOwner();
  const { searchParams } = new URL(request.url);
  const params = parseListParams(searchParams);
  const status = searchParams.get('status');
  const due = searchParams.get('due');

  const where = {
    ...(status ? { status } : {}),
    ...(due === 'true' ? { followUpDate: { lte: new Date() }, status: { notIn: ['won', 'lost'] } } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: 'insensitive' } },
            { company: { contains: params.q, mode: 'insensitive' } },
            { email: { contains: params.q, mode: 'insensitive' } },
            { phone: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true } } },
  });

  const headers = [
    'Name',
    'Company',
    'Email',
    'Phone',
    'City',
    'Source',
    'Status',
    'Product interest',
    'Budget',
    'Requirement',
    'Follow-up',
    'Created',
  ];
  const rows = leads.map((lead) =>
    [
      lead.name,
      lead.company,
      lead.email,
      lead.phone,
      lead.city,
      lead.source,
      lead.status,
      lead.productInterest,
      lead.budget,
      lead.requirement,
      lead.followUpDate ? lead.followUpDate.toISOString().slice(0, 10) : '',
      lead.createdAt.toISOString().slice(0, 19).replace('T', ' '),
    ]
      .map(csvCell)
      .join(',')
  );

  const csv = [headers.map(csvCell).join(','), ...rows].join('\r\n');
  return new Response(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rooteco-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
});
