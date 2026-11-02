import CartPage from '@/components/cart/CartPage';
import { getProducts } from '@/lib/catalog';

export const metadata = {
  title: 'Gift Cart',
  description: 'Review your RootEco gift selections, update quantities and proceed to checkout.',
};

export default async function CartRoute() {
  const recommendations = await getProducts({ bestSeller: true, limit: 6 });
  return <CartPage recommendations={recommendations} />;
}
