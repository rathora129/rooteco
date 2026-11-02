import { notFound } from 'next/navigation';
import { getBlogBySlug } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';
import BlogPost from '@/components/pages/BlogPost';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [blog, settings] = await Promise.all([getBlogBySlug(slug), getSettings()]);
  if (!blog) return { title: 'Article not found' };
  const description = blog.seoDescription || blog.excerpt || settings.seo?.defaultDescription;
  return {
    title: blog.seoTitle ? { absolute: blog.seoTitle } : blog.title,
    description,
    alternates: { canonical: absoluteUrl(`/blog/${blog.slug}`, settings) },
    openGraph: {
      title: blog.seoTitle || blog.title,
      description,
      type: 'article',
      publishedTime: blog.publishedAt ? new Date(blog.publishedAt).toISOString() : undefined,
      images: blog.image ? [{ url: blog.image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();
  return <BlogPost blog={blog} />;
}
