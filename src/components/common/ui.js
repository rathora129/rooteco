'use client';

import styled, { css } from 'styled-components';
import Link from 'next/link';
import theme from '@/styles/theme';

export const Container = styled.div`
  width: 100%;
  max-width: ${theme.container};
  margin: 0 auto;
  padding: 0 24px;
  @media (max-width: 640px) {
    padding: 0 16px;
  }
`;

export const Section = styled.section`
  padding: 88px 0;
  @media (max-width: 768px) {
    padding: 56px 0;
  }
`;

export const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${theme.colors.green};
  &::before {
    content: '';
    width: 26px;
    height: 2px;
    background: ${theme.colors.gold};
    border-radius: 2px;
  }
`;

export const SectionHead = styled.div`
  max-width: 640px;
  margin: 0 auto 48px;
  text-align: center;
  ${Eyebrow} {
    justify-content: center;
  }
  h2 {
    font-size: clamp(28px, 4vw, 44px);
    color: ${theme.colors.forest};
    margin: 14px 0 10px;
  }
  p {
    color: ${theme.colors.muted};
    font-size: 17px;
  }
`;

const buttonVariants = {
  primary: css`
    background: ${theme.colors.forest};
    color: #fff;
    &:hover {
      background: ${theme.colors.emerald};
      transform: translateY(-2px);
      box-shadow: ${theme.shadow.card};
    }
  `,
  gold: css`
    background: ${theme.colors.gold};
    color: ${theme.colors.forest};
    &:hover {
      background: ${theme.colors.goldLight};
      transform: translateY(-2px);
      box-shadow: ${theme.shadow.card};
    }
  `,
  outline: css`
    background: transparent;
    color: ${theme.colors.forest};
    border: 1.5px solid ${theme.colors.forest};
    &:hover {
      background: ${theme.colors.forest};
      color: #fff;
      transform: translateY(-2px);
    }
  `,
  ghost: css`
    background: rgba(255, 255, 255, 0.14);
    color: inherit;
    border: 1.5px solid currentColor;
    backdrop-filter: blur(6px);
    &:hover {
      background: rgba(255, 255, 255, 0.24);
      transform: translateY(-2px);
    }
  `,
};

export const ButtonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 26px;
  border-radius: ${theme.radius.pill};
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  transition: all 0.25s ease;
  white-space: nowrap;
  ${(p) => buttonVariants[p.$variant || 'primary']}
`;

export const Button = styled.button`
  ${ButtonBase}
`;

export const ButtonLink = styled(Link)`
  ${ButtonBase}
`;

export const Badge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: ${(p) =>
    p.$tone === 'gold' ? theme.colors.gold : p.$tone === 'sale' ? theme.colors.sale : theme.colors.green};
  color: ${(p) => (p.$tone === 'gold' ? theme.colors.forest : '#fff')};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: ${theme.radius.pill};
`;

export const Price = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  .now {
    font-size: ${(p) => p.$size || '17px'};
    font-weight: 700;
    color: ${theme.colors.forest};
  }
  .mrp {
    font-size: 14px;
    color: ${theme.colors.muted};
    text-decoration: line-through;
  }
  .off {
    font-size: 12px;
    font-weight: 700;
    color: ${theme.colors.green};
  }
`;
