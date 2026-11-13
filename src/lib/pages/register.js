import prisma from '@/lib/prisma';
import { PUBLIC_PAGES } from '@/lib/pages/registry';

export async function registerMissingPages() {
  const existing = await prisma.page.findMany({ select: { id: true, slug: true, title: true } });
  const existingSlugs = new Set(existing.map((page) => page.slug));
  const missing = PUBLIC_PAGES.filter((entry) => !existingSlugs.has(entry.slug));

  const created = [];
  for (const entry of missing) {
    const record = await prisma.page.create({
      data: {
        title: entry.title,
        slug: entry.slug,
        status: 'published',
        seoTitle: entry.seoTitle || null,
        seoDescription: entry.seoDescription || null,
      },
      select: { id: true, slug: true, title: true },
    });
    created.push(record);
  }

  return {
    created,
    createdCount: created.length,
    registeredCount: existing.length + created.length,
    registryCount: PUBLIC_PAGES.length,
  };
}
