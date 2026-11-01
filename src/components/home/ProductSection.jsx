'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';
import ProductCarousel from '@/components/common/ProductCarousel';
import Reveal from '@/components/common/Reveal';
import { Container, Eyebrow, Section } from '@/components/common/ui';
import theme from '@/styles/theme';

const HeadRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 40px;
  .txt {
    max-width: 560px;
    h2 {
      font-size: clamp(26px, 3.4vw, 40px);
      color: ${theme.colors.forest};
      margin: 12px 0 8px;
    }
    p {
      color: ${theme.colors.muted};
      font-size: 16px;
    }
  }
  .view {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.forest};
    white-space: nowrap;
    padding-bottom: 6px;
    &:hover {
      gap: 11px;
    }
    transition: gap 0.2s ease;
  }
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export default function ProductSection({
  eyebrow,
  title,
  subtitle,
  products,
  viewAllLink = '/products',
  cream = false,
}) {
  return (
    <Section style={cream ? { background: theme.colors.cream } : undefined}>
      <Container>
        <Reveal>
          <HeadRow>
            <div className="txt">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h2>{title}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
            <Link className="view" href={viewAllLink}>
              View All <ArrowRight size={15} />
            </Link>
          </HeadRow>
        </Reveal>
        <Reveal delay={0.1}>
          <ProductCarousel products={products} />
        </Reveal>
      </Container>
    </Section>
  );
}
