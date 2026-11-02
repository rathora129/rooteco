'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowRight,
  Check,
  Clock,
  Mail,
  Package,
  Phone,
  Search,
  Truck,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';
import { Button, Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import { Field, Grid } from '@/components/forms/formStyles';

const Wrap = styled.div`
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 30px;
  @media (max-width: 560px) {
    padding: 22px;
  }
  h2 {
    font-size: 24px;
    color: ${theme.colors.forest};
    margin-bottom: 4px;
  }
  > p.lead {
    font-size: 13.5px;
    color: ${theme.colors.muted};
    margin-bottom: 20px;
  }
`;

const ErrorNote = styled.div`
  display: flex;
  gap: 9px;
  align-items: flex-start;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: ${theme.radius.sm};
  background: rgba(176, 58, 46, 0.08);
  border: 1px solid rgba(176, 58, 46, 0.25);
  font-size: 12.5px;
  line-height: 1.55;
  color: ${theme.colors.ink};
`;

const Status = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  .top {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    padding: 22px 26px;
    background: ${theme.colors.cream};
    border-bottom: 1px solid ${theme.colors.line};
    .icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: ${theme.colors.forest};
      color: ${theme.colors.goldLight};
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .id {
      span {
        display: block;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: ${theme.colors.muted};
      }
      strong {
        font-family: ${theme.fonts.display};
        font-size: 20px;
        color: ${theme.colors.ink};
      }
    }
    .pill {
      margin-left: auto;
      font-size: 12px;
      font-weight: 700;
      color: ${theme.colors.forest};
      background: ${theme.colors.goldLight};
      padding: 6px 14px;
      border-radius: ${theme.radius.pill};
    }
  }
  .body {
    padding: 26px;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 26px;
    font-size: 13px;
    color: ${theme.colors.muted};
    padding-bottom: 20px;
    margin-bottom: 22px;
    border-bottom: 1px solid ${theme.colors.line};
    strong {
      color: ${theme.colors.ink};
      font-weight: 600;
    }
  }
`;

const Timeline = styled.ol`
  display: flex;
  flex-direction: column;
  li {
    display: grid;
    grid-template-columns: 30px 1fr;
    gap: 13px;
    position: relative;
    padding-bottom: 24px;
    &:last-child {
      padding-bottom: 0;
    }
    &:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 14px;
      top: 30px;
      bottom: 0;
      width: 2px;
      background: ${theme.colors.line};
    }
    &.done:not(:last-child)::before {
      background: ${theme.colors.green};
    }
  }
  .dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${theme.colors.cream};
    border: 2px solid ${theme.colors.line};
    color: ${theme.colors.muted};
    z-index: 1;
    font-size: 11px;
    font-weight: 700;
  }
  .done .dot {
    background: ${theme.colors.green};
    border-color: ${theme.colors.green};
    color: #fff;
  }
  .now .dot {
    background: ${theme.colors.gold};
    border-color: ${theme.colors.gold};
    color: ${theme.colors.forest};
    box-shadow: 0 0 0 5px rgba(201, 162, 39, 0.18);
  }
  h3 {
    font-family: ${theme.fonts.body};
    font-size: 14.5px;
    font-weight: 600;
    color: ${theme.colors.ink};
    margin-bottom: 2px;
  }
  p {
    font-size: 12.5px;
    color: ${theme.colors.muted};
  }
`;

const Help = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    background: ${theme.colors.cream};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radius.md};
    padding: 15px 17px;
    font-size: 13.5px;
    color: ${theme.colors.ink};
    transition: all 0.2s ease;
    svg {
      color: ${theme.colors.green};
      flex-shrink: 0;
    }
    span {
      display: block;
      font-size: 11.5px;
      color: ${theme.colors.muted};
    }
    &:hover {
      border-color: ${theme.colors.forest};
      background: #fff;
    }
  }
`;

const STAGES = [
  { key: 'pending', title: 'Order received', text: 'Your order request is logged with our team.' },
  { key: 'confirmed', title: 'Order confirmed', text: 'Stock and delivery details verified; invoice shared.' },
  { key: 'processing', title: 'In production', text: 'Gifts are being branded, assembled and packed.' },
  { key: 'packed', title: 'Quality check & packed', text: 'Final inspection against the approved sample.' },
  { key: 'shipped', title: 'Dispatched', text: 'Handed to the delivery partner with tracking.' },
  { key: 'delivered', title: 'Delivered', text: 'Received at the shipping address.' },
];

const STATUS_INDEX = { pending: 0, confirmed: 1, processing: 2, packed: 3, shipped: 4, delivered: 5 };

