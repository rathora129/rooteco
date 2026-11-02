import AboutPage from '@/components/pages/AboutPage';
import { getPage } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';

export async function generateMetadata() {
  const [page, settings] = await Promise.all([getPage('about'), getSettings()]);
  return {
    title: page?.seoTitle ? { absolute: page.seoTitle } : page?.title || 'About Us',
    description:
      page?.seoDescription ||
      'RootEco is a curated corporate gifting storefront built around thoughtful products, careful branding and reliable bulk delivery.',
    alternates: { canonical: absoluteUrl('/about', settings) },
  };
}

export default function AboutRoute() {
  return <AboutPage />;
}
