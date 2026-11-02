'use client';

import { Suspense } from 'react';
import styled from 'styled-components';
import theme from '@/styles/theme';
import { Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import CtaBand from '@/components/common/CtaBand';
import ProductExplorer, { ExplorerSkeleton } from '@/components/products/ProductExplorer';

const Note = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: ${theme.colors.muted};
  strong {
    color: ${theme.colors.forest};
  }
`;

export default function ProductsIndex({ products = [], categories = [] }) {
  return (
    <>
      <PageHero
        eyebrow="The Full Catalogue"
        title="Every RootEco gift, in one place"
        subtitle="Browse all products, filter by category, price or occasion, and save your favourites. Every item supports custom branding and bulk pricing."
        crumbs={[{ label: 'Products' }]}
      >
        <Note>
          <strong>{products.length} curated gifts</strong> · Welcome kits · Hampers · Tech ·
          Drinkware · Apparel
        </Note>
      </PageHero>

      <Section>
        <Container>
          <Suspense fallback={<ExplorerSkeleton />}>
            <ProductExplorer products={products} categories={categories} />
          </Suspense>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
