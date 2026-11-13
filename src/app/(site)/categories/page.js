import CategoriesIndex from '@/components/categories/CategoriesIndex';
import { getCategories, getPage } from '@/lib/catalog';
import { heroFromSections } from '@/lib/pages/layouts';

export const metadata = {
  title: 'Shop by Category',
  description:
    'Browse RootEco corporate gifting categories — welcome kits, drinkware, tech, bags, eco-friendly gifts, festival hampers and premium gift sets.',
};

export default async function CategoriesPage() {
  const [categories, page] = await Promise.all([getCategories(), getPage('categories')]);
  const hero = heroFromSections(page?.sections, {
    eyebrow: 'The RootEco Catalogue',
    title: 'Find the perfect gift for every moment',
    subtitle:
      'Ten curated categories — from first-day welcome kits to festival hampers and executive gift sets. Every product can be branded, personalized and delivered pan India.',
  });
  return <CategoriesIndex categories={categories} hero={hero} />;
}
