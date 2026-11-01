'use client';

import Link from 'next/link';
import Image from 'next/image';
import styled, { css } from 'styled-components';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import categories from '@/data/categories';
import products from '@/data/products';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';

const COLUMN_SLUGS = [
  'welcome-kits',
  'office-essentials',
  'apparel',
  'drinkware',
  'tech-gadgets',
];

const QUICK_SLUGS = [
  'festival-hampers',
  'customized-merchandise',
  'eco-friendly',
  'premium-gift-sets',
  'bags-backpacks',
];

const Panels = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 60;
  background: ${theme.colors.white};
  border-top: 1px solid ${theme.colors.line};
  border-bottom: 1px solid ${theme.colors.line};
  box-shadow: 0 22px 50px rgba(11, 61, 46, 0.14);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s;
  ${(p) =>
    p.$open &&
    css`
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    `}
  @media (max-width: 1024px) {
    display: none;
  }
`;

const Inner = styled.div`
  max-width: ${theme.container};
  margin: 0 auto;
  padding: 32px 24px 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr)) 300px;
  gap: 28px;
  align-items: start;
  @media (max-width: 1180px) {
    grid-template-columns: repeat(5, minmax(0, 1fr)) 250px;
    gap: 20px;
  }
`;

const Col = styled.div`
  min-width: 0;
  padding-right: 14px;
  border-right: 1px solid rgba(227, 220, 203, 0.7);
  &:last-of-type {
    border-right: none;
  }
  h4 {
    margin-bottom: 12px;
    min-height: 34px;
  }
  h4 a {
    font-family: ${theme.fonts.body};
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: ${theme.colors.forest};
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: color 0.2s ease;
    &:hover {
      color: ${theme.colors.green};
    }
  }
  ul {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-height: 83px;
  }
  li a {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 0;
    font-size: 14px;
    line-height: 1.35;
    color: ${theme.colors.muted};
    transition: color 0.18s ease, transform 0.18s ease;
    &:hover {
      color: ${theme.colors.forest};
      transform: translateX(3px);
    }
  }
  .explore {
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 700;
    color: ${theme.colors.green};
    white-space: nowrap;
    transition: gap 0.2s ease, color 0.2s ease;
    &:hover {
      gap: 9px;
      color: ${theme.colors.forest};
    }
  }
`;

const Feature = styled.div`
  min-width: 0;
`;

const FeatureLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: ${theme.fonts.body};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
  margin-bottom: 12px;
  &::before {
    content: '';
    width: 18px;
    height: 2px;
    border-radius: 2px;
    background: ${theme.colors.gold};
  }
`;

const FeatureCard = styled(Link)`
  display: block;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${theme.colors.cream};
  border: 1px solid ${theme.colors.line};
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  .img {
    position: relative;
    display: block;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    img {
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
  }
  .copy {
    display: block;
    padding: 13px 14px 15px;
    background: #fff;
  }
  .cat {
    display: block;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${theme.colors.green};
    margin-bottom: 3px;
  }
  .name {
    display: block;
    font-family: ${theme.fonts.display};
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    color: ${theme.colors.ink};
    margin-bottom: 6px;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    .price {
      font-size: 13.5px;
      font-weight: 700;
      color: ${theme.colors.forest};
    }
    .view {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      font-weight: 700;
      color: ${theme.colors.forest};
      white-space: nowrap;
    }
  }
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.card};
    img {
      transform: scale(1.05);
    }
  }
`;

const Quick = styled.div`
  margin-top: 26px;
  border-top: 1px solid ${theme.colors.line};
  padding: 15px 0 17px;
  display: flex;
  align-items: center;
  gap: 8px 22px;
  flex-wrap: wrap;
  .lead {
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
  }
  a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 500;
    color: ${theme.colors.ink};
    transition: color 0.18s ease;
    &:hover {
      color: ${theme.colors.green};
    }
  }
  .all {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 15px;
    border-radius: ${theme.radius.pill};
    border: 1px solid ${theme.colors.line};
    font-size: 12.5px;
    font-weight: 700;
    color: ${theme.colors.forest};
    &:hover {
      background: ${theme.colors.forest};
      border-color: ${theme.colors.forest};
      color: #fff;
    }
  }
  @media (max-width: 1180px) {
    .all {
      margin-left: 0;
    }
  }
`;

export default function MegaMenu({ open = false, onClose, onEnter, onLeave }) {
  const columns = COLUMN_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug)
  ).filter(Boolean);
  const quick = QUICK_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug)
  ).filter(Boolean);
  const featured = products.find((p) => p.featured) || products[0];

  return (
    <Panels
      id="mega-menu"
      className="mega-panel"
      $open={open}
      aria-hidden={!open}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Inner>
        <Grid>
          {columns.map((cat) => (
            <Col key={cat.slug}>
              <h4>
                <Link href={`/categories/${cat.slug}`} onClick={() => onClose?.()}>
                  {cat.name}
                </Link>
              </h4>
              <ul>
                {cat.subcategories.slice(0, 2).map((sub) => (
                  <li key={sub.slug}>
                    <Link
                      href={`/categories/${cat.slug}/${sub.slug}`}
                      onClick={() => onClose?.()}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                className="explore"
                href={`/categories/${cat.slug}`}
                onClick={() => onClose?.()}
              >
                Explore All <ArrowRight size={13} />
              </Link>
            </Col>
          ))}

          <Feature>
            <FeatureLabel>Featured Gift</FeatureLabel>
            {featured && (
              <FeatureCard href={`/products/${featured.slug}`} onClick={() => onClose?.()}>
                <span className="img">
                  <Image
                    src={featured.images[0]}
                    alt={featured.name}
                    fill
                    sizes="(max-width: 1180px) 250px, 300px"
                  />
                </span>
                <span className="copy">
                  <span className="cat">{featured.type}</span>
                  <span className="name">{featured.name}</span>
                  <span className="row">
                    <span className="price">{formatINR(featured.price)}</span>
                    <span className="view">
                      View Product <ArrowUpRight size={13} />
                    </span>
                  </span>
                </span>
              </FeatureCard>
            )}
          </Feature>
        </Grid>

        <Quick>
          <span className="lead">More to explore</span>
          {quick.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              onClick={() => onClose?.()}
            >
              {cat.name}
            </Link>
          ))}
          <Link className="all" href="/categories" onClick={() => onClose?.()}>
            All Categories <ArrowRight size={13} />
          </Link>
        </Quick>
      </Inner>
    </Panels>
  );
}
