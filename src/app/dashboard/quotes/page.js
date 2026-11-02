import QuotesModule from '@/components/dashboard/modules/QuotesModule';

export const metadata = { title: 'Quotes', robots: { index: false, follow: false } };

export default function QuotesPage() {
  return <QuotesModule />;
}
