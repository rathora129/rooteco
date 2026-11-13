import { notFound } from 'next/navigation';
import { requireOwnerPage } from '@/lib/auth';
import { visibleSections } from '@/lib/cms';
import prisma from '@/lib/prisma';
import PagePreview from '@/components/pages/PagePreview';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Page preview',
  robots: { index: false, follow: false },
};

export default async function PreviewRoute({ params, searchParams }) {
  await requireOwnerPage();
  const { slug } = await params;
  const { id } = await searchParams;

  const page = await prisma.page.findFirst({
    where: id ? { id: String(id) } : { slug },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
  if (!page) notFound();

  const payload = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    status: page.status,
    sections: visibleSections(page.sections).map((section) => ({
      id: section.id,
      type: section.type,
      heading: section.heading,
      body: section.body,
      image: section.image,
      data: section.data,
      order: section.order,
    })),
  };

  return <PagePreview page={payload} />;
}
