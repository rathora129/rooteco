import NewsletterModule from '@/components/dashboard/modules/NewsletterModule';

export const metadata = { title: 'Newsletter', robots: { index: false, follow: false } };

export default function NewsletterPage() {
  return <NewsletterModule />;
}
