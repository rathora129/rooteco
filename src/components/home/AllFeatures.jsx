'use client';

import Image from 'next/image';
import styled from 'styled-components';
import {
  BadgeCheck,
  Boxes,
  Gift,
  Headset,
  Heart,
  Play,
  Truck,
} from 'lucide-react';
import { features } from '@/data/navigation';
import { unsplash } from '@/lib/utils';
import Reveal from '@/components/common/Reveal';
import { Container, Eyebrow, Section } from '@/components/common/ui';
import theme from '@/styles/theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 36px;
  }
`;

const Media = styled.div`
  position: relative;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  aspect-ratio: 4 / 3.4;
  img {
    object-fit: cover;
  }
  .play {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(8, 43, 32, 0.25);
    button {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      display: grid;
      place-items: center;
      color: ${theme.colors.forest};
      box-shadow: ${theme.shadow.lift};
      transition: transform 0.3s ease, background 0.3s ease;
      svg {
        fill: currentColor;
      }
      &:hover {
        transform: scale(1.1);
        background: ${theme.colors.gold};
      }
    }
  }
  .tag {
    position: absolute;
    left: 18px;
    bottom: 18px;
    background: rgba(253, 252, 248, 0.94);
    border-radius: ${theme.radius.pill};
    padding: 9px 18px;
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.forest};
  }
`;

const Copy = styled.div`
  h2 {
    color: #fff;
    font-size: clamp(26px, 3.4vw, 40px);
    margin: 12px 0 10px;
  }
  > p {
    color: rgba(255, 255, 255, 0.78);
    margin-bottom: 30px;
    max-width: 480px;
  }
  ${Eyebrow} {
    color: ${theme.colors.goldLight};
  }
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const FCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: ${theme.radius.md};
  padding: 18px;
  color: #fff;
  transition: background 0.25s ease, transform 0.25s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-3px);
  }
  svg {
    color: ${theme.colors.gold};
    margin-bottom: 10px;
  }
  h4 {
    font-family: ${theme.fonts.body};
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.72);
  }
`;

const iconMap = { BadgeCheck, Boxes, Heart, Gift, Truck, Headset };

export default function AllFeatures() {
  return (
    <Section style={{ background: theme.colors.forest }}>
      <Container>
        <Grid>
          <Reveal>
            <Media>
              <Image
                src={unsplash('photo-1522071820081-009f0129c71c', 1100)}
                alt="RootEco gifting program in action (demo visual)"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
              />
              <div className="play">
                <button aria-label="Play demo video" title="Demo preview">
                  <Play size={30} />
                </button>
              </div>
              <span className="tag">Demo preview — video coming soon</span>
            </Media>
          </Reveal>
          <Reveal delay={0.12}>
            <Copy>
              <Eyebrow>All Features</Eyebrow>
              <h2>Everything your gifting program needs</h2>
              <p>One partner for design, branding, packaging and delivery — so your team can focus on the celebration.</p>
              <Cards>
                {features.map((f) => {
                  const Icon = iconMap[f.icon] || Gift;
                  return (
                    <FCard key={f.title}>
                      <Icon size={22} />
                      <h4>{f.title}</h4>
                      <p>{f.description}</p>
                    </FCard>
                  );
                })}
              </Cards>
            </Copy>
          </Reveal>
        </Grid>
      </Container>
    </Section>
  );
}
