'use client';

import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowUpRight } from 'lucide-react';
import categories from '@/data/categories';
import Reveal from '@/components/common/Reveal';
import { Container, Eyebrow, Section, SectionHead } from '@/components/common/ui';
import theme from '@/styles/theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const Card = styled(Link)`
  position: relative;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  aspect-ratio: 3 / 3.8;
  display: block;
  background: ${theme.colors.creamDark};
  img {
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 34%, rgba(8, 43, 32, 0.9));
    transition: background 0.4s ease;
  }
  &:hover img {
    transform: scale(1.07);
  }
  .body {
    position: absolute;
    z-index: 2;
    left: 20px;
    right: 20px;
    bottom: 20px;
    color: #fff;
    h3 {
      font-size: 21px;
      margin-bottom: 4px;
    }
    p {
      font-size: 13.5px;
      color: rgba(255, 255, 255, 0.82);
    }
  }
  .arrow {
    position: absolute;
    z-index: 2;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(8px);
    display: grid;
    place-items: center;
    color: #fff;
    transition: all 0.3s ease;
  }
  &:hover .arrow {
    background: ${theme.colors.gold};
    color: ${theme.colors.forest};
    transform: rotate(45deg);
  }
`;

export default function WhatWeDo() {
  const cards = categories.filter((c) => c.homeCard);
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHead>
            <Eyebrow>What We Do</Eyebrow>
            <h2>Every kind of gift, for every occasion</h2>
            <p>From first-day welcome kits to festive hampers — one partner for every gifting moment.</p>
          </SectionHead>
        </Reveal>
        <Grid>
          {cards.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 0.08}>
              <Card href={`/categories/${cat.slug}`}>
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                />
                <span className="arrow">
                  <ArrowUpRight size={18} />
                </span>
                <div className="body">
                  <h3>{cat.name}</h3>
                  <p>{cat.tagline}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
