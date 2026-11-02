'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';
import { Button, ButtonLink, Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import ProductCarousel from '@/components/common/ProductCarousel';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 48px;
  align-items: start;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const List = styled.div`
  border-top: 1px solid ${theme.colors.line};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 112px 1fr auto;
  gap: 20px;
  padding: 22px 0;
  border-bottom: 1px solid ${theme.colors.line};
  @media (max-width: 640px) {
    grid-template-columns: 88px 1fr;
    gap: 14px;
  }
`;

const Thumb = styled(Link)`
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${theme.colors.cream};
  img {
    object-fit: cover;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  .name {
    font-family: ${theme.fonts.display};
    font-size: 19px;
    font-weight: 600;
    color: ${theme.colors.ink};
    line-height: 1.3;
    &:hover {
      color: ${theme.colors.green};
    }
  }
  .opt {
    font-size: 12.5px;
    color: ${theme.colors.muted};
  }
  .unit {
    font-size: 13.5px;
    color: ${theme.colors.muted};
    margin-top: 2px;
  }
  .note {
    font-size: 12.5px;
    color: ${theme.colors.green};
    font-style: italic;
  }
`;

const RowActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  .line-total {
    font-size: 18px;
    font-weight: 700;
    color: ${theme.colors.forest};
  }
  .remove {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    color: ${theme.colors.muted};
    &:hover {
      color: ${theme.colors.sale};
    }
  }
  @media (max-width: 640px) {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
  }
`;

const Qty = styled.div`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.pill};
  background: #fff;
  overflow: hidden;
  button {
    width: 34px;
    height: 34px;
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
    font-size: 14px;
    font-weight: 600;
  }
`;

const Summary = styled.aside`
  position: sticky;
  top: 96px;
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 26px;
  @media (max-width: 960px) {
    position: static;
  }
  h2 {
    font-size: 24px;
    color: ${theme.colors.forest};
    margin-bottom: 18px;
  }
  .line {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 14.5px;
    color: ${theme.colors.muted};
    padding: 7px 0;
    strong {
      color: ${theme.colors.ink};
      font-weight: 600;
    }
  }
  .free {
    color: ${theme.colors.green};
    font-weight: 600;
  }
  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-top: 1px solid ${theme.colors.line};
    margin-top: 12px;
    padding-top: 16px;
    font-size: 17px;
    font-weight: 600;
    color: ${theme.colors.ink};
    strong {
      font-size: 24px;
      color: ${theme.colors.forest};
    }
  }
  .tax {
    font-size: 12px;
    color: ${theme.colors.muted};
    margin: 4px 0 18px;
  }
  .cta {
    width: 100%;
    gap: 8px;
  }
  .keep {
    display: block;
    text-align: center;
    font-size: 13.5px;
    font-weight: 600;
    color: ${theme.colors.forest};
    margin-top: 14px;
    &:hover {
      text-decoration: underline;
    }
  }
  .perks {
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid ${theme.colors.line};
    display: flex;
    flex-direction: column;
    gap: 9px;
    font-size: 12.5px;
    color: ${theme.colors.muted};
    li {
      display: flex;
      gap: 8px;
      align-items: center;
      svg {
        color: ${theme.colors.green};
        flex-shrink: 0;
      }
    }
  }
`;

const Clear = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${theme.colors.muted};
  margin-top: 16px;
  &:hover {
    color: ${theme.colors.sale};
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 70px 24px;
  border: 1px dashed ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  background: #fff;
  > svg {
    color: ${theme.colors.green};
    margin-bottom: 12px;
  }
  h2 {
    font-size: 28px;
    color: ${theme.colors.forest};
    margin-bottom: 8px;
  }
  p {
    color: ${theme.colors.muted};
    max-width: 420px;
    margin: 0 auto 22px;
  }
`;

const Suggestions = styled.div`
  margin-top: 72px;
  h2 {
    font-size: 30px;
    color: ${theme.colors.forest};
    margin-bottom: 6px;
  }
  p {
    color: ${theme.colors.muted};
    font-size: 14.5px;
    margin-bottom: 24px;
  }
`;

