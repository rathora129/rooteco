'use client';

import { Suspense } from 'react';
import PageHero from '@/components/common/PageHero';
import QuoteForm from '@/components/forms/QuoteForm';
import PageLoading from '@/components/common/PageLoading';

export default function QuotePageContent() {
  return (
    <>
      <PageHero
        eyebrow="Bulk & corporate enquiries"
        title="Get a Quote"
        subtitle="Tell us what you're planning and we'll curate gifting options with tiered pricing, branding mock-ups and a clear production timeline."
        crumbs={[{ label: 'Get a Quote' }]}
      />
      <Suspense fallback={<PageLoading label="Preparing the form…" />}>
        <QuoteForm />
      </Suspense>
    </>
  );
}
