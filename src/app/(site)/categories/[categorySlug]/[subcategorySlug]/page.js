import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCategories, getCategoryBySlug, getProducts, getSubcategory } from '@/lib/catalog';
import CategoryListing from '@/components/categories/CategoryListing';
import PageLoading from '@/components/common/PageLoading';

export async function generateMetadata({ params }) {
  const { categorySlug, subcategorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  const subcategory = category?.subcategories.find((sub) => sub.slug === subcategorySlug);
  if (!category || !subcategory) return { title: 'Collection not found' };
  return {
    title: `${subcategory.name} — ${category.name}`,
    description:
      subcategory.description ||
      `Shop ${subcategory.name} for corporate gifting. Custom branding, bulk pricing and pan-India delivery from RootEco.`,
  };
}

async function SubcategoryContent({ params }) {
  const { categorySlug, subcategorySlug } = await params;
  const [category, subcategory, products, categories] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSubcategory(categorySlug, subcategorySlug),
    getProducts({ category: categorySlug, subcategory: subcategorySlug }),
    getCategories(),
  ]);
  if (!category || !subcategory) notFound();

  return (
    <CategoryListing
      category={category}
      subcategory={subcategory}
      products={products}
      categories={categories}
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
