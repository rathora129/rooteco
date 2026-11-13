import ProductsIndex from '@/components/products/ProductsIndex';
import { getCategories, getPage, getProducts } from '@/lib/catalog';
import { heroFromSections } from '@/lib/pages/layouts';

export const metadata = {
  title: 'All Corporate Gifts',
  description:
    'Browse the full RootEco catalogue of corporate gifts — welcome kits, premium gift sets, drinkware, tech, bags, apparel and festival hampers.',
};

export default async function ProductsPage() {
  const [products, categories, page] = await Promise.all([
    getProducts(),
    getCategories(),
    getPage('products'),
  ]);
  const hero = heroFromSections(page?.sections, {
    eyebrow: 'The Full Catalogue',
    title: 'Every RootEco gift, in one place',
    subtitle:
      'Browse all products, filter by category, price or occasion, and save your favourites. Every item supports custom branding and bulk pricing.',
  });
  return <ProductsIndex products={products} categories={categories} hero={hero} />;
}
