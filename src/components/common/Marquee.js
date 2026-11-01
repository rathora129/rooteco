'use client';

import styled, { css } from 'styled-components';

const Track = styled.div`
  display: flex;
  width: max-content;
  animation: marquee ${(p) => p.$duration || '32s'} linear infinite;
  &:hover {
    animation-play-state: paused;
  }
  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
`;

const Wrap = styled.div`
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  ${(p) =>
    p.$fade &&
    css`
      mask-image: none;
    `}
`;

export default function Marquee({ children, duration, fade }) {
  return (
    <Wrap $fade={fade} aria-hidden="false">
      <Track $duration={duration}>
        <div style={{ display: 'flex', flexShrink: 0 }}>{children}</div>
        <div style={{ display: 'flex', flexShrink: 0 }} aria-hidden="true">
          {children}
        </div>
      </Track>
    </Wrap>
  );
}
