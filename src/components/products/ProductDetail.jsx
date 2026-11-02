'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  BadgeCheck,
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  Quote,
  ShoppingBag,
  Star,
  Truck,
  ZoomIn,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';
import { Badge, Button, ButtonLink, Container, Price, Section } from '@/components/common/ui';
import { Breadcrumbs } from '@/components/common/PageHero';
import FAQAccordion from '@/components/common/FAQAccordion';
import ProductCarousel from '@/components/common/ProductCarousel';

const COLOR_HEX = {
  'forest green': '#0B3D2E',
  navy: '#1F2A44',
  charcoal: '#3A3A38',
  black: '#161616',
  white: '#FFFFFF',
  tan: '#C19A6B',
  sand: '#D7C7A8',
  'matte black': '#242423',
  ivory: '#F4EEE0',
  'dark brown': '#4A3124',
  'festive gold': '#C9A227',
  maroon: '#6E1E28',
  kraft: '#B9986A',
  'matte white': '#F2F0EA',
  sage: '#A3B18A',
  terracotta: '#B75B3D',
  'heather grey': '#B9BDC0',
  silver: '#C0C4C7',
  natural: '#D9CBB2',
  'natural bamboo': '#CBB389',
  oak: '#C7A97B',
  walnut: '#6B4A34',
  amber: '#B7772C',
  frosted: '#E7E9E4',
  'sage & cork': '#A3B18A',
  terrazzo: '#C9C2B4',
  forest: '#0B3D2E',
  festive: '#9A2E2E',
  'navy & gold': '#1F2A44',
  'ivory & gold': '#EFE4C6',
  'black / gold': '#242423',
  'navy / silver': '#1F2A44',
};

function swatch(color) {
  const parts = color.split(/[/&]/).map((s) => s.trim().toLowerCase());
  const hexes = parts.map((part) => {
    if (COLOR_HEX[part]) return COLOR_HEX[part];
    const entry = Object.entries(COLOR_HEX).find(([key]) => part.includes(key));
    return entry ? entry[1] : '#D8D0BD';
  });
  return hexes.length > 1
    ? `linear-gradient(135deg, ${hexes[0]} 50%, ${hexes[1]} 50%)`
    : hexes[0];
}

const Top = styled.div`
  padding-top: 26px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.08fr 1fr;
  grid-template-areas:
    'gallery info'
    'below info';
  column-gap: 56px;
  row-gap: 48px;
  align-items: start;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'gallery'
      'info'
      'below';
    gap: 34px;
  }
`;

const Gallery = styled.div`
  grid-area: gallery;
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 14px;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Thumbs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  @media (max-width: 560px) {
    flex-direction: row;
    order: 2;
  }
`;

const Thumb = styled.button`
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: ${theme.radius.sm};
  overflow: hidden;
  border: 2px solid ${(p) => (p.$active ? theme.colors.forest : 'transparent')};
  background: ${theme.colors.cream};
  opacity: ${(p) => (p.$active ? 1 : 0.7)};
  transition: opacity 0.2s ease, border-color 0.2s ease;
  img {
    object-fit: cover;
  }
  &:hover {
    opacity: 1;
  }
  @media (max-width: 560px) {
    width: 72px;
    flex-shrink: 0;
  }
`;

const Main = styled.div`
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  background: ${theme.colors.cream};
  cursor: zoom-in;
  img {
    object-fit: cover;
    will-change: transform;
  }
  .hint {
    position: absolute;
    right: 14px;
    bottom: 14px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(253, 252, 248, 0.94);
    color: ${theme.colors.forest};
    font-size: 12px;
    font-weight: 600;
    padding: 7px 12px;
    border-radius: ${theme.radius.pill};
    pointer-events: none;
  }
  .wish {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 3;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(253, 252, 248, 0.94);
    display: grid;
    place-items: center;
    color: ${theme.colors.forest};
    &.active {
      color: ${theme.colors.sale};
      svg {
        fill: ${theme.colors.sale};
      }
    }
  }
  @media (max-width: 900px) {
    cursor: default;
    .hint {
      display: none;
    }
  }
`;

