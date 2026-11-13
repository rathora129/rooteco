import SeoModule from '@/components/dashboard/modules/SeoModule';

export const metadata = { title: 'SEO & search', robots: { index: false, follow: false } };

export default function SeoPage() {
  return <SeoModule />;
}
