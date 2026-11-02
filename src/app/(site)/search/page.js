import { Suspense } from 'react';
import PageHero from '@/components/common/PageHero';
import SearchResults from '@/components/search/SearchResults';
import { getCategories, getProducts } from '@/lib/catalog';

export const metadata = {
  title: 'Search Gifts',
  description:
    'Search RootEco corporate gifts by product, category or occasion — welcome kits, hampers, drinkware, tech and branded merchandise.',
};

export default async function SearchPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageHero
        eyebrow="Search"
        title="Find the right gift, faster"
        subtitle="Search across all RootEco categories and occasions. Looking for something custom? Our gifting team can source it."
        crumbs={[{ label: 'Search' }]}
      />
      <Suspense
        fallback={
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 24px' }}>
            <p style={{ textAlign: 'center', color: '#5C6B62' }}>Loading search…</p>
          </div>
        }
      >
        <SearchResults products={products} categories={categories} />
      </Suspense>
    </>
  );
}