export default function CartPage({ recommendations = [] }) {
  const { cart, cartSubtotal, cartCount, updateQty, removeFromCart, clearCart, hydrated } =
    useStore();

  const shipping = cartSubtotal === 0 || cartSubtotal >= 2000 ? 0 : 150;
  const total = cartSubtotal + shipping;
  const suggestions = recommendations.slice(0, 6);

  return (
    <>
      <PageHero
        eyebrow="Your selections"
        title="Your Gift Cart"
        subtitle="Review your gifts, adjust quantities and proceed to checkout. Bulk quantities? Request a quote for tiered pricing."
        crumbs={[{ label: 'Cart' }]}
      />

      <Section>
        <Container>
          {!hydrated ? (
            <p style={{ textAlign: 'center', color: theme.colors.muted, padding: '40px 0' }}>
              Loading your cart…
            </p>
          ) : cart.length === 0 ? (
            <Empty>
              <ShoppingBag size={40} />
              <h2>Your cart is empty</h2>
              <p>
                Explore welcome kits, hampers, drinkware and more — every gift can carry your
                brand.
              </p>
              <ButtonLink href="/products">
                Start gifting <ArrowRight size={16} />
              </ButtonLink>
            </Empty>
          ) : (
            <>
              <Layout>
                <div>
                  <List>
                    {cart.map((item) => (
                      <Row key={item.key}>
                        <Thumb href={`/products/${item.slug}`}>
                          <Image src={item.image} alt={item.name} fill sizes="112px" />
                        </Thumb>
                        <ItemInfo>
                          <Link className="name" href={`/products/${item.slug}`}>
                            {item.name}
                          </Link>
                          {(item.color || item.variant) && (
                            <span className="opt">
                              {[item.color, item.variant].filter(Boolean).join(' · ')}
                            </span>
                          )}
                          <span className="unit">{formatINR(item.price)} each</span>
                          {item.note && <span className="note">Gift note: “{item.note}”</span>}
                        </ItemInfo>
                        <RowActions>
                          <Qty>
                            <button
                              type="button"
                              onClick={() => updateQty(item.key, item.qty - 1)}
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span>{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.key, item.qty + 1)}
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus size={14} />
                            </button>
                          </Qty>
                          <span className="line-total">
                            {formatINR(item.price * item.qty)}
                          </span>
                          <button
                            className="remove"
                            type="button"
                            onClick={() => removeFromCart(item.key)}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </RowActions>
                      </Row>
                    ))}
                  </List>
                  <Clear type="button" onClick={clearCart}>
                    <Trash2 size={14} /> Clear cart
                  </Clear>
                </div>

                <Summary>
                  <h2>Order summary</h2>
                  <div className="line">
                    <span>
                      Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                    </span>
                    <strong>{formatINR(cartSubtotal)}</strong>
                  </div>
                  <div className="line">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="free">Free</span>
                    ) : (
                      <strong>{formatINR(shipping)}</strong>
                    )}
                  </div>
                  {shipping > 0 && (
                    <div className="line" style={{ fontSize: 12.5 }}>
                      <span>Add {formatINR(2000 - cartSubtotal)} more for free shipping</span>
                    </div>
                  )}
                  <div className="total">
                    <span>Total</span>
                    <strong>{formatINR(total)}</strong>
                  </div>
                  <p className="tax">Inclusive of all taxes. Bulk discounts applied at quote.</p>
                  <ButtonLink className="cta" href="/checkout">
                    Proceed to Checkout <ArrowRight size={16} />
                  </ButtonLink>
                  <Link className="keep" href="/products">
                    Continue shopping
                  </Link>
                  <ul className="perks">
                    <li>
                      <ShieldCheck size={15} /> Secure checkout — invoice or COD confirmation
                    </li>
                    <li>
                      <Truck size={15} /> Pan-India delivery, single or multi-address
                    </li>
                  </ul>
                </Summary>
              </Layout>

              <Suggestions>
                <h2>Complete your gift</h2>
                <p>Popular picks that pair well with your selection.</p>
                <ProductCarousel products={suggestions} />
              </Suggestions>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