const STATUS_LABEL = {
  pending: 'Order received',
  confirmed: 'Confirmed',
  processing: 'In production',
  packed: 'Packed',
  shipped: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const PAYMENT_LABEL = {
  pending: 'Payment pending',
  authorized: 'Payment authorised',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
};

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

export default function TrackOrderPage({ initialNumber = '', contact = {} }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const email = contact.email || 'hello@rooteco.in';
  const phone = contact.phone || '';

  const onSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setResult(null);
    setLoading(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: data.orderId, email: data.email }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'We could not find that order. Check the reference and email.');
      }
      setResult(payload.data);
    } catch (lookupError) {
      setError(lookupError.message || 'We could not find that order. Check the reference and email.');
    } finally {
      setLoading(false);
    }
  };

  const current = result ? STATUS_INDEX[result.status] ?? 0 : 0;
  const itemCount = result?.items?.reduce((sum, item) => sum + item.qty, 0) || 0;

  return (
    <>
      <PageHero
        eyebrow="Order tracking"
        title="Track your order"
        subtitle="Enter your order reference and the email used at checkout to see the latest status from our workshop."
        crumbs={[{ label: 'Track Order' }]}
      />

      <Section>
        <Container>
          <Wrap>
            <Panel>
              <h2>Find your order</h2>
              <p className="lead">
                Your reference looks like <strong>RE-261103-A1B2</strong> — it is on your order
                confirmation.
              </p>
              <form onSubmit={onSubmit}>
                <Grid>
                  <Field>
                    Order reference <span className="req">*</span>
                    <input
                      name="orderId"
                      required
                      defaultValue={initialNumber}
                      placeholder="RE-261103-A1B2"
                      autoComplete="off"
                    />
                  </Field>
                  <Field>
                    Email address <span className="req">*</span>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                  </Field>
                </Grid>
                <div style={{ marginTop: 20 }}>
                  <Button type="submit" disabled={loading}>
                    <Search size={15} /> {loading ? 'Looking up…' : 'Track order'}
                  </Button>
                </div>
                {error && <ErrorNote role="alert">{error}</ErrorNote>}
              </form>
            </Panel>

            {result && (
              <Status>
                <div className="top">
                  <span className="icon">
                    <Truck size={22} />
                  </span>
                  <div className="id">
                    <span>Order reference</span>
                    <strong>{result.number}</strong>
                  </div>
                  <span className="pill">{STATUS_LABEL[result.status] || result.status}</span>
                </div>
                <div className="body">
                  <div className="meta">
                    <span>
                      Placed: <strong>{fmt(result.createdAt)}</strong>
                    </span>
                    <span>
                      Items: <strong>{itemCount}</strong>
                    </span>
                    <span>
                      Order total: <strong>{formatINR(result.total)}</strong>
                    </span>
                    <span>
                      Payment: <strong>{PAYMENT_LABEL[result.paymentStatus] || result.paymentStatus}</strong>
                    </span>
                    <span>
                      Deliver to: <strong>{[result.city, result.state].filter(Boolean).join(', ')}</strong>
                    </span>
                  </div>
                  {result.status === 'cancelled' ? (
                    <p style={{ fontSize: 13.5, color: theme.colors.muted }}>
                      This order was cancelled. If this is unexpected, contact our team and we will
                      help you place a fresh order.
                    </p>
                  ) : (
                    <Timeline>
                      {STAGES.map((stage, i) => {
                        const done = i < current;
                        const now = i === current;
                        return (
                          <li key={stage.key} className={`${done ? 'done' : ''} ${now ? 'now' : ''}`}>
                            <span className="dot">
                              {done ? <Check size={14} /> : now ? <Package size={13} /> : i + 1}
                            </span>
                            <div>
                              <h3>{stage.title}</h3>
                              <p>{stage.text}</p>
                            </div>
                          </li>
                        );
                      })}
                    </Timeline>
                  )}
                </div>
              </Status>
            )}

            {!result && (
              <Panel>
                <h2>Need a hand?</h2>
                <p className="lead">
                  If you can&apos;t find your reference, our team can look it up for you.
                </p>
                <Help>
                  <a href={`mailto:${email}`}>
                    <Mail size={20} />
                    <div>
                      Email support
                      <span>{email}</span>
                    </div>
                  </a>
                  {phone && (
                    <a href={`tel:${phone.replace(/\s/g, '')}`}>
                      <Phone size={20} />
                      <div>
                        Call us
                        <span>{phone}</span>
                      </div>
                    </a>
                  )}
                  <Link href="/faq">
                    <Clock size={20} />
                    <div>
                      Delivery FAQs
                      <span>Lead times, multi-address & more</span>
                    </div>
                  </Link>
                  <Link href="/contact">
                    <ArrowRight size={20} />
                    <div>
                      Contact the team
                      <span>We reply within one business day</span>
                    </div>
                  </Link>
                </Help>
              </Panel>
            )}
          </Wrap>
        </Container>
      </Section>
    </>
  );
}
