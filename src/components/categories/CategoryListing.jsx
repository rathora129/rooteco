'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import theme from '@/styles/theme';
import { Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import CtaBand from '@/components/common/CtaBand';
import ProductExplorer, { ExplorerSkeleton } from '@/components/products/ProductExplorer';

const Meta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 22px;
  font-size: 13.5px;
  color: ${(p) => (p.$forest ? 'rgba(246,241,231,0.78)' : theme.colors.muted)};
  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: ${(p) => (p.$forest ? theme.colors.goldLight : theme.colors.forest)};
    &:hover {
      text-decoration: underline;
    }
  }
  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${theme.colors.gold};
  }
`;

const Others = styled.div`
  margin-top: 58px;
  padding-top: 30px;
  border-top: 1px solid ${theme.colors.line};
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  h3 {
    font-family: ${theme.fonts.body};
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
  }
  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: ${theme.radius.pill};
    border: 1px solid ${theme.colors.line};
    background: #fff;
    font-size: 13px;
    color: ${theme.colors.ink};
    &:hover {
      background: ${theme.colors.forest};
      border-color: ${theme.colors.forest};
      color: #fff;
    }
  }
`;

export default function CategoryListing({
  category,
  subcategory = null,
  products,
  categories = [],
}) {
  const parentCrumbs = [{ label: 'Categories', href: '/categories' }];
  const crumbs = subcategory
    ? [
        ...parentCrumbs,
        { label: category.name, href: `/categories/${category.slug}` },
        { label: subcategory.name },
      ]
    : [...parentCrumbs, { label: category.name }];

  const title = subcategory ? subcategory.name : category.name;
  const subtitle = subcategory
    ? `Explore ${subcategory.name.toLowerCase()} from our ${category.name} collection — every piece can be branded for your team.`
    : category.description;

  return (
    <>
      <PageHero
        eyebrow={category.tagline}
        title={title}
        subtitle={subtitle}
        crumbs={crumbs}
      >
        <Meta>
          <span>
            <strong>{products.length}</strong> {products.length === 1 ? 'gift' : 'gifts'}
          </span>
          <span className="dot" />
          <span>Custom branding available</span>
          <span className="dot" />
          <span>Pan-India delivery</span>
          {subcategory && (
            <Link href={`/categories/${category.slug}`}>
              <ArrowLeft size={14} /> Back to {category.name}
            </Link>
          )}
        </Meta>
      </PageHero>

      <Section>
        <Container>
          <Suspense fallback={<ExplorerSkeleton />}>
            <ProductExplorer
              products={products}
              categories={categories}
              lockedCategory={category.slug}
              lockedSubcategory={subcategory?.slug || null}
              subcategories={subcategory ? null : category.subcategories}
            />
          </Suspense>

          <Others>
            <h3>Browse other categories</h3>
            <div className="pills">
              {categories
                .filter((c) => c.slug !== category.slug)
                .slice(0, 7)
                .map((c) => (
                  <Link key={c.slug} href={`/categories/${c.slug}`}>
                    {c.name} <ArrowRight size={13} />
                  </Link>
                ))}
            </div>
          </Others>
        </Container>
      </Section>

      <CtaBand
        title={`Need ${category.name.toLowerCase()} in bulk?`}
        text="Share your quantity, branding requirements and delivery city — we'll curate options, share samples and quote a final price."
      />
    </>
  );
}
