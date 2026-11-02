import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCategories, getCategoryBySlug, getProducts } from '@/lib/catalog';
import CategoryListing from '@/components/categories/CategoryListing';
import PageLoading from '@/components/common/PageLoading';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const [category, settings] = await Promise.all([getCategoryBySlug(categorySlug), getSettings()]);
  if (!category) return { title: 'Category not found' };
  const description = category.seoDescription || category.description;
  return {
    title: category.seoTitle ? { absolute: category.seoTitle } : category.name,
    description,
    alternates: { canonical: absoluteUrl(`/categories/${category.slug}`, settings) },
    openGraph: {
      title: category.seoTitle || category.name,
      description,
      url: absoluteUrl(`/categories/${category.slug}`, settings),
      images: category.image ? [{ url: absoluteUrl(category.image, settings) }] : undefined,
    },
  };
}

async function CategoryContent({ params }) {
  const { categorySlug } = await params;
  const [category, products, categories] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getProducts({ category: categorySlug }),
    getCategories(),
  ]);
  if (!category) notFound();

  return (
    <CategoryListing category={category} products={products} categories={categories} />
  );
}

export default function CategoryPage({ params }) {
  return (
    <Suspense fallback={<PageLoading label="Loading collection…" />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}
