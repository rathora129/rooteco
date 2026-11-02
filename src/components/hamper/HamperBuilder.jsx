'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  ArrowRight,
  Check,
  Info,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { HAMPER_BOXES as BOXES, HAMPER_BRANDING as BRANDING, HAMPER_ITEM_SLUGS as ITEM_SLUGS } from '@/lib/hamper';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';
import { Button, Container, Section } from '@/components/common/ui';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 390px;
  gap: 44px;
  align-items: start;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const StepsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 34px;
`;

const Step = styled.section`
  .step-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 11px;
    font-size: 24px;
    color: ${theme.colors.forest};
    .n {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: ${theme.colors.forest};
      color: ${theme.colors.goldLight};
      font-family: ${theme.fonts.body};
      font-size: 13px;
      font-weight: 700;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
  }
  p.sub {
    font-size: 13.5px;
    color: ${theme.colors.muted};
    margin-top: 5px;
  }
  .count {
    font-size: 12.5px;
    font-weight: 600;
    color: ${theme.colors.green};
    background: ${theme.colors.cream};
    border: 1px solid ${theme.colors.line};
    padding: 5px 12px;
    border-radius: ${theme.radius.pill};
  }
`;

const BoxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const BoxCard = styled.button`
  position: relative;
  text-align: left;
  border-radius: ${theme.radius.md};
  border: 2px solid ${(p) => (p.$active ? theme.colors.forest : theme.colors.line)};
  background: #fff;
  overflow: hidden;
  transition: all 0.2s ease;
  &:hover {
    border-color: ${theme.colors.forest};
    box-shadow: ${theme.shadow.soft};
  }
  .img {
    position: relative;
    display: block;
    aspect-ratio: 16 / 10;
    background: ${theme.colors.cream};
    img {
      object-fit: cover;
    }
  }
  .body {
    display: block;
    padding: 12px 14px 14px;
    strong {
      display: block;
      font-size: 14px;
      color: ${theme.colors.ink};
      margin-bottom: 2px;
    }
    span {
      display: block;
      font-size: 12px;
      color: ${theme.colors.muted};
      line-height: 1.45;
    }
    .price {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
      font-weight: 700;
      color: ${theme.colors.forest};
      em {
        font-style: normal;
        font-weight: 500;
        color: ${theme.colors.muted};
      }
    }
  }
  .tick {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${theme.colors.forest};
    color: #fff;
    display: ${(p) => (p.$active ? 'grid' : 'none')};
    place-items: center;
  }
`;

const Progress = styled.div`
  height: 6px;
  background: ${theme.colors.creamDark};
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 18px;
  > span {
    display: block;
    height: 100%;
    width: ${(p) => p.$pct}%;
    background: linear-gradient(90deg, ${theme.colors.green}, ${theme.colors.leaf});
    border-radius: 999px;
    transition: width 0.3s ease;
  }
