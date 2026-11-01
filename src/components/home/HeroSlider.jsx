'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import heroBanners from '@/data/banners';
import theme from '@/styles/theme';
import { Container } from '@/components/common/ui';

const Hero = styled.section`
  position: relative;
  height: clamp(500px, 76vh, 700px);
  overflow: hidden;
  background: ${theme.colors.forest};
  @media (max-width: 640px) {
    height: clamp(430px, 66vh, 540px);
  }
`;

const Slide = styled(motion.div)`
  position: absolute;
  inset: 0;
  .bg {
    position: absolute;
    inset: 0;
    img {
      object-fit: cover;
    }
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgba(8, 43, 32, 0.88) 0%,
        rgba(8, 43, 32, 0.55) 46%,
        rgba(8, 43, 32, 0.18) 100%
      );
    }
    @media (max-width: 768px) {
      img {
        object-position: 62% center;
      }
      &::after {
        background: linear-gradient(
          180deg,
          rgba(8, 43, 32, 0.5) 0%,
          rgba(8, 43, 32, 0.72) 42%,
          rgba(8, 43, 32, 0.92) 100%
        );
      }
    }
  }
`;

const Content = styled(Container)`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  max-width: ${theme.container};
  padding-top: 24px;
  padding-bottom: 92px;
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${theme.colors.goldLight};
    margin-bottom: 20px;
    &::before {
      content: '';
      width: 34px;
      height: 2px;
      background: ${theme.colors.gold};
    }
  }
  h1 {
    font-size: clamp(34px, 5.6vw, 48px);
    max-width: 640px;
    white-space: pre-line;
    margin-bottom: 20px;
  }
  p {
    font-size: clamp(15px, 1.6vw, 18px);
    max-width: 520px;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 34px;
  }
  .ctas {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }
  @media (max-width: 640px) {
    padding-top: 16px;
    padding-bottom: 76px;
    .kicker {
      margin-bottom: 14px;
    }
    h1 {
      font-size: clamp(30px, 9vw, 40px);
      margin-bottom: 14px;
    }
    p {
      font-size: 14.5px;
      margin-bottom: 24px;
    }
    .ctas {
      gap: 10px;
    }
  }
`;

const GoldBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 15px 30px;
  border-radius: ${theme.radius.pill};
  background: ${theme.colors.gold};
  color: ${theme.colors.forest};
  font-weight: 700;
  font-size: 15px;
  transition: all 0.25s ease;
  &:hover {
    background: ${theme.colors.goldLight};
    transform: translateY(-2px);
  }
  @media (max-width: 640px) {
    padding: 13px 20px;
    font-size: 14px;
  }
`;

const GhostBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 15px 30px;
  border-radius: ${theme.radius.pill};
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  backdrop-filter: blur(6px);
  transition: all 0.25s ease;
  &:hover {
    background: #fff;
    color: ${theme.colors.forest};
  }
  @media (max-width: 640px) {
    padding: 13px 20px;
    font-size: 14px;
  }
`;

const Controls = styled.div`
  position: absolute;
  z-index: 5;
  bottom: 30px;
  left: 0;
  right: 0;
  .inner {
    max-width: ${theme.container};
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  @media (max-width: 640px) {
    bottom: 16px;
    .inner {
      padding: 0 16px;
      gap: 12px;
    }
  }
`;

const Dots = styled.div`
  display: flex;
  gap: 8px;
  button {
    width: 34px;
    height: 4px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.35);
    transition: background 0.25s ease;
    &.active {
      background: ${theme.colors.gold};
    }
  }
`;

const ArrowBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  display: grid;
  place-items: center;
  transition: all 0.25s ease;
  &:hover {
    background: #fff;
    color: ${theme.colors.forest};
  }
  @media (max-width: 640px) {
    width: 38px;
    height: 38px;
  }
`;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  const go = useCallback(
    (dir) => setIndex((i) => (i + dir + heroBanners.length) % heroBanners.length),
    []
  );

  useEffect(() => {
    if (reduce || paused) return undefined;
    const t = setInterval(() => go(1), 6500);
    return () => clearInterval(t);
  }, [go, reduce, paused]);

  const banner = heroBanners[index];

  return (
    <Hero
      aria-label="Featured collections"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <Slide
          key={banner.id}
          initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg">
            <Image
              src={banner.image}
              alt={banner.title.replace(/\n/g, ' ')}
              fill
              priority
              sizes="100vw"
              quality={85}
            />
          </div>
          <Content>
            <motion.span
              className="kicker"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              {banner.kicker}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              {banner.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.7 }}
            >
              {banner.subtitle}
            </motion.p>
            <motion.div
              className="ctas"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <GoldBtn href={banner.primaryCta.link}>
                {banner.primaryCta.label} <ArrowRight size={16} />
              </GoldBtn>
              <GhostBtn href={banner.secondaryCta.link}>{banner.secondaryCta.label}</GhostBtn>
            </motion.div>
          </Content>
        </Slide>
      </AnimatePresence>

      <Controls>
        <div className="inner">
          <Dots>
            {heroBanners.map((b, i) => (
              <button
                key={b.id}
                className={i === index ? 'active' : ''}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </Dots>
          <ArrowBtn onClick={() => go(-1)} aria-label="Previous slide">
            <ChevronLeft size={19} />
          </ArrowBtn>
          <ArrowBtn onClick={() => go(1)} aria-label="Next slide">
            <ChevronRight size={19} />
          </ArrowBtn>
        </div>
      </Controls>
    </Hero>
  );
}
