import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import categories, { getCategoryBySlug, getSubcategory } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';
import CategoryListing from '@/components/categories/CategoryListing';
import PageLoading from '@/components/common/PageLoading';

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      categorySlug: category.slug,
      subcategorySlug: subcategory.slug,
    }))
  );
}

export async function generateMetadata({ params }) {
  const { categorySlug, subcategorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  const subcategory = getSubcategory(categorySlug, subcategorySlug);
  if (!category || !subcategory) return { title: 'Collection not found' };
  return {
    title: `${subcategory.name} — ${category.name}`,
    description: `Shop ${subcategory.name} for corporate gifting. Custom branding, bulk pricing and pan-India delivery from RootEco.`,
  };
}

async function SubcategoryContent({ params }) {
  const { categorySlug, subcategorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  const subcategory = getSubcategory(categorySlug, subcategorySlug);
  if (!category || !subcategory) notFound();

  return (
    <CategoryListing
      category={category}
      subcategory={subcategory}
      products={getProductsByCategory(category.slug, subcategory.slug)}
    />
  );
}

export default function SubcategoryPage({ params }) {
  return (
    <Suspense fallback={<PageLoading label="Loading collection…" />}>
      <SubcategoryContent params={params} />
    </Suspense>
  );
}
