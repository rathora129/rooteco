'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight, Mail, Phone, Sparkles } from 'lucide-react';
import theme from '@/styles/theme';
import { Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import FAQAccordion from '@/components/common/FAQAccordion';

const Wrap = styled.div`
  max-width: 880px;
  margin: 0 auto;
`;

const Support = styled.div`
  margin-top: 44px;
  h2 {
    font-size: 28px;
    color: ${theme.colors.forest};
    text-align: center;
    margin-bottom: 6px;
  }
  > p {
    text-align: center;
    color: ${theme.colors.muted};
    font-size: 14.5px;
    margin-bottom: 24px;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  }
  .card {
    background: #fff;
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radius.md};
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    transition: all 0.2s ease;
    svg {
      color: ${theme.colors.green};
      margin-bottom: 6px;
    }
    strong {
      font-size: 15px;
      color: ${theme.colors.ink};
    }
    span {
      font-size: 12.5px;
      color: ${theme.colors.muted};
      line-height: 1.5;
    }
    &:hover {
      border-color: ${theme.colors.forest};
      transform: translateY(-3px);
      box-shadow: ${theme.shadow.soft};
    }
  }
`;

const HelpLine = styled.p`
  text-align: center;
  font-size: 13.5px;
  color: ${theme.colors.muted};
  margin-top: 22px;
  a {
    color: ${theme.colors.forest};
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
`;

export default function FAQPage({ faqs = [], contact = {} }) {
  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about MOQs, branding, samples, payments and delivery. Still stuck? Our gifting team is happy to help."
        crumbs={[{ label: 'FAQ' }]}
      />

      <Section>
        <Container>
          <Wrap>
            <FAQAccordion items={faqs} defaultOpen={0} />

            <Support>
              <h2>Still have a question?</h2>
              <p>Pick the fastest way to reach us.</p>
              <div className="cards">
                <a className="card" href={`mailto:${contact.email || 'hello@rooteco.example.com'}`}>
                  <Mail size={20} />
                  <strong>Email us</strong>
                  <span>{contact.email || 'hello@rooteco.example.com'}</span>
                  <span>Replies within one business day.</span>
                </a>
                <a className="card" href={`tel:${String(contact.phone || '').replace(/\s/g, '')}`}>
                  <Phone size={20} />
                  <strong>Call us</strong>
                  <span>{contact.phone || '+91 90000 00000'}</span>
                  <span>{contact.hours || 'Mon–Sat, 10:00–19:00 IST'}</span>
                </a>
                <Link className="card" href="/get-a-quote">
                  <Sparkles size={20} />
                  <strong>Get a quote</strong>
                  <span>Share your brief and budget.</span>
                  <span>Curated options, usually in a day.</span>
                </Link>
              </div>
              <HelpLine>
                Demo contact details for this storefront —{' '}
                <Link href="/contact">
                  see contact page <ArrowRight size={13} />
                </Link>
              </HelpLine>
            </Support>
          </Wrap>
        </Container>
      </Section>
    </>
  );
}
