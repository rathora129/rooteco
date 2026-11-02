'use client';

import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/common/Reveal';
import { Container, Eyebrow, Section, SectionHead } from '@/components/common/ui';
import theme from '@/styles/theme';

const Bg = styled.div`
  background: linear-gradient(${theme.colors.forest}, ${theme.colors.emerald});
  color: #fff;
  ${SectionHead} {
    h2 {
      color: #fff;
    }
    p {
      color: rgba(255, 255, 255, 0.75);
    }
    ${Eyebrow} {
      color: ${theme.colors.goldLight};
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Card = styled(Link)`
  position: relative;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  aspect-ratio: 3 / 3.6;
  display: block;
  img {
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 40%, rgba(8, 43, 32, 0.92));
  }
  &:hover img {
    transform: scale(1.07);
  }
  .body {
    position: absolute;
    z-index: 2;
    left: 18px;
    right: 18px;
    bottom: 18px;
    color: #fff;
    h3 {
      font-size: 19px;
      margin-bottom: 3px;
    }
    p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.82);
      margin-bottom: 10px;
    }
    .go {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: ${theme.colors.goldLight};
    }
  }
`;

export default function FestivalGifting({ collections = [] }) {
  if (!collections.length) return null;
  return (
    <Section as="div" style={{ padding: 0 }}>
      <Bg>
        <Section>
          <Container>
            <Reveal>
              <SectionHead>
                <Eyebrow>Festival Gifting</Eyebrow>
                <h2>Gifts that keep conversation going</h2>
                <p>Festive hampers, Diwali gifting and celebration boxes — crafted for teams and clients.</p>
              </SectionHead>
            </Reveal>
            <Grid>
              {collections.map((col, i) => (
                <Reveal key={col.slug} delay={i * 0.07}>
                  <Card href={col.link}>
                    <Image
                      src={col.image}
                      alt={col.name}
                      fill
                      sizes="(max-width: 900px) 50vw, 25vw"
                    />
                    <div className="body">
                      <h3>{col.name}</h3>
                      <p>{col.tagline}</p>
                      <span className="go">
                        Explore <ArrowRight size={14} />
                      </span>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </Grid>
          </Container>
        </Section>
      </Bg>
    </Section>
  );
}
