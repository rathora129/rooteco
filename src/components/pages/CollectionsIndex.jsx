'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import { Container, Section } from '@/components/common/ui';
import theme from '@/styles/theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Link)`
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  background: ${theme.colors.forest};
  img {
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 30%, rgba(8, 43, 32, 0.9));
  }
  &:hover img {
    transform: scale(1.06);
  }
  .body {
    position: absolute;
    z-index: 2;
    left: 22px;
    right: 22px;
    bottom: 20px;
    color: #fff;
  }
  h2 {
    font-size: 24px;
    margin-bottom: 4px;
  }
  p {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 10px;
  }
  .go {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.goldLight};
  }
`;

export default function CollectionsIndex({ collections = [] }) {
  return (
    <>
      <PageHero
        eyebrow="Collections"
        title="Curated gifting collections"
        subtitle="Thoughtfully assembled edits for festivals, onboarding, celebrations and everyday appreciation."
        crumbs={[{ label: 'Collections' }]}
      />
      <Section>
        <Container>
          {collections.length === 0 ? (
            <p style={{ color: theme.colors.muted, textAlign: 'center' }}>
              Collections are being curated. Browse the{' '}
              <Link href="/products" style={{ color: theme.colors.forest, fontWeight: 600 }}>
                full catalogue
              </Link>{' '}
              in the meantime.
            </p>
          ) : (
            <Grid>
              {collections.map((collection) => (
                <Card key={collection.slug} href={`/collections/${collection.slug}`}>
                  {collection.image && (
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    />
                  )}
                  <div className="body">
                    <h2>{collection.name}</h2>
                    {collection.tagline && <p>{collection.tagline}</p>}
                    <span className="go">
                      Explore collection <ArrowRight size={14} />
                    </span>
                  </div>
                </Card>
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </>
  );
}
