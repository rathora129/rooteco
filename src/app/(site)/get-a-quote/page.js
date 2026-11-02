import { Suspense } from 'react';
import PageHero from '@/components/common/PageHero';
import QuoteForm from '@/components/forms/QuoteForm';
import PageLoading from '@/components/common/PageLoading';
import { getProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';

export const metadata = {
  title: 'Get a Quote',
  description:
    'Request a corporate gifting quote from RootEco — tiered pricing, branding mock-ups and a clear production timeline.',
};

export default async function QuotePage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return (
    <>
      <PageHero
        eyebrow="Bulk & corporate enquiries"
        title="Get a Quote"
        subtitle="Tell us what you're planning and we'll curate gifting options with tiered pricing, branding mock-ups and a clear production timeline."
        crumbs={[{ label: 'Get a Quote' }]}
      />
      <Suspense fallback={<PageLoading label="Preparing the form…" />}>
        <QuoteForm products={products} contact={settings.contact} />
      </Suspense>
    </>
  );
}
