'use client';

import styled from 'styled-components';
import { Building2, Leaf, Truck } from 'lucide-react';
import theme from '@/styles/theme';

const Bar = styled.div`
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  font-size: 12.5px;
  letter-spacing: 0.04em;
  overflow: hidden;
`;

const Inner = styled.div`
  max-width: ${theme.container};
  margin: 0 auto;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }
  svg {
    width: 13px;
    height: 13px;
    color: ${theme.colors.gold};
  }
  .msg {
    font-weight: 500;
  }
  .meta {
    color: rgba(246, 241, 231, 0.75);
  }
  @media (max-width: 768px) {
    gap: 14px;
    .meta {
      display: none;
    }
  }
`;

export default function AnnouncementBar({
  message = 'Thoughtful Gifting. Made Effortless.',
  active = true,
}) {
  if (!active || !message) return null;
  return (
    <Bar>
      <Inner>
        <span className="msg">{message}</span>
        <span className="meta">
          <Truck /> Pan India Delivery
        </span>
        <span className="meta">
          <Leaf /> Custom Branding
        </span>
        <span className="meta">
          <Building2 /> Bulk Corporate Orders
        </span>
      </Inner>
    </Bar>
  );
}
