'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  PackageCheck,
  Phone,
  Sparkles,
} from 'lucide-react';
import theme from '@/styles/theme';
import { Button, ButtonLink, Container, Section } from '@/components/common/ui';
import { CheckLine, DemoNote, Field, Full, Grid, Success, SubmitRow } from './formStyles';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 40px;
  align-items: start;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
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
    margin-bottom: 22px;
  }
`;

const Selected = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: ${theme.radius.md};
  background: ${theme.colors.cream};
  border: 1px solid ${theme.colors.line};
  margin-bottom: 20px;
  .thumb {
    position: relative;
    width: 58px;
    height: 58px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: #fff;
    img {
      object-fit: cover;
    }
  }
  .info {
    min-width: 0;
    flex: 1;
    span {
      display: block;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${theme.colors.green};
      font-weight: 700;
    }
    strong {
      display: block;
      font-size: 14px;
      color: ${theme.colors.ink};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    em {
      font-style: normal;
      font-size: 12.5px;
      color: ${theme.colors.muted};
    }
  }
  button {
    font-size: 12.5px;
    font-weight: 600;
    color: ${theme.colors.sale};
    white-space: nowrap;
  }
`;

const Aside = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 96px;
  @media (max-width: 960px) {
    position: static;
  }
`;

const Card = styled.div`
  background: ${(p) => (p.$dark ? theme.colors.forest : '#fff')};
  color: ${(p) => (p.$dark ? theme.colors.cream : theme.colors.ink)};
  border: 1px solid ${(p) => (p.$dark ? theme.colors.forest : theme.colors.line)};
  border-radius: ${theme.radius.lg};
  padding: 26px;
  h3 {
    font-size: 21px;
    margin-bottom: 16px;
    color: ${(p) => (p.$dark ? '#fff' : theme.colors.forest)};
  }
`;

const Steps = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 16px;
  li {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 13.5px;
    line-height: 1.5;
    color: ${(p) => (p.$dark ? 'rgba(246,241,231,0.8)' : theme.colors.muted)};
  }
  .n {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: ${(p) => (p.$dark ? 'rgba(201,162,39,0.2)' : theme.colors.cream)};
    color: ${(p) => (p.$dark ? theme.colors.goldLight : theme.colors.forest)};
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }
  strong {
    display: block;
    color: ${(p) => (p.$dark ? '#fff' : theme.colors.ink)};
    font-weight: 600;
    font-size: 13.5px;
  }
`;

const Contact = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 13.5px;
  a {
    display: flex;
    align-items: center;
    gap: 9px;
    color: ${theme.colors.ink};
    font-weight: 500;
    &:hover {
      color: ${theme.colors.green};
    }
    svg {
      color: ${theme.colors.green};
      flex-shrink: 0;
    }
  }
  .hours {
    display: flex;
    align-items: center;
    gap: 9px;
    color: ${theme.colors.muted};
    svg {
      color: ${theme.colors.green};
      flex-shrink: 0;
    }
  }
  .demo {
    margin-top: 6px;
    font-size: 11.5px;
    color: ${theme.colors.muted};
  }
`;

const Perks = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 11px;
  font-size: 13.5px;
  li {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    color: ${theme.colors.muted};
    svg {
      color: ${theme.colors.green};
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
`;

const BUDGETS = [
  'Under ₹500 per gift',
  '₹500 – ₹1,000 per gift',
  '₹1,000 – ₹2,500 per gift',
  '₹2,500 – ₹5,000 per gift',
  '₹5,000+ per gift',
  'Flexible / need guidance',
];

const OCCASIONS = [
  'Employee onboarding',
  'Diwali / festive gifting',
  'Client appreciation',
  'Employee rewards',
  'Event or conference',
  'Work anniversary',
  'Other',
];

