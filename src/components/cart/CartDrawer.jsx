'use client';

import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(21, 34, 27, 0.45);
  backdrop-filter: blur(3px);
`;

const Drawer = styled(motion.aside)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 401;
  width: min(430px, 92vw);
  background: ${theme.colors.white};
  display: flex;
  flex-direction: column;
  box-shadow: ${theme.shadow.lift};
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid ${theme.colors.line};
  h3 {
    font-size: 19px;
    color: ${theme.colors.forest};
  }
  button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: ${theme.colors.ink};
    &:hover {
      background: ${theme.colors.cream};
    }
  }
`;

const Items = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Item = styled.div`
  display: flex;
  gap: 14px;
  .thumb {
    position: relative;
    width: 76px;
    height: 76px;
    border-radius: 10px;
    overflow: hidden;
    background: ${theme.colors.cream};
    flex-shrink: 0;
    img {
      object-fit: cover;
    }
  }
  .mid {
    flex: 1;
    min-width: 0;
    strong {
      display: block;
      font-size: 14.5px;
      color: ${theme.colors.ink};
      line-height: 1.3;
    }
    .meta {
      font-size: 12.5px;
      color: ${theme.colors.muted};
      margin: 2px 0 8px;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    .price {
      font-weight: 700;
      font-size: 14.5px;
      color: ${theme.colors.forest};
    }
    .rm {
      color: ${theme.colors.muted};
      &:hover {
        color: ${theme.colors.sale};
      }
    }
  }
`;

const Qty = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 1px solid ${theme.colors.line};
  border-radius: 999px;
  button {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    color: ${theme.colors.forest};
  }
  span {
    min-width: 22px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
  }
`;

const Foot = styled.div`
  border-top: 1px solid ${theme.colors.line};
  padding: 18px 22px 22px;
  background: ${theme.colors.cream};
  .row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: ${theme.colors.muted};
    margin-bottom: 6px;
  }
  .total {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 700;
    color: ${theme.colors.forest};
    margin: 8px 0 16px;
  }
  .actions {
    display: grid;
    gap: 10px;
  }
`;

const CheckoutBtn = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: ${theme.radius.pill};
  background: ${theme.colors.forest};
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.25s ease;
  &:hover {
    background: ${theme.colors.green};
  }
`;

const ContinueBtn = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: ${theme.radius.pill};
  border: 1.5px solid ${theme.colors.forest};
  color: ${theme.colors.forest};
  font-weight: 600;
  font-size: 14px;
  &:hover {
    background: ${theme.colors.forest};
    color: #fff;
  }
`;

const Empty = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: ${theme.colors.muted};
  text-align: center;
  padding: 30px;
  svg {
    color: ${theme.colors.line};
    width: 52px;
    height: 52px;
  }
  a {
    margin-top: 6px;
    color: ${theme.colors.forest};
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
`;

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartSubtotal, updateQty, removeFromCart } = useStore();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <Drawer
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Shopping cart"
          >
            <Head>
              <h3>Your Cart {cart.length > 0 && `(${cart.length})`}</h3>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart">
                <X size={20} />
              </button>
            </Head>

            {cart.length === 0 ? (
              <Empty>
                <ShoppingBag strokeWidth={1.2} />
                <p>Your cart is empty.<br />Thoughtful gifts are waiting.</p>
                <Link href="/products" onClick={() => setCartOpen(false)}>
                  Explore Gifts <ArrowRight size={15} />
                </Link>
              </Empty>
            ) : (
              <>
                <Items className="drawer-scroll">
                  {cart.map((item) => (
                    <Item key={item.key}>
                      <span className="thumb">
                        <Image src={item.image} alt={item.name} fill sizes="76px" />
                      </span>
                      <div className="mid">
                        <strong>{item.name}</strong>
                        <div className="meta">
                          {[item.color, item.variant].filter(Boolean).join(' · ')}
                        </div>
                        <Qty>
                          <button
                            onClick={() => updateQty(item.key, item.qty - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span>{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.key, item.qty + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </Qty>
                      </div>
                      <div className="right">
                        <span className="price">{formatINR(item.price * item.qty)}</span>
                        <button
                          className="rm"
                          onClick={() => removeFromCart(item.key)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Item>
                  ))}
                </Items>
                <Foot>
                  <div className="row">
                    <span>Subtotal</span>
                    <span>{formatINR(cartSubtotal)}</span>
                  </div>
                  <div className="row">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="total">
                    <span>Total</span>
                    <span>{formatINR(cartSubtotal)}</span>
                  </div>
                  <div className="actions">
                    <CheckoutBtn href="/checkout" onClick={() => setCartOpen(false)}>
                      Proceed to Checkout <ArrowRight size={16} />
                    </CheckoutBtn>
                    <ContinueBtn href="/cart" onClick={() => setCartOpen(false)}>
                      View Cart
                    </ContinueBtn>
                  </div>
                </Foot>
              </>
            )}
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );
}
