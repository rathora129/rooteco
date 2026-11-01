'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';
import { Badge, Price } from './ui';

const Card = styled.article`
  position: relative;
  min-width: 0;
  height: 100%;
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: ${theme.shadow.lift};
  }
`;

const ImageWrap = styled(Link)`
  position: relative;
  aspect-ratio: 1 / 1;
  background: ${theme.colors.cream};
  overflow: hidden;
  display: block;
  flex-shrink: 0;
  img {
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  ${Card}:hover & img {
    transform: scale(1.06);
  }
`;

const WishBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: grid;
  place-items: center;
  color: ${theme.colors.forest};
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.12);
  }
  &.active {
    color: ${theme.colors.sale};
    svg {
      fill: ${theme.colors.sale};
    }
  }
`;

const Body = styled.div`
  padding: 16px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  @media (max-width: 640px) {
    padding: 12px;
    gap: 5px;
  }
  @media (max-width: 360px) {
    padding: 10px;
  }
  @media (max-width: 640px) {
    ${Price} {
      gap: 5px;
      .now {
        font-size: 15px;
      }
      .mrp {
        font-size: 12px;
      }
      .off {
        font-size: 11px;
      }
    }
  }
  @media (max-width: 420px) {
    ${Price} {
      row-gap: 0;
      .off {
        flex-basis: 100%;
      }
    }
  }
`;

const Cat = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${theme.colors.green};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Name = styled(Link)`
  font-family: ${theme.fonts.display};
  font-size: 17px;
  font-weight: 600;
  color: ${theme.colors.ink};
  line-height: 1.3;
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  &:hover {
    color: ${theme.colors.forest};
  }
  @media (max-width: 640px) {
    font-size: 14.5px;
    min-height: 2.6em;
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: ${theme.colors.muted};
  white-space: nowrap;
  svg {
    color: ${theme.colors.gold};
    fill: ${theme.colors.gold};
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: stretch;
  margin-top: auto;
  padding-top: 12px;
`;

const AddBtn = styled.button`
  min-width: 0;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border-radius: ${theme.radius.pill};
  background: ${theme.colors.forest};
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition: background 0.25s ease, transform 0.2s ease;
  svg {
    flex-shrink: 0;
  }
  &:hover {
    background: ${theme.colors.green};
  }
  &:active {
    transform: scale(0.98);
  }
  @media (max-width: 640px) {
    height: 40px;
    padding: 0 8px;
    font-size: 12px;
    gap: 5px;
    svg {
      display: none;
    }
  }
  @media (max-width: 360px) {
    padding: 0 6px;
    font-size: 11.5px;
  }
`;

const QuoteBtn = styled(Link)`
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border-radius: ${theme.radius.pill};
  border: 1.5px solid ${theme.colors.forest};
  color: ${theme.colors.forest};
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition: all 0.25s ease;
  &:hover {
    background: ${theme.colors.forest};
    color: #fff;
  }
  @media (max-width: 640px) {
    height: 40px;
    padding: 0 9px;
    font-size: 12px;
  }
  @media (max-width: 360px) {
    padding: 0 6px;
    font-size: 11.5px;
  }
`;

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const wished = wishlist.includes(product.slug);
  const off = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <Card>
      <ImageWrap href={`/products/${product.slug}`} aria-label={product.name}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.badge && (
          <Badge $tone={product.badge === 'Premium' || product.badge === 'Festive' ? 'gold' : 'green'}>
            {product.badge}
          </Badge>
        )}
      </ImageWrap>
      <WishBtn
        className={wished ? 'active' : ''}
        onClick={() => toggleWishlist(product.slug)}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={wished}
      >
        <Heart size={17} />
      </WishBtn>
      <Body>
        <Cat>{product.type}</Cat>
        <Name href={`/products/${product.slug}`}>{product.name}</Name>
        <Rating title="Demo rating">
          <Star />
          {product.rating} ({product.reviewsCount}) · demo
        </Rating>
        <Price>
          <span className="now">{formatINR(product.price)}</span>
          {off > 0 && <span className="mrp">{formatINR(product.mrp)}</span>}
          {off > 0 && <span className="off">{off}% off</span>}
        </Price>
        <Actions>
          <AddBtn onClick={() => addToCart(product)}>
            <ShoppingBag size={15} /> Add to Cart
          </AddBtn>
          <QuoteBtn href={`/get-a-quote?product=${product.slug}`}>Quote</QuoteBtn>
        </Actions>
      </Body>
    </Card>
  );
}
