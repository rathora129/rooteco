import ClientsModule from '@/components/dashboard/modules/ClientsModule';

export const metadata = { title: 'Customers', robots: { index: false, follow: false } };

export default function ClientsPage() {
  return <ClientsModule />;
}
