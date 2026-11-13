import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SectionsManager from '@/components/dashboard/modules/SectionsManager';
import { registryEntry } from '@/lib/pages/registry';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Page sections', robots: { index: false, follow: false } };

export default async function PageSectionsRoute({ params }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
  if (!page) notFound();
  const entry = registryEntry(page.slug);

  return (
    <SectionsManager
      initialPage={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        updatedAt: page.updatedAt.toISOString(),
        path: entry ? entry.redirectTo || entry.path : `/pages/${page.slug}`,
        registry: Boolean(entry),
        registryPath: entry?.path || null,
        sections: page.sections.map((section) => ({
          id: section.id,
          type: section.type,
          heading: section.heading,
          body: section.body,
          image: section.image,
          data: section.data,
          order: section.order,
        })),
      }}
    />
  );
}
