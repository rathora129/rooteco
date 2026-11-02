'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Printer,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';
import { Button, ButtonLink, Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';

const Success = styled.div`
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  border-radius: ${theme.radius.lg};
  padding: 40px 44px;
  display: flex;
  align-items: center;
  gap: 26px;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    right: -70px;
    top: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(201, 162, 39, 0.16);
  }
  .tick {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: ${theme.colors.gold};
    color: ${theme.colors.forest};
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  h1 {
    font-size: clamp(26px, 3.4vw, 38px);
    margin-bottom: 6px;
  }
  p {
    color: rgba(246, 241, 231, 0.8);
    font-size: 14.5px;
    max-width: 560px;
  }
  .id {
    margin-left: auto;
    position: relative;
    z-index: 1;
    text-align: right;
    span {
      display: block;
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${theme.colors.goldLight};
      margin-bottom: 4px;
    }
    strong {
      font-family: ${theme.fonts.display};
      font-size: 24px;
      color: #fff;
    }
  }
  @media (max-width: 640px) {
    padding: 30px 24px;
    .id {
      margin-left: 0;
      text-align: left;
    }
  }
`;

const NoticeBar = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 9px;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: ${theme.radius.md};
  background: rgba(76, 122, 52, 0.1);
  border: 1px solid rgba(76, 122, 52, 0.28);
  font-size: 12.5px;
  line-height: 1.6;
  color: ${theme.colors.ink};
  svg {
    color: ${theme.colors.green};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 44px;
  align-items: start;
  margin-top: 34px;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 26px;
  }
`;

const Panel = styled.section`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 26px;
  & + & {
    margin-top: 18px;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 20px;
    color: ${theme.colors.forest};
    margin-bottom: 16px;
    svg {
      color: ${theme.colors.green};
    }
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 18px;
  margin-bottom: 14px;
  border-bottom: 1px solid ${theme.colors.line};
  .item {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .thumb {
    position: relative;
    width: 62px;
    height: 62px;
    border-radius: 10px;
    overflow: hidden;
    background: ${theme.colors.cream};
    flex-shrink: 0;
    img {
      object-fit: cover;
    }
  }
  .info {
    flex: 1;
    min-width: 0;
    strong {
      display: block;
      font-size: 14px;
      color: ${theme.colors.ink};
    }
    span {
      font-size: 12.5px;
      color: ${theme.colors.muted};
    }
  }
  .price {
    font-weight: 600;
    color: ${theme.colors.ink};
    font-size: 14px;
  }
`;

const Totals = styled.div`
  .line {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 14px;
    color: ${theme.colors.muted};
    padding: 5px 0;
    strong {
      color: ${theme.colors.ink};
    }
  }
  .total {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid ${theme.colors.line};
    margin-top: 10px;
    padding-top: 14px;
    font-size: 16px;
    font-weight: 600;
    strong {
      font-size: 23px;
      color: ${theme.colors.forest};
    }
  }
`;

const Meta = styled.dl`
  display: grid;
  grid-template-columns: 116px 1fr;
  gap: 10px 14px;
  font-size: 13.5px;
  dt {
    color: ${theme.colors.muted};
  }
  dd {
    color: ${theme.colors.ink};
    font-weight: 500;
    word-break: break-word;
  }
`;

const Timeline = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 0;
  li {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 12px;
    position: relative;
    padding-bottom: 22px;
    &:last-child {
      padding-bottom: 0;
    }
    &:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 13px;
      top: 26px;
      bottom: 0;
      width: 2px;
      background: ${theme.colors.line};
    }
    &.done:not(:last-child)::before {
      background: ${theme.colors.green};
    }
  }
  .dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${theme.colors.cream};
    border: 2px solid ${theme.colors.line};
    color: ${theme.colors.muted};
    z-index: 1;
  }
  .done .dot {
    background: ${theme.colors.green};
    border-color: ${theme.colors.green};
    color: #fff;
  }
  h3 {
    font-family: ${theme.fonts.body};
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.ink};
    margin-bottom: 2px;
  }
  p {
    font-size: 12.5px;
    color: ${theme.colors.muted};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 26px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 70px 24px;
  border: 1px dashed ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  background: #fff;
  svg {
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
    max-width: 440px;
    margin: 0 auto 22px;
  }
`;

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('rooteco-order');
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      setOrder(null);
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <Section>
        <Container>
          <p style={{ textAlign: 'center', color: theme.colors.muted }}>
            Loading your order…
          </p>
        </Container>
      </Section>
    );
  }

  if (!order) {
    return (
      <>
        <PageHero
          eyebrow="Order confirmation"
          title="No recent order found"
          subtitle="Once you place an order, its confirmation will appear here."
          crumbs={[{ label: 'Order Confirmation' }]}
        />
        <Section>
          <Container>
            <Empty>
              <ShoppingBag size={40} />
              <h2>Nothing to show yet</h2>
              <p>
                This page shows the most recent order placed in this browser session. Start with a
                gift and complete checkout to see it.
              </p>
              <ButtonLink href="/products">
                Browse gifts <ArrowRight size={16} />
              </ButtonLink>
            </Empty>
          </Container>
        </Section>
      </>
    );
  }

  const steps = [
    { title: 'Order placed', text: `${fmtDate(order.date)} — we have your request`, done: true },
    {
      title: 'Review & invoice',
      text:
        order.paymentId === 'bank-transfer'
          ? 'Our team verifies stock and emails a proforma invoice with bank details.'
          : 'Our team verifies stock, delivery eligibility and confirms your COD order.',
      done: false,
    },
    { title: 'Production & branding', text: 'Branding artwork is approved before dispatch.', done: false },
    { title: 'Dispatch & delivery', text: 'Tracked delivery to your shipping address.', done: false },
  ];

  const paymentStatusLabel = {
    pending: 'Payment pending',
    authorized: 'Payment authorised',
    paid: 'Paid',
    failed: 'Payment failed',
    refunded: 'Refunded',
  }[order.paymentStatus] || 'Payment pending';

  const eta = new Date(new Date(order.date).getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <>
      <Section style={{ paddingTop: 40 }}>
        <Container>
          <Success>
            <span className="tick">
              <CheckCircle2 size={34} />
            </span>
            <div>
              <h1>Thank you, {order.customer.name.split(' ')[0]}!</h1>
              <p>
                Your order request is in. No payment has been taken yet — our gifting team will
                review stock and contact you at {order.customer.email} with the next step.
              </p>
            </div>
            <div className="id">
              <span>Order reference</span>
              <strong>{order.number}</strong>
            </div>
          </Success>

          <NoticeBar>
            <Package size={16} />
            <span>
              <strong>{paymentStatusLabel}.</strong>{' '}
              {order.paymentId === 'bank-transfer'
                ? 'Share the proforma invoice with your accounts team and pay via NEFT/RTGS. We dispatch after the transfer is confirmed.'
                : 'Pay by cash or UPI at delivery. Our team will confirm COD eligibility for your PIN code before dispatch.'}{' '}
              You can follow progress from the Track order page with your order number and email.
            </span>
          </NoticeBar>

          <Layout>
            <div>
              <Panel>
                <h2>
                  <Package size={19} /> Order details
                </h2>
                <Items>
                  {order.items.map((item, index) => (
                    <div className="item" key={item.id || `${item.name}-${index}`}>
                      {item.image && (
                        <span className="thumb">
                          <Image src={item.image} alt={item.name} fill sizes="62px" />
                        </span>
                      )}
                      <span className="info">
                        <strong>{item.name}</strong>
                        <span>
                          Qty {item.qty}
                          {item.color ? ` · ${item.color}` : ''}
                          {item.variant ? ` · ${item.variant}` : ''}
                        </span>
                        {item.note && (
                          <span style={{ display: 'block', fontStyle: 'italic' }}>
                            Note: “{item.note}”
                          </span>
                        )}
                      </span>
                      <span className="price">{formatINR(item.price * item.qty)}</span>
                    </div>
                  ))}
                </Items>
                <Totals>
                  <div className="line">
                    <span>Subtotal</span>
                    <strong>{formatINR(order.subtotal)}</strong>
                  </div>
                  {order.discount > 0 && (
                    <div className="line">
                      <span>Discount</span>
                      <strong>−{formatINR(order.discount)}</strong>
                    </div>
                  )}
                  <div className="line">
                    <span>Shipping</span>
                    <strong>{order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</strong>
                  </div>
                  <div className="total">
                    <span>Order total</span>
                    <strong>{formatINR(order.total)}</strong>
                  </div>
                </Totals>
              </Panel>

              <Panel>
                <h2>
                  <Truck size={19} /> What happens next
                </h2>
                <Timeline>
                  {steps.map((step) => (
                    <li key={step.title} className={step.done ? 'done' : ''}>
                      <span className="dot">
                        {step.done ? <Check size={15} /> : <Package size={14} />}
                      </span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </Timeline>
              </Panel>
            </div>

            <div>
              <Panel>
                <h2>
                  <MapPin size={19} /> Shipping to
                </h2>
                <Meta>
                  <dt>Name</dt>
                  <dd>{order.customer.name}</dd>
                  <dt>Company</dt>
                  <dd>{order.customer.company || '—'}</dd>
                  <dt>Address</dt>
                  <dd>
                    {order.address.line1}
                    {order.address.line2 ? `, ${order.address.line2}` : ''}
                    <br />
                    {order.address.city}, {order.address.state} {order.address.pincode}
                    <br />
                    {order.address.country}
                  </dd>
                  <dt>Phone</dt>
                  <dd>{order.customer.phone}</dd>
                  <dt>Estimated</dt>
                  <dd>{fmtDate(eta.toISOString())} (after confirmation)</dd>
                </Meta>
              </Panel>

              <Panel>
                <h2>
                  <CreditCard size={19} /> Payment
                </h2>
                <Meta>
                  <dt>Method</dt>
                  <dd>{order.payment}</dd>
                  <dt>Status</dt>
                  <dd style={{ color: order.paymentStatus === 'paid' ? theme.colors.green : theme.colors.gold }}>
                    {paymentStatusLabel}
                  </dd>
                  <dt>Order date</dt>
                  <dd>{fmtDate(order.date)}</dd>
                  {order.notes && (
                    <>
                      <dt>Notes</dt>
                      <dd>{order.notes}</dd>
                    </>
                  )}
                </Meta>
              </Panel>

              <Panel>
                <h2>
                  <Mail size={19} /> Need help?
                </h2>
                <p style={{ fontSize: 13.5, color: theme.colors.muted, marginBottom: 14 }}>
                  Questions about this order? Our gifting team is one message away.
                </p>
                <Link
                  href="/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: theme.colors.forest,
                  }}
                >
                  Contact support <ArrowRight size={14} />
                </Link>
              </Panel>
            </div>
          </Layout>

          <Actions>
            <ButtonLink href="/products">
              Continue shopping <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink href={`/track-order?number=${encodeURIComponent(order.number)}`} $variant="outline">
              Track order
            </ButtonLink>
            <Button $variant="ghost" onClick={() => window.print()} style={{ color: theme.colors.forest, borderColor: theme.colors.forest }}>
              <Printer size={16} /> Print order
            </Button>
          </Actions>
        </Container>
      </Section>
    </>
  );
}
