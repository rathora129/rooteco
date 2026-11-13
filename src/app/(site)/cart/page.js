import CartPage from '@/components/cart/CartPage';
import { getPage, getProducts } from '@/lib/catalog';
import { heroFromSections } from '@/lib/pages/layouts';

export const metadata = {
  title: 'Gift Cart',
  description: 'Review your RootEco gift selections, update quantities and proceed to checkout.',
};

export default async function CartRoute() {
  const [recommendations, page] = await Promise.all([
    getProducts({ bestSeller: true, limit: 6 }),
    getPage('cart'),
  ]);
  const hero = heroFromSections(page?.sections, {
    eyebrow: 'Your selections',
    title: 'Your Gift Cart',
    subtitle:
      'Review your gifts, adjust quantities and proceed to checkout. Bulk quantities? Request a quote for tiered pricing.',
  });
  return <CartPage recommendations={recommendations} hero={hero} />;
}
