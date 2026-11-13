import prisma from '@/lib/prisma';
import { PAGE_LAYOUTS, layoutDefaults, sectionLayoutKey } from '@/lib/pages/layouts';

async function removeDuplicateLayoutRows(rows) {
  const seen = new Set();
  const duplicates = [];
  for (const row of rows) {
    const key = sectionLayoutKey(row);
    if (!key) continue;
    if (seen.has(key)) duplicates.push(row.id);
    else seen.add(key);
  }
  if (duplicates.length) {
    await prisma.pageSection.deleteMany({ where: { id: { in: duplicates } } });
  }
  return duplicates.length;
}

async function syncPageLayout(slug) {
  const page = await prisma.page.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });
  if (!page) return { slug, created: 0, skipped: true };

  const found = await prisma.pageSection.findMany({
    where: { pageId: page.id },
    orderBy: { order: 'asc' },
  });
  const deduped = await removeDuplicateLayoutRows(found);
  const existing = deduped
    ? await prisma.pageSection.findMany({ where: { pageId: page.id }, orderBy: { order: 'asc' } })
    : found;
  const layoutRows = existing.filter((row) => sectionLayoutKey(row));
  const legacyRows = existing.filter((row) => !sectionLayoutKey(row));
  const existingKeys = new Set(layoutRows.map((row) => sectionLayoutKey(row)));
  const missing = layoutDefaults(slug).filter((entry) => !existingKeys.has(entry.key));

  const created = [];
  for (const entry of missing) {
    const record = await prisma.pageSection.create({
      data: {
        pageId: page.id,
        type: entry.type,
        heading: entry.heading || null,
        body: entry.body || null,
        image: entry.image || null,
        data: entry.data,
        order: layoutRows.length + legacyRows.length + created.length,
      },
      select: { id: true, heading: true },
    });
    created.push(record);
  }

  const refreshed = await prisma.pageSection.findMany({
    where: { pageId: page.id },
    orderBy: { order: 'asc' },
  });
  const refreshedLayout = refreshed.filter((row) => sectionLayoutKey(row));
  const refreshedLegacy = refreshed.filter((row) => !sectionLayoutKey(row));
  const ordered = [...refreshedLayout, ...refreshedLegacy];

  for (let index = 0; index < ordered.length; index += 1) {
    if (ordered[index].order !== index) {
      await prisma.pageSection.update({
        where: { id: ordered[index].id },
        data: { order: index },
      });
    }
  }

  return {
    slug,
    created: created.length,
    removed: deduped,
    total: ordered.length,
    layoutSections: refreshedLayout.length,
    legacySections: refreshedLegacy.length,
  };
}

let activeSync = null;

async function runSync() {
  const results = [];
  for (const slug of Object.keys(PAGE_LAYOUTS)) {
    results.push(await syncPageLayout(slug));
  }
  return {
    createdCount: results.reduce((total, item) => total + item.created, 0),
    removedCount: results.reduce((total, item) => total + (item.removed || 0), 0),
    pages: results,
  };
}

export function syncLayoutSections() {
  // A single in-process run prevents duplicate inserts when several dashboard
  // requests (or React Strict Mode's double effects) call the endpoint together.
  if (activeSync) return activeSync;
  activeSync = runSync().finally(() => {
    activeSync = null;
  });
  return activeSync;
}
