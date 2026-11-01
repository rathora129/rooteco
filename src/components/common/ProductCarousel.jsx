'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import theme from '@/styles/theme';

const Wrap = styled.div`
  position: relative;
`;

const Track = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc(25% - 15px);
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 6px 2px 18px;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
  > * {
    scroll-snap-align: start;
  }
  @media (max-width: 1024px) {
    grid-auto-columns: calc(33.33% - 14px);
  }
  @media (max-width: 640px) {
    grid-auto-columns: calc(50% - 8px);
    gap: 16px;
  }
`;

const Arrow = styled.button`
  position: absolute;
  top: 30%;
  transform: translateY(-50%);
  z-index: 3;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #fff;
  box-shadow: ${theme.shadow.card};
  display: grid;
  place-items: center;
  color: ${theme.colors.forest};
  transition: all 0.25s ease;
  &:hover {
    background: ${theme.colors.forest};
    color: #fff;
  }
  &.prev {
    left: -14px;
  }
  &.next {
    right: -14px;
  }
  @media (max-width: 640px) {
    display: none;
  }
`;

export default function ProductCarousel({ products }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <Wrap role="region" aria-label="Product carousel">
      {canPrev && (
        <Arrow className="prev" onClick={() => scrollBy(-1)} aria-label="Previous products">
          <ChevronLeft size={20} />
        </Arrow>
      )}
      {canNext && (
        <Arrow className="next" onClick={() => scrollBy(1)} aria-label="Next products">
          <ChevronRight size={20} />
        </Arrow>
      )}
      <Track ref={trackRef} tabIndex={0} aria-label="Scrollable product list">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </Track>
    </Wrap>
  );
}
