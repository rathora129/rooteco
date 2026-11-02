import ProductsIndex from '@/components/products/ProductsIndex';
import { getCategories, getProducts } from '@/lib/catalog';

export const metadata = {
  title: 'All Corporate Gifts',
  description:
    'Browse the full RootEco catalogue of corporate gifts — welcome kits, premium gift sets, drinkware, tech, bags, apparel and festival hampers.',
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <ProductsIndex products={products} categories={categories} />;
}
