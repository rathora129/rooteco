import ClientDetail from '@/components/dashboard/modules/ClientDetail';

export const metadata = { title: 'Client', robots: { index: false, follow: false } };

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  return <ClientDetail clientId={id} />;
}
