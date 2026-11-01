'use client';

import styled from 'styled-components';
import { trustedBy } from '@/data/navigation';
import Marquee from '@/components/common/Marquee';
import { Container } from '@/components/common/ui';
import theme from '@/styles/theme';

const Wrap = styled.section`
  padding: 44px 0 40px;
  border-bottom: 1px solid ${theme.colors.line};
  background: #fff;
  h3 {
    text-align: center;
    font-family: ${theme.fonts.body};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
    margin-bottom: 26px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 34px;
  color: ${theme.colors.forest};
  opacity: 0.55;
  filter: grayscale(1);
  transition: opacity 0.25s ease, filter 0.25s ease;
  span.mark {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border: 1.5px solid currentColor;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }
  span.name {
    font-family: ${theme.fonts.display};
    font-size: 19px;
    font-weight: 600;
    white-space: nowrap;
  }
  &:hover {
    opacity: 1;
    filter: none;
  }
`;

export default function TrustedBy() {
  return (
    <Wrap>
      <Container>
        <h3>Trusted By · Demo Placeholder Logos</h3>
      </Container>
      <Marquee duration="36s">
        {trustedBy.map((logo) => (
          <Logo key={logo.name} title={`${logo.name} (demo logo)`}>
            <span className="mark">{logo.initials}</span>
            <span className="name">{logo.name}</span>
          </Logo>
        ))}
      </Marquee>
    </Wrap>
  );
}
