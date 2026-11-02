import MarketingModule from '@/components/dashboard/modules/MarketingModule';

export const metadata = { title: 'Marketing & SEO', robots: { index: false, follow: false } };

export default function MarketingPage() {
  return <MarketingModule />;
}
