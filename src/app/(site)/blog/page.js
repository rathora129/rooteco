import { getBlogs, getPage } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';
import BlogIndex from '@/components/pages/BlogIndex';

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: 'Journal',
    description:
      settings.seo?.defaultDescription ||
      'Guides and notes on corporate gifting, branding and bulk planning from RootEco.',
    alternates: { canonical: absoluteUrl('/blog', settings) },
  };
}

export default async function BlogPage() {
  const [blogs, page] = await Promise.all([getBlogs(), getPage('blog')]);
  return <BlogIndex blogs={blogs} sections={page?.sections} />;
}
