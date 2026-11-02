import OrdersModule from '@/components/dashboard/modules/OrdersModule';

export const metadata = { title: 'Orders', robots: { index: false, follow: false } };

export default function OrdersPage() {
  return <OrdersModule />;
}
