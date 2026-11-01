import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import categories, { getCategoryBySlug } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';
import CategoryListing from '@/components/categories/CategoryListing';
import PageLoading from '@/components/common/PageLoading';

export function generateStaticParams() {
  return categories.map((category) => ({ categorySlug: category.slug }));
}

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: 'Category not found' };
  return {
    title: category.name,
    description: category.description,
  };
}

async function CategoryContent({ params }) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  return (
    <CategoryListing
      category={category}
      products={getProductsByCategory(category.slug)}
    />
  );
}

export default function CategoryPage({ params }) {
  return (
    <Suspense fallback={<PageLoading label="Loading collection…" />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}
