'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { ChevronRight } from 'lucide-react';
import theme from '@/styles/theme';
import { Container, Eyebrow } from './ui';

const Wrap = styled.section`
  position: relative;
  overflow: hidden;
  padding: 34px 0 52px;
  background: ${(p) => (p.$forest ? theme.colors.forest : theme.colors.cream)};
  border-bottom: 1px solid ${(p) => (p.$forest ? 'rgba(255,255,255,0.12)' : theme.colors.line)};
  &::before {
    content: '';
    position: absolute;
    width: 460px;
    height: 460px;
    border-radius: 50%;
    right: -140px;
    top: -220px;
    background: ${(p) =>
      p.$forest ? 'rgba(201, 162, 39, 0.16)' : 'rgba(201, 162, 39, 0.14)'};
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    right: 120px;
    bottom: -190px;
    background: ${(p) =>
      p.$forest ? 'rgba(124, 179, 66, 0.14)' : 'rgba(76, 122, 52, 0.08)'};
    pointer-events: none;
  }
`;

const Inner = styled(Container)`
  position: relative;
  z-index: 1;
`;

const Crumbs = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 13px;
  color: ${(p) => (p.$forest ? 'rgba(246,241,231,0.72)' : theme.colors.muted)};
  margin-bottom: 20px;
  a:hover {
    color: ${(p) => (p.$forest ? theme.colors.goldLight : theme.colors.forest)};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  svg {
    width: 14px;
    height: 14px;
    opacity: 0.6;
  }
  .current {
    color: ${(p) => (p.$forest ? '#fff' : theme.colors.ink)};
    font-weight: 600;
  }
`;

const Head = styled.div`
  max-width: 760px;
  ${Eyebrow} {
    color: ${(p) => (p.$forest ? theme.colors.goldLight : theme.colors.green)};
  }
  h1 {
    margin: 12px 0 12px;
    font-size: clamp(32px, 4.6vw, 54px);
    letter-spacing: -0.01em;
    color: ${(p) => (p.$forest ? theme.colors.white : theme.colors.forest)};
  }
  p {
    font-size: 16.5px;
    max-width: 620px;
    color: ${(p) => (p.$forest ? 'rgba(246,241,231,0.78)' : theme.colors.muted)};
  }
`;

const Extra = styled.div`
  margin-top: 24px;
`;

export function Breadcrumbs({ items = [], forest = false }) {
  return (
    <Crumbs $forest={forest} aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {items.map((item) => (
        <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ChevronRight />
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span className="current">{item.label}</span>}
        </span>
      ))}
    </Crumbs>
  );
}

export default function PageHero({ eyebrow, title, subtitle, crumbs, children, forest = false }) {
  return (
    <Wrap $forest={forest}>
      <Inner>
        {crumbs && <Breadcrumbs items={crumbs} forest={forest} />}
        <Head $forest={forest}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </Head>
        {children && <Extra>{children}</Extra>}
      </Inner>
    </Wrap>
  );
}