const Info = styled.div`
  grid-area: info;
  position: sticky;
  top: 96px;
  align-self: start;
  max-height: calc(100vh - 112px);
  max-height: calc(100dvh - 112px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: ${theme.colors.line} transparent;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.line};
    border-radius: 999px;
  }
  @media (max-width: 960px) {
    position: static;
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
  .type {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${theme.colors.green};
    margin-bottom: 10px;
  }
  h1 {
    font-size: clamp(28px, 3.4vw, 42px);
    color: ${theme.colors.forest};
    margin-bottom: 12px;
  }
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13.5px;
  color: ${theme.colors.muted};
  margin-bottom: 18px;
  .stars {
    display: inline-flex;
    gap: 2px;
    color: ${theme.colors.gold};
    svg {
      fill: ${theme.colors.gold};
      width: 15px;
      height: 15px;
    }
  }
  .stock {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: ${theme.colors.green};
    font-weight: 600;
  }
  .stock::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${theme.colors.leaf};
  }
`;

const Desc = styled.p`
  color: ${theme.colors.muted};
  font-size: 15.5px;
  margin-top: 22px;
  padding-bottom: 22px;
  border-bottom: 1px solid ${theme.colors.line};
`;

const Option = styled.div`
  margin-top: 20px;
  .label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
    margin-bottom: 10px;
    span {
      font-weight: 500;
      letter-spacing: 0;
      text-transform: none;
      color: ${theme.colors.ink};
    }
  }
`;

const Swatches = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Swatch = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: ${theme.radius.pill};
  border: 1.5px solid ${(p) => (p.$active ? theme.colors.forest : theme.colors.line)};
  font-size: 13px;
  color: ${theme.colors.ink};
  transition: border-color 0.2s ease;
  .dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background: ${(p) => p.$swatch};
  }
  &:hover {
    border-color: ${theme.colors.forest};
  }
`;

const Variants = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  button {
    padding: 9px 16px;
    border-radius: ${theme.radius.pill};
    border: 1.5px solid ${(p) => (p.$active ? theme.colors.forest : theme.colors.line)};
    background: ${(p) => (p.$active ? theme.colors.forest : '#fff')};
    color: ${(p) => (p.$active ? '#fff' : theme.colors.ink)};
    font-size: 13.5px;
    transition: all 0.2s ease;
    &:hover {
      border-color: ${theme.colors.forest};
    }
  }
`;

const BuyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  flex-wrap: wrap;
  @media (max-width: 560px) {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
  }
`;

const Qty = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1.5px solid ${theme.colors.line};
  border-radius: ${theme.radius.pill};
  overflow: hidden;
  button {
    width: 40px;
    height: 44px;
    display: grid;
    place-items: center;
    color: ${theme.colors.forest};
    &:hover {
      background: ${theme.colors.cream};
    }
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }
  span {
    width: 38px;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
  }
`;

const AddBtn = styled(Button)`
  flex: 1;
  min-width: 180px;
  height: 48px;
  @media (max-width: 560px) {
    min-width: 0;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const BuyNowBtn = styled(Button)`
  height: 48px;
  min-width: 140px;
  @media (max-width: 560px) {
    min-width: 112px;
  }
`;

const QuoteLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  margin-top: 10px;
  border-radius: ${theme.radius.pill};
  border: 1.5px solid ${theme.colors.forest};
  font-size: 14.5px;
  font-weight: 600;
  color: ${theme.colors.forest};
  white-space: nowrap;
  transition: all 0.25s ease;
  &:hover {
    background: ${theme.colors.forest};
    color: #fff;
  }
`;