export default function QuoteForm({ products = [], contact = {} }) {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get('product') || '';
  const initialProduct = initialSlug ? products.find((p) => p.slug === initialSlug) : null;
  const [productSlug, setProductSlug] = useState(initialProduct ? initialSlug : '');
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const selected = products.find((p) => p.slug === productSlug);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setError('');
    setSubmitting(true);
    try {
      const notes = [
        data.occasion && `Occasion: ${data.occasion}`,
        data.deliveryCity && `Delivery: ${data.deliveryCity}`,
        data.requiredBy && `Required by: ${data.requiredBy}`,
      ]
        .filter(Boolean)
        .join(' · ');
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.fullName,
          company: data.company,
          email: data.email,
          phone: data.phone,
          productId: selected?.id || null,
          productName: selected?.name || (data.product === 'custom' ? 'Custom gifting' : null),
          quantity: Number(data.quantity) || null,
          budget: data.budget,
          branding: [data.customization, notes].filter(Boolean).join('\n'),
          message: data.message,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Could not submit your quote request.');
      }
      const reference = `Q-${String(payload.data.id).slice(-6).toUpperCase()}`;
      setSubmitted({ reference, ...data });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Section>
        <Container style={{ maxWidth: 860 }}>
          <Success>
            <CheckCircle2 size={44} />
            <h2>Quote request received</h2>
            <p>
              Thanks, {String(submitted.fullName).split(' ')[0]}. Our gifting team will review your
              requirements and respond at <strong>{submitted.email}</strong> within one business day.
            </p>
            <span className="ref">Reference {submitted.reference}</span>
            <div className="actions">
              <ButtonLink href="/products">Explore products</ButtonLink>
              <Button $variant="outline" onClick={() => setSubmitted(null)}>
                Send another enquiry
              </Button>
            </div>
          </Success>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <Layout>
          <Panel>
            <h2>Tell us what you need</h2>
            <p className="lead">
              Share a few details and we&apos;ll come back with curated options, branding samples
              and tiered pricing. Takes about two minutes.
            </p>

            {selected && (
              <Selected>
                <span className="thumb">
                  <Image src={selected.images[0]} alt={selected.name} fill sizes="58px" />
                </span>
                <span className="info">
                  <span>Enquiring about</span>
                  <strong>{selected.name}</strong>
                  <em>{selected.type}</em>
                </span>
                <button type="button" onClick={() => setProductSlug('')}>
                  Remove
                </button>
              </Selected>
            )}

            <form onSubmit={onSubmit}>
              <Grid>
                <Field>
                  Full name <span className="req">*</span>
                  <input name="fullName" required autoComplete="name" placeholder="Your name" />
                </Field>
                <Field>
                  Company name <span className="req">*</span>
                  <input
                    name="company"
                    required
                    autoComplete="organization"
                    placeholder="Company / organisation"
                  />
                </Field>
                <Field>
                  Work email <span className="req">*</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                  />
                </Field>
                <Field>
                  Phone number <span className="req">*</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+91 90000 00000"
                  />
                </Field>

                <Full>
                  <Field>
                    Product of interest <span className="req">*</span>
                    <select
                      name="product"
                      required
                      value={productSlug}
                      onChange={(e) => setProductSlug(e.target.value)}
                    >
                      <option value="">Select a product or choose custom</option>
                      <option value="custom">Custom gifting / not sure yet</option>
                      {products.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </Full>

                <Field>
                  Estimated quantity <span className="req">*</span>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 100"
                    inputMode="numeric"
                  />
                </Field>
                <Field>
                  Budget per gift <span className="req">*</span>
                  <select name="budget" required defaultValue="">
                    <option value="" disabled>
                      Select a budget range
                    </option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  Occasion <span className="req">*</span>
                  <select name="occasion" required defaultValue="">
                    <option value="" disabled>
                      Select an occasion
                    </option>
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field>
                  Required-by date
                  <input name="requiredBy" type="date" />
                </Field>

                <Full>
                  <Field>
                    Delivery city / locations <span className="req">*</span>
                    <input
                      name="deliveryCity"
                      required
                      placeholder="e.g. Bengaluru — single office, or pan-India multi-address"
                    />
                  </Field>
                </Full>

                <Full>
                  <Field>
                    Customization &amp; branding requirements
                    <textarea
                      name="customization"
                      placeholder="Logo placement, engraving, packaging, gift notes, individual names…"
                    />
                  </Field>
                </Full>

                <Full>
                  <Field>
                    Anything else we should know?
                    <textarea
                      name="message"
                      placeholder="Timelines, budget constraints, sample requirements…"
                    />
                  </Field>
                </Full>
              </Grid>

              <CheckLine>
                <input type="checkbox" required />
                <span>
                  I agree to be contacted about this enquiry and accept the{' '}
                  <Link href="/privacy-policy">Privacy Policy</Link>.
                </span>
              </CheckLine>

              {error && (
                <DemoNote role="alert" style={{ textAlign: 'left', color: theme.colors.sale }}>
                  {error}
                </DemoNote>
              )}

              <SubmitRow>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Request My Quote'} <ArrowRight size={16} />
                </Button>
                <span className="hint">No obligation · Response within one business day</span>
              </SubmitRow>

              <DemoNote>
                Demo enquiry form — submissions are not sent to a server and no data leaves your
                browser.
              </DemoNote>
            </form>
          </Panel>

          <Aside>
            <Card $dark>
              <h3>How it works</h3>
              <Steps $dark>
                <li>
                  <span className="n">1</span>
                  <div>
                    <strong>Share your brief</strong>
                    Quantity, budget, occasion and branding needs.
                  </div>
                </li>
                <li>
                  <span className="n">2</span>
                  <div>
                    <strong>Get a curated quote</strong>
                    Options matched to your brief and budget per gift.
                  </div>
                </li>
                <li>
                  <span className="n">3</span>
                  <div>
                    <strong>Approve a sample</strong>
                    Branding mock-ups and physical samples before production.
                  </div>
                </li>
                <li>
                  <span className="n">4</span>
                  <div>
                    <strong>Production to doorstep</strong>
                    Quality-checked, packed and delivered pan India.
                  </div>
                </li>
              </Steps>
            </Card>

            <Card>
              <h3>Why request a quote?</h3>
              <Perks>
                <li>
                  <BadgeCheck size={16} /> Tiered pricing that improves with volume
                </li>
                <li>
                  <Sparkles size={16} /> Free digital branding mock-up
                </li>
                <li>
                  <PackageCheck size={16} /> Sample approval before production
                </li>
                <li>
                  <Building2 size={16} /> Dedicated account manager
                </li>
              </Perks>
            </Card>

            <Card>
              <h3>Prefer to talk?</h3>
              <Contact>
                <a href={`mailto:${contact.email || 'hello@rooteco.example.com'}`}>
                  <Mail size={16} /> {contact.email || 'hello@rooteco.example.com'}
                </a>
                <a href={`tel:${String(contact.phone || '').replace(/\s/g, '')}`}>
                  <Phone size={16} /> {contact.phone || '+91 90000 00000'}
                </a>
                <span className="hours">
                  <Clock size={16} /> {contact.hours || 'Mon–Sat, 10:00–19:00 IST'}
                </span>
              </Contact>
            </Card>
          </Aside>
        </Layout>
      </Container>
    </Section>
  );
}
