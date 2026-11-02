import prisma from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';

const STATIC_PATHS = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/categories', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/collections', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/wall-of-love', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/get-a-quote', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/build-your-own-hamper', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/track-order', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/shipping-and-refund-policy', priority: 0.3, changeFrequency: 'yearly' },
];

const BUILT_IN_PAGES = new Set(['home', 'about', 'contact']);

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const settings = await getSettings();
  if (settings.seo?.sitemapEnabled === false) return [];

  const [products, categories, collections, blogs, pages] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true, parent: { select: { slug: true } } },
    }),
    prisma.collection.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blog.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
    prisma.page.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const entries = [
    ...STATIC_PATHS.map((item) => ({
      url: absoluteUrl(item.path, settings),
      lastModified: new Date(),
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`, settings),
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(
        category.parent
          ? `/categories/${category.parent.slug}/${category.slug}`
          : `/categories/${category.slug}`,
        settings
      ),
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...collections.map((collection) => ({
      url: absoluteUrl(`/collections/${collection.slug}`, settings),
      lastModified: collection.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...blogs.map((blog) => ({
      url: absoluteUrl(`/blog/${blog.slug}`, settings),
      lastModified: blog.updatedAt || blog.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
    ...pages
      .filter((page) => !BUILT_IN_PAGES.has(page.slug))
      .map((page) => ({
        url: absoluteUrl(`/pages/${page.slug}`, settings),
        lastModified: page.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
      })),
  ];

  return entries;
}