const Perks = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
  padding: 18px 0;
  border-top: 1px solid ${theme.colors.line};
  border-bottom: 1px solid ${theme.colors.line};
  li {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    font-size: 13px;
    color: ${theme.colors.muted};
    svg {
      color: ${theme.colors.green};
      flex-shrink: 0;
      margin-top: 2px;
    }
    strong {
      display: block;
      color: ${theme.colors.ink};
      font-weight: 600;
    }
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Controls = styled.div`
  @media (min-width: 961px) and (max-width: 1360px) {
    /* keep the fixed WhatsApp button clear of the purchase controls */
    padding-right: 74px;
  }
`;

const Accordion = styled.div`
  margin-top: 8px;
`;

const Item = styled.div`
  border-bottom: 1px solid ${theme.colors.line};
  button.head {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 17px 2px;
    font-size: 15px;
    font-weight: 600;
    color: ${theme.colors.ink};
    text-align: left;
    svg {
      color: ${theme.colors.green};
      transition: transform 0.25s ease;
      flex-shrink: 0;
    }
  }
  &.open button.head svg {
    transform: rotate(180deg);
  }
  .body {
    padding: 0 2px 18px;
    font-size: 14.5px;
    color: ${theme.colors.muted};
  }
`;

const SpecTable = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 18px;
  font-size: 14px;
  dt {
    color: ${theme.colors.muted};
  }
  dd {
    color: ${theme.colors.ink};
    font-weight: 500;
  }
`;

const CheckList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 7px;
  li {
    display: flex;
    gap: 8px;
    align-items: center;
    svg {
      color: ${theme.colors.green};
    }
  }
`;

const Bulk = styled.div`
  margin-top: 24px;
  background: ${theme.colors.cream};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  h4 {
    font-family: ${theme.fonts.body};
    font-size: 14px;
    margin-bottom: 2px;
  }
  p {
    font-size: 13px;
    color: ${theme.colors.muted};
  }
  a {
    margin-left: auto;
    font-size: 13.5px;
    font-weight: 600;
    color: ${theme.colors.forest};
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1.5px solid ${theme.colors.forest};
    white-space: nowrap;
  }
`;

const Below = styled.div`
  grid-area: below;
  display: grid;
  grid-template-columns: 1fr;
  gap: 34px;
  align-items: start;
  h2 {
    font-size: 26px;
    color: ${theme.colors.forest};
    margin-bottom: 16px;
  }
`;

export default function ProductDetail({
  product,
  related,
  categories = [],
  faqs = [],
}) {
  const router = useRouter();
  const { addToCart, wishlist, toggleWishlist, setCartOpen } = useStore();
  const [active, setActive] = useState(0);
  const [color, setColor] = useState(product.colors?.[0]);
  const [variant, setVariant] = useState(product.variants?.[0]);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [openSection, setOpenSection] = useState('description');

  useEffect(() => {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'product_view',
        path: `/products/${product.slug}`,
        productId: product.id,
      }),
    }).catch(() => {});
  }, [product.id, product.slug]);

  const cat = useMemo(
    () => categories.find((c) => c.slug === product.category),
    [categories, product.category]
  );
  const sub = cat?.subcategories.find((s) => s.slug === product.subcategory);
  const off = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  const wished = wishlist.includes(product.slug);
  const leadTime = product.specifications?.['Lead time'];

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const buyNow = () => {
    addToCart(product, { color, variant, qty });
    setCartOpen(false);
    router.push('/checkout');
  };

  const sections = [
    {
      id: 'description',
      label: 'Description',
      body: (
        <>
          <p style={{ marginBottom: 12 }}>{product.description}</p>
          <p>
            Every unit can be branded with your logo and packed with a personalized card.
            {leadTime ? ` Standard lead time is ${leadTime.toLowerCase()}.` : ''} Perfect for{' '}
            {product.occasions.join(', ').toLowerCase()}.
          </p>
        </>
      ),
    },
    {
      id: 'specs',
      label: 'Specifications',
      body: (
        <SpecTable>
          {Object.entries(product.specifications || {}).map(([key, value]) => (
            <div key={key} style={{ display: 'contents' }}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <dt>Category</dt>
          <dd>{cat?.name}</dd>
          <dt>Collection</dt>
          <dd>{sub?.name}</dd>
        </SpecTable>
      ),
    },
    {
      id: 'customization',
      label: 'Customization & Branding',
      body: (
        <CheckList>
          {product.customization.map((item) => (
            <li key={item}>
              <Check size={16} /> {item}
            </li>
          ))}
          <li>
            <Check size={16} /> Digital mock-up shared for approval before production
          </li>
        </CheckList>
      ),
    },
    {
      id: 'delivery',
      label: 'Delivery & Returns',
      body: (
        <>
          <p style={{ marginBottom: 10 }}>
            Dispatched pan-India with tracked shipping. Single-address and multi-address
            delivery are both supported — share a recipient sheet and we handle the rest.
          </p>
          <p>
            Bulk orders follow our PO → PI → sample approval → production → delivery flow.
            See our{' '}
            <Link
              href="/shipping-and-refund-policy"
              style={{ color: theme.colors.forest, fontWeight: 600 }}
            >
              shipping and refund policy
            </Link>{' '}
            for details.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <Top>
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Categories', href: '/categories' },
              { label: cat?.name || 'Shop', href: cat ? `/categories/${cat.slug}` : '/products' },
              ...(sub
                ? [
                    {
                      label: sub.name,
                      href: `/categories/${product.category}/${product.subcategory}`,
                    },
                  ]
                : []),
              { label: product.name },
            ]}
          />
        </Container>
      </Top>

      <Section style={{ paddingTop: 28 }}>
        <Container>
          <Grid>
            <Gallery>
              <Thumbs>
                {product.images.map((src, i) => (
                  <Thumb
                    key={src}
                    $active={active === i}
                    onClick={() => {
                      setActive(i);
                      setZoom(false);
                    }}
                    aria-label={`View image ${i + 1} of ${product.name}`}
                  >
                    <Image src={src} alt="" fill sizes="84px" />
                  </Thumb>
                ))}
              </Thumbs>
              <Main
                onMouseEnter={() => setZoom(true)}
                onMouseMove={onMove}
                onMouseLeave={() => setZoom(false)}
              >
                {product.badge && (
                  <Badge $tone={product.badge === 'Premium' || product.badge === 'Festive' ? 'gold' : 'green'}>
                    {product.badge}
                  </Badge>
                )}
                <Image
                  src={product.images[active]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 960px) 100vw, 50vw"
                  style={{
                    transform: zoom ? 'scale(1.9)' : 'scale(1)',
                    transformOrigin: origin,
                    transition: 'transform 0.25s ease',
                  }}
                />
                <button
                  className={`wish ${wished ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product.slug)}
                  aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={19} />
                </button>
                <span className="hint">
                  <ZoomIn size={14} /> Hover to zoom
                </span>
              </Main>
            </Gallery>

            <Info>
              <span className="type">
                {cat?.name} · {sub?.name}
              </span>
              <h1>{product.name}</h1>
              <RatingRow>
                <span className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} style={{ opacity: i < Math.round(product.rating) ? 1 : 0.28 }} />
                  ))}
                </span>
                <span>
                  {product.rating} · {product.reviewsCount} demo reviews
                </span>
                <span className="stock">In stock</span>
              </RatingRow>
              <Price $size="26px">
                <span className="now">{formatINR(product.price)}</span>
                {off > 0 && (
                  <>
                    <span className="mrp">{formatINR(product.mrp)}</span>
                    <span className="off">{off}% off</span>
                  </>
                )}
              </Price>
              <div style={{ fontSize: 12.5, color: theme.colors.muted, margin: '4px 0 18px' }}>
                Inclusive of taxes · Bulk pricing available
              </div>

              {product.colors?.length > 0 && (
                <Option>
                  <div className="label">
                    Colour <span>{color}</span>
                  </div>
                  <Swatches>
                    {product.colors.map((c) => (
                      <Swatch
                        key={c}
                        $active={c === color}
                        $swatch={swatch(c)}
                        onClick={() => setColor(c)}
                        type="button"
                      >
                        <span className="dot" />
                        {c}
                      </Swatch>
                    ))}
                  </Swatches>
                </Option>
              )}

              {product.variants?.length > 0 && (
                <Option>
                  <div className="label">
                    Option <span>{variant}</span>
                  </div>
                  <Variants>
                    {product.variants.map((v) => (
                      <button
                        key={v}
                        type="button"
                        $active={v === variant}
                        onClick={() => setVariant(v)}
                      >
                        {v}
                      </button>
                    ))}
                  </Variants>
                </Option>
              )}

              <Option>
                <div className="label">Quantity</div>
                <Qty>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(999, q + 1))}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </Qty>
              </Option>

              <Controls>
                <BuyRow>
                  <AddBtn onClick={() => addToCart(product, { color, variant, qty })}>
                    <ShoppingBag size={17} /> Add to Cart
                  </AddBtn>
                  <BuyNowBtn $variant="gold" onClick={buyNow}>
                    Buy Now
                  </BuyNowBtn>
                </BuyRow>
                <QuoteLink href={`/get-a-quote?product=${product.slug}`}>
                  <Quote size={16} /> Get a Quote for bulk orders
                </QuoteLink>

                <Desc>{product.description}</Desc>

                <Perks>
                  <li>
                    <BadgeCheck size={17} />
                    <span>
                      <strong>Custom branding</strong>
                      {product.customization[0]}
                    </span>
                  </li>
                  <li>
                    <Truck size={17} />
                    <span>
                      <strong>Pan-India delivery</strong>
                      {leadTime || 'Timeline shared at quote'}
                    </span>
                  </li>
                  <li>
                    <Check size={17} />
                    <span>
                      <strong>Sample first</strong>
                      Approve a mock-up before production
                    </span>
                  </li>
                  <li>
                    <Quote size={17} />
                    <span>
                      <strong>Dedicated support</strong>
                      One contact from quote to delivery
                    </span>
                  </li>
                </Perks>

                <Accordion>
                  {sections.map((s) => (
                    <Item key={s.id} className={openSection === s.id ? 'open' : ''}>
                      <button
                        className="head"
                        type="button"
                        onClick={() => setOpenSection(openSection === s.id ? '' : s.id)}
                        aria-expanded={openSection === s.id}
                      >
                        {s.label} <ChevronDown size={18} />
                      </button>
                      {openSection === s.id && <div className="body">{s.body}</div>}
                    </Item>
                  ))}
                </Accordion>

                <Bulk>
                  <div>
                    <h4>Ordering for a team or clients?</h4>
                    <p>Get tiered pricing and a free branding mock-up.</p>
                  </div>
                  <Link href={`/get-a-quote?product=${product.slug}`}>Get a quote →</Link>
                </Bulk>
              </Controls>
            </Info>

            <Below>
              <div>
                <h2>Good to know</h2>
                <FAQAccordion items={faqs.slice(0, 4)} defaultOpen={-1} />
              </div>
              <div>
                <h2>Personalization at scale</h2>
                <CheckList>
                  <li>
                    <Check size={16} /> Share your logo (SVG/PNG) — we send a digital mock-up within
                    24–48 hours.
                  </li>
                  <li>
                    <Check size={16} /> Add individual names, messages or employee IDs at no extra
                    design cost.
                  </li>
                  <li>
                    <Check size={16} /> Choose from engraving, embroidery, UV print, deboss or foil.
                  </li>
                  <li>
                    <Check size={16} /> Gift boxes, sleeves and ribbons can be fully customized.
                  </li>
                  <li>
                    <Check size={16} /> Multi-address shipping with individual gift notes available.
                  </li>
                </CheckList>
                <div style={{ marginTop: 22 }}>
                  <ButtonLink href={`/get-a-quote?product=${product.slug}`} $variant="outline">
                    Start a bulk enquiry
                  </ButtonLink>
                </div>
              </div>
            </Below>
          </Grid>
        </Container>
      </Section>

      {related?.length > 0 && (
        <Section style={{ paddingTop: 0, background: '#fff' }}>
          <Container>
            <div style={{ marginBottom: 26 }}>
              <h2 style={{ fontSize: 32, color: theme.colors.forest, marginBottom: 6 }}>
                You may also like
              </h2>
              <p style={{ color: theme.colors.muted, fontSize: 15 }}>
                More gifting ideas from {cat?.name || 'our catalogue'}.
              </p>
            </div>
            <ProductCarousel products={related} />
          </Container>
        </Section>
      )}
    </>
  );
}
