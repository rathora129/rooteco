import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { apiSuccess, handleRoute, serialize } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async () => {
  await requireOwner();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const dailySince = new Date();
  dailySince.setDate(dailySince.getDate() - 13);
  dailySince.setHours(0, 0, 0, 0);

  const [
    products,
    publishedProducts,
    lowStock,
    orders,
    pendingOrders,
    orderValue,
    paidValue,
    quotes,
    newQuotes,
    leads,
    activeLeads,
    clients,
    messages,
    monthLeads,
    recentOrders,
    recentQuotes,
    recentLeads,
    dueFollowUps,
    recentOrdersDaily,
    leadPipeline,
    quotePipeline,
    topItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: 'published' } }),
    prisma.product.count({ where: { stock: { lte: 5 }, status: 'published' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: 'new' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: { notIn: ['won', 'lost'] } } }),
    prisma.client.count(),
    prisma.whatsAppMessage.count(),
    prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { items: true },
    }),
    prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { product: { select: { name: true } } },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { client: { select: { name: true } } },
    }),
    prisma.followUp.findMany({
      where: { status: 'pending', dueDate: { lte: new Date() } },
      orderBy: { dueDate: 'asc' },
      take: 6,
      include: { lead: { select: { id: true, name: true, company: true, phone: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: dailySince }, status: { not: 'cancelled' } },
      select: { createdAt: true, total: true },
    }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.quote.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { qty: true },
      where: { productId: { not: null }, order: { status: { not: 'cancelled' } } },
      orderBy: { _sum: { qty: 'desc' } },
      take: 5,
    }),
  ]);

  const dailyMap = new Map();
  for (let index = 0; index < 14; index += 1) {
    const date = new Date(dailySince.getTime() + index * 24 * 60 * 60 * 1000);
    dailyMap.set(date.toISOString().slice(0, 10), { value: 0, orders: 0 });
  }
  for (const order of recentOrdersDaily) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      entry.value += Number(order.total);
      entry.orders += 1;
    }
  }

  const productIds = topItems.map((item) => item.productId).filter(Boolean);
  const topProducts = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, slug: true, images: true },
      })
    : [];
  const productMap = new Map(topProducts.map((product) => [product.id, product]));

  return apiSuccess(
    serialize({
      counts: {
        products,
        publishedProducts,
        lowStock,
        orders,
        pendingOrders,
        quotes,
        newQuotes,
        leads,
        activeLeads,
        clients,
        messages,
        monthLeads,
      },
      value: {
        orderValue: orderValue._sum.total || 0,
        paidValue: paidValue._sum.total || 0,
      },
      recent: {
        orders: recentOrders,
        quotes: recentQuotes,
        leads: recentLeads,
        followUps: dueFollowUps,
      },
      pipeline: {
        leads: leadPipeline.map((row) => ({ status: row.status, count: row._count._all })),
        quotes: quotePipeline.map((row) => ({ status: row.status, count: row._count._all })),
      },
      daily: [...dailyMap.entries()].map(([date, entry]) => ({ date, ...entry })),
      topProducts: topItems.map((item) => ({
        productId: item.productId,
        qty: item._sum.qty || 0,
        name: productMap.get(item.productId)?.name || 'Deleted product',
        image: productMap.get(item.productId)?.images?.[0] || null,
      })),
    })
  );
});
