import CheckoutForm from '@/components/cart/CheckoutForm';
import { getPage } from '@/lib/catalog';
import { heroFromSections } from '@/lib/pages/layouts';

export const metadata = {
  title: 'Checkout',
  description:
    'Complete your RootEco corporate gifting order with bank transfer or cash on delivery.',
};

export default async function CheckoutPage() {
  const page = await getPage('checkout');
  const hero = heroFromSections(page?.sections, {
    eyebrow: 'Almost there',
    title: 'Checkout',
    subtitle:
      "Add your details and choose how you'd like to settle your order. We'll confirm stock and share the invoice or delivery slot by email.",
  });
  return <CheckoutForm hero={hero} />;
}
