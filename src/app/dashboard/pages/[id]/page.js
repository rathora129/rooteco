import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import PageBuilder from '@/components/dashboard/PageBuilder';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Page builder', robots: { index: false, follow: false } };

export default async function PageBuilderRoute({ params }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: 'asc' } } },
  });
  if (!page) notFound();

  return (
    <PageBuilder
      initialPage={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        status: page.status,
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
