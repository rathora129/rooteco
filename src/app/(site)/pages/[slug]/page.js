import { notFound, redirect } from 'next/navigation';
import { getPage } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';
import CmsPage from '@/components/pages/CmsPage';

const BUILT_IN_REDIRECTS = {
  home: '/',
  about: '/about',
  contact: '/contact',
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (BUILT_IN_REDIRECTS[slug]) return {};
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) return { title: 'Page not found' };
  return {
    title: page.seoTitle ? { absolute: page.seoTitle } : page.title,
    description: page.seoDescription || settings.seo?.defaultDescription,
    alternates: { canonical: absoluteUrl(`/pages/${page.slug}`, settings) },
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || settings.seo?.defaultDescription,
      type: 'website',
    },
  };
}

export default async function CmsPageRoute({ params }) {
  const { slug } = await params;
  if (BUILT_IN_REDIRECTS[slug]) redirect(BUILT_IN_REDIRECTS[slug]);
  const page = await getPage(slug);
  if (!page) notFound();
  return <CmsPage page={page} />;
}
