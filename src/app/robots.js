import { getSettings } from '@/lib/settings';
import { siteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function robots() {
  const settings = await getSettings();
  const base = siteUrl(settings);
  const sitemapEnabled = settings.seo?.sitemapEnabled !== false;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/dashboard/', '/api/', '/login', '/checkout', '/cart'],
      },
    ],
    ...(sitemapEnabled ? { sitemap: `${base}/sitemap.xml`, host: base } : {}),
  };
}
