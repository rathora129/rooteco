'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react';
import { brand } from '@/data/navigation';
import theme from '@/styles/theme';
import { Button, Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import { CheckLine, DemoNote, Field, Full, Grid, Success } from '@/components/forms/formStyles';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
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
    font-size: 25px;
    color: ${theme.colors.forest};
    margin-bottom: 4px;
  }
  > p.lead {
    font-size: 13.5px;
    color: ${theme.colors.muted};
    margin-bottom: 22px;
  }
`;

const SideCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const InfoCard = styled.div`
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  border-radius: ${theme.radius.lg};
  padding: 28px;
  h3 {
    color: #fff;
    font-size: 22px;
    margin-bottom: 18px;
  }
  .row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid rgba(246, 241, 231, 0.14);
    &:last-of-type {
      border-bottom: none;
    }
    svg {
      color: ${theme.colors.goldLight};
      flex-shrink: 0;
      margin-top: 3px;
    }
    span {
      display: block;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(246, 241, 231, 0.6);
      margin-bottom: 2px;
    }
    a,
    strong {
      font-size: 14.5px;
      font-weight: 500;
      color: ${theme.colors.cream};
    }
    a:hover {
      color: ${theme.colors.goldLight};
    }
  }
  .note {
    margin-top: 14px;
    font-size: 11.5px;
    color: rgba(246, 241, 231, 0.55);
  }
`;

const Quick = styled.div`
  background: ${theme.colors.cream};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  padding: 18px 20px;
  font-size: 13.5px;
  color: ${theme.colors.muted};
  line-height: 1.65;
  a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    color: ${theme.colors.forest};
    font-weight: 600;
  }
`;

const TOPICS = [
  'New bulk enquiry',
  'Existing order support',
  'Customization / branding',
  'Samples request',
  'Partnership',
  'Something else',
];

export default function ContactPage({ contact = {} }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const email = contact.email || brand.email;
  const phone = contact.phone || brand.phone;
  const hours = contact.hours || brand.hours;
  const address = contact.address || brand.address;

  const onSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setError('');
    setSending(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const topic = data.topic;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          company: data.company || undefined,
          email: data.email,
          phone: data.phone,
          productInterest: topic,
          requirement: `${topic}: ${data.message}`,
          source: 'contact-form',
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        const details = payload?.error?.details;
        const detailText = Array.isArray(details)
          ? details.map((detail) => detail.message).filter(Boolean).join(' ')
          : '';
        throw new Error(detailText || payload?.error?.message || 'We could not send your message. Please try again.');
      }
      setSent(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      setError(submitError.message || 'We could not send your message. Please try again.');
      setSending(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="We're here to help"
        title="Contact RootEco"
        subtitle="Questions about a product, a bulk order or an existing delivery? Send a note and our gifting team will get back within one business day."
        crumbs={[{ label: 'Contact' }]}
      />

      <Section>
        <Container>
          <Layout>
            <Panel>
              {sent ? (
                <Success>
                  <CheckCircle2 size={42} />
                  <h2>Message received</h2>
                  <p>
                    Thanks for reaching out. Our gifting team has your enquiry and will reply
                    within one business day.
                  </p>
                  <div className="actions" style={{ marginTop: 20 }}>
                    <Button onClick={() => setSent(false)} $variant="outline">
                      Send another message
                    </Button>
                  </div>
                </Success>
              ) : (
                <>
                  <h2>Send us a message</h2>
                  <p className="lead">
                    Share a few details and we&apos;ll route your message to the right person.
                  </p>
                  <form onSubmit={onSubmit}>
                    <Grid>
                      <Field>
                        Full name <span className="req">*</span>
                        <input name="name" required autoComplete="name" placeholder="Your name" />
                      </Field>
                      <Field>
                        Company
                        <input
                          name="company"
                          autoComplete="organization"
                          placeholder="Company name"
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
                        Phone <span className="req">*</span>
                        <input
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="+91 90000 00000"
                        />
                      </Field>
                      <Full>
                        <Field>
                          Topic <span className="req">*</span>
                          <select name="topic" required defaultValue="">
                            <option value="" disabled>
                              What is this about?
                            </option>
                            {TOPICS.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </Field>
                      </Full>
                      <Full>
                        <Field>
                          Message <span className="req">*</span>
                          <textarea
                            name="message"
                            required
                            style={{ minHeight: 130 }}
                            placeholder="Tell us what you're looking for, with quantities or timelines if you have them."
                          />
                        </Field>
                      </Full>
                    </Grid>
                    <CheckLine>
                      <input type="checkbox" required />
                      <span>
                        I agree to be contacted and accept the{' '}
                        <Link href="/privacy-policy">Privacy Policy</Link>.
                      </span>
                    </CheckLine>
                    <div style={{ marginTop: 20 }}>
                      <Button type="submit" disabled={sending}>
                        <Send size={15} /> {sending ? 'Sending…' : 'Send message'}
                      </Button>
                    </div>
                    {error && (
                      <p
                        role="alert"
                        style={{
                          marginTop: 14,
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: 'rgba(176, 58, 46, 0.08)',
                          border: '1px solid rgba(176, 58, 46, 0.25)',
                          color: theme.colors.sale,
                          fontSize: 12.5,
                          lineHeight: 1.55,
                        }}
                      >
                        {error}
                      </p>
                    )}
                    <DemoNote>
                      We use these details only to respond to your enquiry. Typical reply time is one
                      business day.
                    </DemoNote>
                  </form>
                </>
              )}
            </Panel>

            <SideCol>
              <InfoCard>
                <h3>Talk to a human</h3>
                <div className="row">
                  <Mail size={18} />
                  <div>
                    <span>Email</span>
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                </div>
                <div className="row">
                  <Phone size={18} />
                  <div>
                    <span>Phone</span>
                    <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
                  </div>
                </div>
                <div className="row">
                  <Clock size={18} />
                  <div>
                    <span>Hours</span>
                    <strong>{hours}</strong>
                  </div>
                </div>
                <div className="row">
                  <MapPin size={18} />
                  <div>
                    <span>Address</span>
                    <strong>{address}</strong>
                  </div>
                </div>
                <div className="row">
                  <MessageSquare size={18} />
                  <div>
                    <span>Response time</span>
                    <strong>Within one business day</strong>
                  </div>
                </div>
              </InfoCard>

              <Quick>
                Looking for bulk pricing? Skip the back-and-forth and{' '}
                <Link href="/get-a-quote">
                  request a quote <ArrowRight size={13} />
                </Link>
              </Quick>
            </SideCol>
          </Layout>
        </Container>
      </Section>
    </>
  );
}
