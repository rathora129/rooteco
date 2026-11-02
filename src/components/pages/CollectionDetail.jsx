'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import ProductCard from '@/components/common/ProductCard';
import { Container, Section, ButtonLink } from '@/components/common/ui';
import theme from '@/styles/theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 22px;
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 26px;
  p {
    color: ${theme.colors.muted};
    font-size: 14px;
  }
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: ${theme.colors.forest};
  &:hover {
    text-decoration: underline;
  }
`;

export default function CollectionDetail({ collection, products = [] }) {
  return (
    <>
      <PageHero
        eyebrow="Collection"
        title={collection.name}
        subtitle={collection.description || collection.tagline || undefined}
        crumbs={[{ label: 'Collections', href: '/collections' }, { label: collection.name }]}
        forest
      />
      <Section>
        <Container>
          <Top>
            <p>
              {products.length} {products.length === 1 ? 'gift' : 'gifts'} in this collection
              {collection.productCount ? ` · ${collection.productCount} total` : ''}
            </p>
            <Back href="/collections"><ArrowLeft size={15} /> All collections</Back>
          </Top>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: theme.colors.muted, marginBottom: 18 }}>
                This collection is being restocked. Explore the full catalogue for similar gifts.
              </p>
              <ButtonLink href="/products">Browse all gifts</ButtonLink>
            </div>
          ) : (
            <Grid>
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </>
  );
}
