import CategoriesIndex from '@/components/categories/CategoriesIndex';
import { getCategories } from '@/lib/catalog';

export const metadata = {
  title: 'Shop by Category',
  description:
    'Browse RootEco corporate gifting categories — welcome kits, drinkware, tech, bags, eco-friendly gifts, festival hampers and premium gift sets.',
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesIndex categories={categories} />;
}
