'use client';

import styled from 'styled-components';
import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from '@/data/navigation';
import theme from '@/styles/theme';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
    />
  </svg>
);

const Wrap = styled.div`
  position: fixed;
  right: 26px;
  bottom: calc(26px + env(safe-area-inset-bottom, 0px));
  z-index: 150;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  @media (max-width: 640px) {
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    gap: 0;
  }
`;

const Tip = styled.span`
  order: -1;
  position: relative;
  background: ${theme.colors.forest};
  color: #fff;
  font-family: ${theme.fonts.body};
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
  padding: 9px 12px;
  border-radius: 8px;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(11, 61, 46, 0.22);
  opacity: 0;
  visibility: hidden;
  transform: translateX(6px);
  transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s;
  &::after {
    content: '';
    position: absolute;
    right: -3px;
    top: 50%;
    width: 7px;
    height: 7px;
    background: ${theme.colors.forest};
    border-radius: 1px;
    transform: translateY(-50%) rotate(45deg);
  }
  @media (max-width: 640px) {
    display: none;
  }
`;

const Button = styled.a`
  pointer-events: auto;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #25d366;
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 10px 24px rgba(18, 140, 74, 0.35), 0 2px 6px rgba(11, 61, 46, 0.2);
  transition: transform 0.22s cubic-bezier(0.2, 0.7, 0.3, 1), background-color 0.22s ease,
    box-shadow 0.22s ease;
  svg {
    width: 30px;
    height: 30px;
    display: block;
  }
  &:hover {
    background: #1fbe5b;
    transform: translateY(-3px) scale(1.04);
    box-shadow: 0 16px 32px rgba(18, 140, 74, 0.42), 0 3px 8px rgba(11, 61, 46, 0.22);
  }
  &:hover + .tip,
  &:focus-visible + .tip {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
  }
  &:active {
    transform: translateY(-1px) scale(0.98);
  }
  &:focus-visible {
    outline: 3px solid rgba(37, 211, 102, 0.5);
    outline-offset: 3px;
  }
  @media (max-width: 640px) {
    width: 52px;
    height: 52px;
    svg {
      width: 27px;
      height: 27px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover,
    &:active {
      transform: none;
    }
  }
`;

export default function FloatingWhatsAppButton() {
  const digits = String(WHATSAPP_NUMBER || '').replace(/\D/g, '');
  if (!digits) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <Wrap>
      <Button
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with RootEco on WhatsApp (opens in a new tab)"
        title="Chat with us on WhatsApp"
      >
        <WhatsAppIcon />
      </Button>
      <Tip className="tip" aria-hidden="true">
        Chat with us
      </Tip>
    </Wrap>
  );
}
