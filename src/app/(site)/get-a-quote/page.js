import { Suspense } from 'react';
import PageHero from '@/components/common/PageHero';
import QuoteForm from '@/components/forms/QuoteForm';
import PageLoading from '@/components/common/PageLoading';
import { getPage, getProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { heroFromSections } from '@/lib/pages/layouts';

export const metadata = {
  title: 'Get a Quote',
  description:
    'Request a corporate gifting quote from RootEco — tiered pricing, branding mock-ups and a clear production timeline.',
};

export default async function QuotePage() {
  const [products, settings, page] = await Promise.all([
    getProducts(),
    getSettings(),
    getPage('get-a-quote'),
  ]);
  const hero = heroFromSections(page?.sections, {
    eyebrow: 'Bulk & corporate enquiries',
    title: 'Get a Quote',
    subtitle:
      "Tell us what you're planning and we'll curate gifting options with tiered pricing, branding mock-ups and a clear production timeline.",
  });
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        crumbs={[{ label: 'Get a Quote' }]}
      />
      <Suspense fallback={<PageLoading label="Preparing the form…" />}>
        <QuoteForm products={products} contact={settings.contact} />
      </Suspense>
    </>
  );
}
