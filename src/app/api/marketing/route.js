import prisma from '@/lib/prisma';
import { requireOwner } from '@/lib/auth';
import { apiSuccess, handleRoute, serialize } from '@/lib/api/response';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const GET = handleRoute(async () => {
  await requireOwner();
  const settings = await getSettings();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dailySince = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
  dailySince.setHours(0, 0, 0, 0);

  const [byType, recent, dailyEvents, couponCount, activeBanners, blogCount] = await Promise.all([
    prisma.marketingEvent.groupBy({
      by: ['type'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.marketingEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.marketingEvent.findMany({
      where: { createdAt: { gte: dailySince } },
      select: { type: true, createdAt: true },
    }),
    prisma.coupon.count(),
    prisma.banner.count({ where: { active: true } }),
    prisma.blog.count({ where: { status: 'published' } }),
  ]);

  const dailyMap = new Map();
  for (let index = 0; index < 14; index += 1) {
    const date = new Date(dailySince.getTime() + index * 24 * 60 * 60 * 1000);
    dailyMap.set(date.toISOString().slice(0, 10), 0);
  }
  for (const event of dailyEvents) {
    const key = event.createdAt.toISOString().slice(0, 10);
    if (dailyMap.has(key)) dailyMap.set(key, dailyMap.get(key) + 1);
  }

  return apiSuccess(
    serialize({
      seo: settings.seo,
      marketing: settings.marketing,
      events: {
        byType: byType.map((row) => ({ type: row.type, count: row._count._all })),
        daily: [...dailyMap.entries()].map(([date, count]) => ({ date, count })),
        total30d: byType.reduce((sum, row) => sum + row._count._all, 0),
      },
      recent,
      counts: { coupons: couponCount, activeBanners, publishedBlogs: blogCount },
      sitemap: {
        enabled: settings.seo.sitemapEnabled,
        sitemapUrl: '/sitemap.xml',
        robotsUrl: '/robots.txt',
      },
    })
  );
});
