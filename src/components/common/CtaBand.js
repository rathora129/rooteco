'use client';

import styled from 'styled-components';
import { ArrowRight, Gift } from 'lucide-react';
import theme from '@/styles/theme';
import { ButtonLink, Container } from './ui';

const Wrap = styled.section`
  padding: 26px 0 0;
`;

const Band = styled(Container)`
  position: relative;
  overflow: hidden;
  background: ${theme.colors.forest};
  border-radius: ${theme.radius.lg};
  padding: 46px 48px;
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
  color: ${theme.colors.cream};
  &::before {
    content: '';
    position: absolute;
    right: -60px;
    top: -110px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(201, 162, 39, 0.18);
  }
  &::after {
    content: '';
    position: absolute;
    left: 40%;
    bottom: -150px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: rgba(124, 179, 66, 0.14);
  }
  @media (max-width: 640px) {
    padding: 34px 24px;
    gap: 22px;
  }
`;

const Copy = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 260px;
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${theme.colors.goldLight};
    margin-bottom: 10px;
  }
  h2 {
    font-size: clamp(24px, 3vw, 34px);
    margin-bottom: 8px;
  }
  p {
    font-size: 15px;
    color: rgba(246, 241, 231, 0.78);
    max-width: 560px;
  }
`;

const Actions = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  a:last-child {
    color: ${theme.colors.cream};
  }
`;

export default function CtaBand({
  title = 'Planning a bulk order?',
  text = 'Tell us your quantity, budget and timeline. Our gifting team will curate options and send a detailed quotation within one business day.',
  primary = { label: 'Get a Quote', href: '/get-a-quote' },
  secondary = { label: 'Build a Hamper', href: '/build-your-own-hamper' },
}) {
  return (
    <Wrap>
      <Band>
        <Copy>
          <span className="kicker">
            <Gift size={14} /> Corporate gifting, handled
          </span>
          <h2>{title}</h2>
          <p>{text}</p>
        </Copy>
        <Actions>
          <ButtonLink href={primary.href} $variant="gold">
            {primary.label} <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink href={secondary.href} $variant="ghost">
            {secondary.label}
          </ButtonLink>
        </Actions>
      </Band>
    </Wrap>
  );
}
