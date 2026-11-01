import CartPage from '@/components/cart/CartPage';

export const metadata = {
  title: 'Gift Cart',
  description: 'Review your RootEco gift selections, update quantities and proceed to checkout.',
};

export default function CartRoute() {
  return <CartPage />;
}
