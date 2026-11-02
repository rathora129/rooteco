'use client';

import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowRight, PackagePlus, Sparkles } from 'lucide-react';
import { unsplash } from '@/lib/utils';
import Reveal from '@/components/common/Reveal';
import { Container, Section } from '@/components/common/ui';
import theme from '@/styles/theme';

const Banner = styled.div`
  position: relative;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  min-height: 380px;
  display: flex;
  align-items: center;
  background: ${theme.colors.emerald};
  color: #fff;
  img.bg {
    object-fit: cover;
    opacity: 0.32;
  }
  .inner {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 40px;
    align-items: center;
    width: 100%;
    @media (max-width: 860px) {
      grid-template-columns: 1fr;
    }
  }
`;

const Copy = styled.div`
  padding: 56px 0 56px 54px;
  @media (max-width: 860px) {
    padding: 44px 24px 10px;
  }
  .k {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${theme.colors.goldLight};
    margin-bottom: 14px;
  }
  h2 {
    font-size: clamp(28px, 3.6vw, 44px);
    margin-bottom: 12px;
  }
  p {
    color: rgba(255, 255, 255, 0.82);
    max-width: 460px;
    margin-bottom: 28px;
  }
  .ctas {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
`;

const Gold = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${theme.colors.gold};
  color: ${theme.colors.forest};
  font-weight: 700;
  padding: 14px 26px;
  border-radius: ${theme.radius.pill};
  transition: all 0.25s ease;
  &:hover {
    background: ${theme.colors.goldLight};
    transform: translateY(-2px);
  }
`;

const Ghost = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  color: #fff;
  font-weight: 600;
  padding: 14px 26px;
  border-radius: ${theme.radius.pill};
  transition: all 0.25s ease;
  &:hover {
    background: #fff;
    color: ${theme.colors.forest};
  }
`;

const Visual = styled.div`
  position: relative;
  height: 320px;
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 8px;
    transform: translateX(-50%);
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 30%, #fffdf7, #f0e5d0);
    box-shadow: 0 24px 34px rgba(0, 0, 0, 0.3);
  }
  @media (max-width: 860px) {
    height: 240px;
    &::before {
      width: 220px;
      height: 220px;
    }
  }
  img {
    object-fit: contain;
    object-position: bottom;
    filter: drop-shadow(0 24px 34px rgba(0, 0, 0, 0.35));
  }
`;

export default function HamperBanner() {
  return (
    <Section>
      <Container>
        <Reveal>
          <Banner>
            <Image
              className="bg"
              src={unsplash('photo-1549465220-1a8b9238cd48', 1600)}
              alt=""
              fill
              sizes="100vw"
              aria-hidden="true"
            />
            <div className="inner">
              <Copy>
                <span className="k">
                  <Sparkles size={14} /> Make it yours
                </span>
                <h2>Build Your Own Hamper</h2>
                <p>
                  Pick a box, choose the products, add your branding — and we curate, pack and
                  deliver a hamper that feels unmistakably yours.
                </p>
                <div className="ctas">
                  <Gold href="/build-your-own-hamper">
                    <PackagePlus size={17} /> Select Products
                  </Gold>
                  <Ghost href="/build-your-own-hamper">
                    Customize Your Hamper <ArrowRight size={15} />
                  </Ghost>
                </div>
              </Copy>
              <Visual>
                <Image
                  src="/images/rooteco-logo.png"
                  alt="RootEco hamper branding"
                  fill
                  sizes="(max-width: 860px) 100vw, 40vw"
                />
              </Visual>
            </div>
          </Banner>
        </Reveal>
      </Container>
    </Section>
  );
}
