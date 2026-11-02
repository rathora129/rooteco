'use client';

import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowRight, Check } from 'lucide-react';
import { unsplash } from '@/lib/utils';
import Reveal from '@/components/common/Reveal';
import FAQAccordion from '@/components/common/FAQAccordion';
import { Container, Eyebrow, Section, SectionHead } from '@/components/common/ui';
import theme from '@/styles/theme';

/* ---------- Section 14: "Swag is always..." equivalent ---------- */

const SwagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const SwagCard = styled(Link)`
  position: relative;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  aspect-ratio: 3 / 4;
  display: block;
  img {
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 45%, rgba(8, 43, 32, 0.92));
  }
  &:hover img {
    transform: scale(1.06);
  }
  .cap {
    position: absolute;
    z-index: 2;
    left: 22px;
    right: 22px;
    bottom: 22px;
    color: #fff;
    .always {
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: ${theme.colors.goldLight};
      margin-bottom: 6px;
    }
    h3 {
      font-size: 24px;
      margin-bottom: 6px;
    }
    p {
      font-size: 13.5px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
`;

const swagCards = [
  {
    title: 'On-brand',
    text: 'Colors, finishes and packaging tuned to your identity.',
    image: unsplash('photo-1523381210434-271e8be1f52b'),
    link: '/categories/customized-merchandise',
  },
  {
    title: 'On-time',
    text: 'Tracked timelines from PO to doorstep, every single order.',
    image: unsplash('photo-1522071820081-009f0129c71c'),
    link: '/track-order',
  },
  {
    title: 'Unforgettable',
    text: 'Gifts people keep, photograph and talk about.',
    image: unsplash('photo-1549465220-1a8b9238cd48'),
    link: '/wall-of-love',
  },
];

export function SwagIsAlways() {
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHead>
            <Eyebrow>RootEco is Always</Eyebrow>
            <h2>Gifting, elevated</h2>
          </SectionHead>
        </Reveal>
        <SwagGrid>
          {swagCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <SwagCard href={card.link}>
                <Image src={card.image} alt={card.title} fill sizes="(max-width: 860px) 100vw, 33vw" />
                <div className="cap">
                  <div className="always">RootEco is always</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </SwagCard>
            </Reveal>
          ))}
        </SwagGrid>
      </Container>
    </Section>
  );
}

/* ---------- Section 15: Corporate gifting made easy ---------- */

const EasyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 34px;
  }
`;

const EasyMedia = styled.div`
  position: relative;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  aspect-ratio: 4 / 3.2;
  img {
    object-fit: cover;
  }
`;

const Points = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 26px 0 30px;
  li {
    display: flex;
    gap: 12px;
    font-size: 15px;
    color: ${theme.colors.ink};
    svg {
      color: ${theme.colors.green};
      flex-shrink: 0;
      margin-top: 3px;
    }
  }
`;

export function CorporateMadeEasy() {
  return (
    <Section style={{ background: '#fff' }}>
      <Container>
        <EasyGrid>
          <Reveal>
            <EasyMedia>
              <Image
                src={unsplash('photo-1521791136064-7986c2920216', 1100)}
                alt="Corporate gifting partnership"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </EasyMedia>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <Eyebrow>For Teams Everywhere</Eyebrow>
              <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 40px)', color: theme.colors.forest, margin: '12px 0 14px' }}>
                Corporate Gifting Made Easy for Teams Everywhere
              </h2>
              <p style={{ color: theme.colors.muted }}>
                Bulk gifting, custom merchandise, employee welcome kits and client appreciation —
                one curated catalogue, one dedicated contact, one reliable delivery network.
              </p>
              <Points>
                <li><Check size={18} /> Curated solutions for every budget per gift</li>
                <li><Check size={18} /> Custom branding applied in-house</li>
                <li><Check size={18} /> Multi-address doorstep delivery across India</li>
                <li><Check size={18} /> Transparent PO → PI → sample → production → delivery flow</li>
              </Points>
              <Link
                href="/get-a-quote"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: theme.colors.forest,
                  color: '#fff',
                  fontWeight: 600,
                  padding: '14px 28px',
                  borderRadius: theme.radius.pill,
                }}
              >
                Start a Bulk Order <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </EasyGrid>
      </Container>
    </Section>
  );
}

/* ---------- Section 16: FAQ ---------- */

export function HomeFaq({ faqs = [], email = 'hello@rooteco.example.com' }) {
  return (
    <Section>
      <Container style={{ maxWidth: 820 }}>
        <Reveal>
          <SectionHead>
            <Eyebrow>Help Center</Eyebrow>
            <h2>Frequently Asked Questions</h2>
            <p>
              If you have any other questions, please email us at{' '}
              <a href={`mailto:${email}`} style={{ color: theme.colors.forest, fontWeight: 600 }}>
                {email}
              </a>
              .
            </p>
          </SectionHead>
        </Reveal>
        <Reveal delay={0.1}>
          <FAQAccordion items={faqs.slice(0, 6)} />
        </Reveal>
        <Reveal>
          <p style={{ textAlign: 'center', marginTop: 26 }}>
            <Link
              href="/faq"
              style={{ color: theme.colors.forest, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              View all FAQs <ArrowRight size={15} />
            </Link>
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
