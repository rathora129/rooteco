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
import { brand } from '@/data/navigation';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';
import { Button, Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import { DemoNote, Field, Full, Grid } from '@/components/forms/formStyles';

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
  { title: 'Order received', text: 'Purchase order confirmed and logged.' },
  { title: 'Branding approved', text: 'Artwork and mock-up signed off by you.' },
  { title: 'In production', text: 'Gifts are being branded, assembled and packed.' },
  { title: 'Quality check', text: 'Final inspection against approved samples.' },
  { title: 'Dispatched', text: 'Handed to the delivery partner with tracking.' },
  { title: 'Delivered', text: 'Received at the shipping address.' },
];

const CURRENT = 2;

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

export default function TrackOrderPage() {
  const [result, setResult] = useState(null);

  const onSubmit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    let saved = null;
    try {
      const raw = sessionStorage.getItem('rooteco-order');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          String(parsed.id).toLowerCase() === String(data.orderId).trim().toLowerCase() ||
          parsed.customer?.email?.toLowerCase() === String(data.email).trim().toLowerCase()
        ) {
          saved = parsed;
        }
      }
    } catch {
      saved = null;
    }

    setResult({
      id: saved?.id || String(data.orderId).trim().toUpperCase(),
      email: String(data.email).trim(),
      matched: Boolean(saved),
      placed: saved ? fmt(saved.date) : null,
      items: saved?.itemCount || null,
      total: saved?.total || null,
      status: CURRENT,
      eta: '3–5 working days after dispatch (demo)',
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Order tracking"
        title="Track your order"
        subtitle="Enter your order reference and email to see the latest demo status. This tracker is a simulated preview — no live logistics data is connected."
        crumbs={[{ label: 'Track Order' }]}
      />

      <Section>
        <Container>
          <Wrap>
            <Panel>
              <h2>Find your order</h2>
              <p className="lead">
                Your reference looks like <strong>RE-123456</strong> (demo format).
              </p>
              <form onSubmit={onSubmit}>
                <Grid>
                  <Field>
                    Order reference <span className="req">*</span>
                    <input
                      name="orderId"
                      required
                      placeholder="RE-123456"
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
                  <Button type="submit">
                    <Search size={15} /> Track Order
                  </Button>
                </div>
                <DemoNote>
                  Demo tracker — statuses are illustrative and no live shipment lookup is
                  performed.
                </DemoNote>
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
                    <strong>{result.id}</strong>
                  </div>
                  <span className="pill">In production · Demo</span>
                </div>
                <div className="body">
                  <div className="meta">
                    {result.matched ? (
                      <>
                        <span>
                          Placed: <strong>{result.placed}</strong>
                        </span>
                        <span>
                          Items: <strong>{result.items}</strong>
                        </span>
                        <span>
                          Order total: <strong>{formatINR(result.total)}</strong>
                        </span>
                      </>
                    ) : (
                      <span>
                        Showing a simulated status for{' '}
                        <strong>{result.email}</strong>. No matching demo order was found in this
                        browser — the timeline below is illustrative only.
                      </span>
                    )}
                    <span>
                      Estimated dispatch: <strong>{result.eta}</strong>
                    </span>
                  </div>
                  <Timeline>
                    {STAGES.map((stage, i) => {
                      const done = i < result.status;
                      const now = i === result.status;
                      return (
                        <li key={stage.title} className={`${done ? 'done' : ''} ${now ? 'now' : ''}`}>
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
                  <a href={`mailto:${brand.email}`}>
                    <Mail size={20} />
                    <div>
                      Email support
                      <span>{brand.email}</span>
                    </div>
                  </a>
                  <a href={`tel:${brand.phone.replace(/\s/g, '')}`}>
                    <Phone size={20} />
                    <div>
                      Call us
                      <span>{brand.phone}</span>
                    </div>
                  </a>
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
                <DemoNote>Demo contact details for this storefront.</DemoNote>
              </Panel>
            )}
          </Wrap>
        </Container>
      </Section>
    </>
  );
}