`;

const Warning = styled.p`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: ${theme.colors.sale};
  margin-bottom: 12px;
  svg {
    flex-shrink: 0;
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  @media (max-width: 1180px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ItemCard = styled.div`
  position: relative;
  background: #fff;
  border: 1.5px solid ${(p) => (p.$active ? theme.colors.forest : theme.colors.line)};
  border-radius: ${theme.radius.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    border-color: ${theme.colors.forest};
  }
  .img {
    position: relative;
    display: block;
    aspect-ratio: 1 / 1;
    background: ${theme.colors.cream};
    img {
      object-fit: cover;
    }
  }
  .body {
    display: flex;
    padding: 10px 11px 11px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    strong {
      font-size: 12.5px;
      line-height: 1.35;
      color: ${theme.colors.ink};
      font-weight: 600;
    }
    .p {
      font-size: 12px;
      font-weight: 700;
      color: ${theme.colors.forest};
    }
  }
  .toggle {
    margin-top: 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 8px;
    border-radius: ${theme.radius.pill};
    font-size: 11.5px;
    font-weight: 600;
    background: ${(p) => (p.$active ? theme.colors.forest : theme.colors.cream)};
    color: ${(p) => (p.$active ? '#fff' : theme.colors.forest)};
    transition: all 0.2s ease;
    &:hover {
      background: ${theme.colors.forest};
      color: #fff;
    }
  }
  .badge {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 2;
    background: ${theme.colors.forest};
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 3px 8px;
    border-radius: ${theme.radius.pill};
    display: ${(p) => (p.$active ? 'inline-flex' : 'none')};
    align-items: center;
    gap: 3px;
  }
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const BrandCard = styled.button`
  text-align: left;
  padding: 15px 16px;
  border-radius: ${theme.radius.md};
  border: 1.5px solid ${(p) => (p.$active ? theme.colors.forest : theme.colors.line)};
  background: ${(p) => (p.$active ? theme.colors.cream : '#fff')};
  transition: all 0.2s ease;
  strong {
    display: block;
    font-size: 13.5px;
    color: ${theme.colors.ink};
    margin-bottom: 3px;
  }
  span {
    font-size: 12px;
    color: ${theme.colors.muted};
    line-height: 1.45;
    display: block;
  }
  em {
    display: block;
    margin-top: 8px;
    font-style: normal;
    font-size: 12px;
    font-weight: 700;
    color: ${theme.colors.green};
  }
  &:hover {
    border-color: ${theme.colors.forest};
  }
`;

const NoteField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${theme.colors.ink};
  textarea {
    width: 100%;
    min-height: 84px;
    resize: vertical;
    padding: 11px 14px;
    border-radius: ${theme.radius.sm};
    border: 1px solid ${theme.colors.line};
    background: #fff;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    &:focus {
      border-color: ${theme.colors.green};
      box-shadow: 0 0 0 3px rgba(76, 122, 52, 0.12);
    }
    &::placeholder {
      color: #9aa59d;
    }
  }
`;

const Summary = styled.aside`
  position: sticky;
  top: 80px;
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  @media (max-width: 980px) {
    position: static;
  }
  .head {
    position: relative;
    height: 132px;
    background: ${theme.colors.cream};
    img {
      object-fit: cover;
    }
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(transparent 30%, rgba(11, 61, 46, 0.85));
    }
    .cap {
      position: absolute;
      z-index: 2;
      left: 18px;
      bottom: 14px;
      color: #fff;
      span {
        font-size: 10.5px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: ${theme.colors.goldLight};
        font-weight: 700;
      }
      strong {
        display: block;
        font-family: ${theme.fonts.display};
        font-size: 20px;
      }
    }
  }
  .inner {
    padding: 20px;
    h3 {
      font-family: ${theme.fonts.body};
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${theme.colors.muted};
      margin-bottom: 10px;
    }
  }
  .chosen {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 14px;
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: ${theme.colors.ink};
      .name {
        flex: 1;
      }
      .price {
        font-weight: 600;
        color: ${theme.colors.forest};
      }
      button {
        color: ${theme.colors.muted};
        display: grid;
        place-items: center;
        &:hover {
          color: ${theme.colors.sale};
        }
      }
    }
    .empty {
      font-size: 12.5px;
      color: ${theme.colors.muted};
      padding: 10px 12px;
      border: 1px dashed ${theme.colors.line};
      border-radius: ${theme.radius.sm};
    }
  }
  .lines {
    border-top: 1px solid ${theme.colors.line};
    padding-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: ${theme.colors.muted};
    .line {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }
    .total {
      border-top: 1px solid ${theme.colors.line};
      margin-top: 6px;
      padding-top: 11px;
      font-size: 15px;
      font-weight: 600;
      color: ${theme.colors.ink};
      strong {
        font-size: 22px;
        color: ${theme.colors.forest};
      }
    }
  }
  .qty-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 0 12px;
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.ink};
  }
  .qty {
    display: inline-flex;
    align-items: center;
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radius.pill};
    overflow: hidden;
    button {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      color: ${theme.colors.forest};
      &:hover {
        background: ${theme.colors.cream};
      }
    }
    span {
      width: 34px;
      text-align: center;
      font-size: 13.5px;
      font-weight: 600;
    }
  }
  .add {
    width: 100%;
    margin-top: 4px;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
  .hint {
    display: flex;
    gap: 7px;
    align-items: flex-start;
    font-size: 11.5px;
    line-height: 1.55;
    color: ${theme.colors.muted};
    margin-top: 12px;
    svg {
      flex-shrink: 0;
      color: ${theme.colors.green};
      margin-top: 2px;
    }
  }
  .grand {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    color: ${theme.colors.muted};
    margin-top: 10px;
    strong {
      color: ${theme.colors.forest};
      font-size: 14px;
    }
  }
`;

export default function HamperBuilder({ products = [] }) {
  const router = useRouter();
  const { addToCart, setCartOpen } = useStore();
  const [boxId, setBoxId] = useState(BOXES[1].id);
  const [picked, setPicked] = useState([]);
  const [brandingId, setBrandingId] = useState('sleeve');
  const [note, setNote] = useState('');
  const [qty, setQty] = useState(1);
  const [limitHit, setLimitHit] = useState(false);

  const hamperItems = useMemo(
    () => ITEM_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean),
    [products]
  );

  const box = BOXES.find((b) => b.id === boxId);
  const branding = BRANDING.find((b) => b.id === brandingId);
  const itemObjects = useMemo(
    () => picked.map((slug) => hamperItems.find((p) => p.slug === slug)).filter(Boolean),
    [picked, hamperItems]
  );
  const itemsTotal = itemObjects.reduce((sum, p) => sum + p.price, 0);
  const perHamper = box.price + itemsTotal + branding.price;
  const total = perHamper * qty;
  const pct = Math.round((picked.length / box.capacity) * 100);
  const ready = picked.length > 0;

  const chooseBox = (next) => {
    setBoxId(next.id);
    setLimitHit(false);
    setPicked((prev) => prev.slice(0, next.capacity));
  };

  const toggleItem = (slug) => {
    setPicked((prev) => {
      if (prev.includes(slug)) {
        setLimitHit(false);
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= box.capacity) {
        setLimitHit(true);
        return prev;
      }
      setLimitHit(false);
      return [...prev, slug];
    });
  };

  const addHamper = () => {
    if (!ready) return;
    const hamper = {
      slug: `custom-hamper-${box.id}-${Date.now()}`,
      name: `Custom Hamper — ${box.name} (${picked.length} ${picked.length === 1 ? 'gift' : 'gifts'})`,
      price: perHamper,
      images: [box.image],
      colors: [box.name],
      variants: [branding.name],
      custom: true,
      boxId: box.id,
      brandingId: branding.id,
      productSlugs: picked,
    };
    addToCart(hamper, {
      color: box.name,
      variant: `${branding.name} · ${picked.length} gifts`,
      qty,
      note: note.trim(),
    });
    setCartOpen(false);
    router.push('/cart');
  };

  return (
    <Section>
      <Container>
        <Layout>
          <StepsCol>
            <Step>
              <div className="step-head">
                <div>
                  <h2>
                    <span className="n">1</span> Choose your box
                  </h2>
                  <p className="sub">The base of your hamper — reusable, gift-ready packaging.</p>
                </div>
              </div>
              <BoxGrid>
                {BOXES.map((b) => (
                  <BoxCard
                    key={b.id}
                    type="button"
                    $active={b.id === boxId}
                    onClick={() => chooseBox(b)}
                  >
                    <span className="tick">
                      <Check size={14} />
                    </span>
                    <span className="img">
                      <Image src={b.image} alt={b.name} fill sizes="(max-width: 700px) 100vw, 33vw" />
                    </span>
                    <span className="body">
                      <strong>{b.name}</strong>
                      <span>{b.desc}</span>
                      <span className="price">
                        {formatINR(b.price)} <em>· fits {b.capacity} gifts</em>
                      </span>
                    </span>
                  </BoxCard>
                ))}
              </BoxGrid>
            </Step>

            <Step>
              <div className="step-head">
                <div>
                  <h2>
                    <span className="n">2</span> Fill your box
                  </h2>
                  <p className="sub">Pick up to {box.capacity} gifts. Prices are per unit.</p>
                </div>
                <span className="count">
                  {picked.length} of {box.capacity} filled
                </span>
              </div>
              <Progress $pct={pct} />
              {limitHit && (
                <Warning>
                  <Info size={14} /> This box fits {box.capacity} gifts. Remove one to add another,
                  or choose a larger box.
                </Warning>
              )}
              <ItemGrid>
                {hamperItems.map((item) => {
                  const active = picked.includes(item.slug);
                  return (
                    <ItemCard key={item.slug} $active={active}>
                      {active && (
                        <span className="badge">
                          <Check size={10} /> Added
                        </span>
                      )}
                      <span className="img">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1180px) 33vw, 20vw"
                        />
                      </span>
                      <span className="body">
                        <strong>{item.name}</strong>
                        <span className="p">{formatINR(item.price)}</span>
                        <button
                          className="toggle"
                          type="button"
                          onClick={() => toggleItem(item.slug)}
                        >
                          {active ? (
                            <>
                              <Minus size={12} /> Remove
                            </>
                          ) : (
                            <>
                              <Plus size={12} /> Add
                            </>
                          )}
                        </button>
                      </span>
                    </ItemCard>
                  );
                })}
              </ItemGrid>
            </Step>

            <Step>
              <div className="step-head">
                <div>
                  <h2>
                    <span className="n">3</span> Add your branding
                  </h2>
                  <p className="sub">We collect your artwork after checkout and send a mock-up.</p>
                </div>
              </div>
              <BrandGrid>
                {BRANDING.map((b) => (
                  <BrandCard
                    key={b.id}
                    type="button"
                    $active={b.id === brandingId}
                    onClick={() => setBrandingId(b.id)}
                  >
                    <strong>{b.name}</strong>
                    <span>{b.desc}</span>
                    <em>{b.price === 0 ? 'Included' : `+ ${formatINR(b.price)} / hamper`}</em>
                  </BrandCard>
                ))}
              </BrandGrid>
            </Step>

            <Step>
              <div className="step-head">
                <div>
                  <h2>
                    <span className="n">4</span> Add a gift note
                  </h2>
                  <p className="sub">Optional — include a message for the recipient.</p>
                </div>
              </div>
              <NoteField>
                Gift note
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={180}
                  placeholder="e.g. Welcome to the team — we're so glad you're here."
                />
              </NoteField>
            </Step>
          </StepsCol>

          <Summary>
            <div className="head">
              <Image src={box.image} alt={box.name} fill sizes="390px" />
              <div className="cap">
                <span>Your hamper</span>
                <strong>{box.name}</strong>
              </div>
            </div>
            <div className="inner">
              <h3>Inside the box</h3>
              <ul className="chosen">
                {itemObjects.length === 0 ? (
                  <li className="empty">
                    No gifts yet — add up to {box.capacity} from the collection.
                  </li>
                ) : (
                  itemObjects.map((item) => (
                    <li key={item.slug}>
                      <span className="name">{item.name}</span>
                      <span className="price">{formatINR(item.price)}</span>
                      <button
                        type="button"
                        onClick={() => toggleItem(item.slug)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <X size={12} />
                      </button>
                    </li>
                  ))
                )}
              </ul>

              <div className="lines">
                <div className="line">
                  <span>{box.name}</span>
                  <span>{formatINR(box.price)}</span>
                </div>
                <div className="line">
                  <span>Gifts ({picked.length})</span>
                  <span>{formatINR(itemsTotal)}</span>
                </div>
                <div className="line">
                  <span>{branding.name}</span>
                  <span>{branding.price === 0 ? 'Included' : formatINR(branding.price)}</span>
                </div>
                <div className="line total">
                  <span>Per hamper</span>
                  <strong>{formatINR(perHamper)}</strong>
                </div>
              </div>

              <div className="qty-row">
                Quantity
                <span className="qty">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease hamper quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(999, q + 1))}
                    aria-label="Increase hamper quantity"
                  >
                    <Plus size={14} />
                  </button>
                </span>
              </div>

              <Button className="add" onClick={addHamper} disabled={!ready}>
                <ShoppingBag size={16} /> Add Hamper to Cart
              </Button>
              <div className="grand">
                <span>Total for {qty} {qty === 1 ? 'hamper' : 'hampers'}</span>
                <strong>{formatINR(total)}</strong>
              </div>
              <p className="hint">
                <Sparkles size={13} />
                {ready
                  ? 'Our team confirms artwork, gift notes and timelines after you order.'
                  : 'Add at least one gift to continue.'}
              </p>
              <p className="hint">
                <Package size={13} /> Need 25+ hampers?{' '}
                <a
                  href="/get-a-quote"
                  style={{ color: theme.colors.forest, fontWeight: 700 }}
                >
                  Request a quote <ArrowRight size={11} style={{ verticalAlign: 'middle' }} />
                </a>
              </p>
            </div>
          </Summary>
        </Layout>
      </Container>
    </Section>
  );
}
