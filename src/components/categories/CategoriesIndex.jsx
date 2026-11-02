'use client';

import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';
import theme from '@/styles/theme';
import { Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import CtaBand from '@/components/common/CtaBand';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadow.card};
  }
`;

const Media = styled(Link)`
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: ${theme.colors.cream};
  img {
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  ${Card}:hover & img {
    transform: scale(1.06);
  }
  .count {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    background: rgba(253, 252, 248, 0.94);
    color: ${theme.colors.forest};
    font-size: 11.5px;
    font-weight: 700;
    padding: 5px 11px;
    border-radius: ${theme.radius.pill};
  }
`;

const Body = styled.div`
  padding: 22px 22px 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
  h2 {
    font-size: 24px;
    margin-bottom: 4px;
    a:hover {
      color: ${theme.colors.green};
    }
  }
  .tagline {
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${theme.colors.green};
    margin-bottom: 10px;
  }
  > p {
    font-size: 14.5px;
    color: ${theme.colors.muted};
    margin-bottom: 16px;
  }
`;

const Subs = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  margin-bottom: 20px;
  a {
    font-size: 12.5px;
    color: ${theme.colors.ink};
    background: ${theme.colors.cream};
    border: 1px solid ${theme.colors.line};
    padding: 4px 10px;
    border-radius: ${theme.radius.pill};
    transition: all 0.2s ease;
    &:hover {
      background: ${theme.colors.forest};
      border-color: ${theme.colors.forest};
      color: #fff;
    }
  }
`;

const Explore = styled(Link)`
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.forest};
  transition: gap 0.2s ease;
  &:hover {
    gap: 12px;
    color: ${theme.colors.green};
  }
`;

export default function CategoriesIndex({ categories = [] }) {
  return (
    <>
      <PageHero
        eyebrow="The RootEco Catalogue"
        title="Find the perfect gift for every moment"
        subtitle="Ten curated categories — from first-day welcome kits to festival hampers and executive gift sets. Every product can be branded, personalized and delivered pan India."
        crumbs={[{ label: 'Categories' }]}
      />

      <Section>
        <Container>
          <Grid>
            {categories.map((cat) => {
              const count = cat.productCount || 0;
              return (
                <Card key={cat.slug}>
                  <Media href={`/categories/${cat.slug}`} aria-label={cat.name}>
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 620px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {count > 0 && (
                      <span className="count">
                        {count} {count === 1 ? 'gift' : 'gifts'}
                      </span>
                    )}
                  </Media>
                  <Body>
                    <span className="tagline">{cat.tagline}</span>
                    <h2>
                      <Link href={`/categories/${cat.slug}`}>{cat.name}</Link>
                    </h2>
                    <p>{cat.description}</p>
                    <Subs aria-label={`${cat.name} collections`}>
                      {cat.subcategories.map((sub) => (
                        <li key={sub.slug}>
                          <Link href={`/categories/${cat.slug}/${sub.slug}`}>{sub.name}</Link>
                        </li>
                      ))}
                    </Subs>
                    <Explore href={`/categories/${cat.slug}`}>
                      Shop {cat.name} <ArrowRight size={15} />
                    </Explore>
                  </Body>
                </Card>
              );
            })}
          </Grid>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
