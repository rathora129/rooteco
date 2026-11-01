'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Leaf,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { unsplash } from '@/lib/utils';
import theme from '@/styles/theme';
import { ButtonLink, Container, Eyebrow, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';
import CtaBand from '@/components/common/CtaBand';

const Story = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const Media = styled.div`
  position: relative;
  aspect-ratio: 4 / 3.4;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  img {
    object-fit: cover;
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 0 1px rgba(11, 61, 46, 0.08);
    border-radius: inherit;
    pointer-events: none;
  }
`;

const Copy = styled.div`
  h2 {
    font-size: clamp(28px, 3.6vw, 42px);
    color: ${theme.colors.forest};
    margin: 12px 0 16px;
  }
  p {
    color: ${theme.colors.muted};
    font-size: 15.5px;
    margin-bottom: 14px;
  }
`;

const Points = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 22px 0 28px;
  li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 14.5px;
    color: ${theme.colors.ink};
    svg {
      color: ${theme.colors.green};
      flex-shrink: 0;
      margin-top: 2px;
    }
    strong {
      font-weight: 600;
    }
  }
`;

const Values = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  @media (max-width: 1000px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ValueCard = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 26px 24px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadow.card};
  }
  .icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${theme.colors.cream};
    color: ${theme.colors.green};
    display: grid;
    place-items: center;
    margin-bottom: 16px;
  }
  h3 {
    font-size: 20px;
    color: ${theme.colors.forest};
    margin-bottom: 8px;
  }
  p {
    font-size: 14px;
    color: ${theme.colors.muted};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  border-radius: ${theme.radius.lg};
  padding: 40px 30px;
  text-align: center;
  @media (max-width: 700px) {
    grid-template-columns: 1fr 1fr;
    gap: 28px 16px;
  }
  strong {
    display: block;
    font-family: ${theme.fonts.display};
    font-size: clamp(28px, 4vw, 40px);
    color: ${theme.colors.goldLight};
    line-height: 1;
    margin-bottom: 6px;
  }
  span {
    font-size: 12.5px;
    color: rgba(246, 241, 231, 0.76);
    letter-spacing: 0.04em;
  }
`;

const Approach = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const ApproachCard = styled.div`
  padding: 28px;
  border-radius: ${theme.radius.lg};
  background: ${theme.colors.cream};
  border: 1px solid ${theme.colors.line};
  .n {
    font-family: ${theme.fonts.display};
    font-size: 34px;
    color: ${theme.colors.gold};
    margin-bottom: 12px;
  }
  h3 {
    font-size: 22px;
    color: ${theme.colors.forest};
    margin-bottom: 8px;
  }
  p {
    font-size: 14px;
    color: ${theme.colors.muted};
  }
`;

const DemoNote = styled.p`
  font-size: 12.5px;
  color: ${theme.colors.muted};
  text-align: center;
  margin-top: 30px;
  a {
    color: ${theme.colors.forest};
    font-weight: 600;
    text-decoration: underline;
  }
`;

const VALUES = [
  {
    icon: Sparkles,
    title: 'Curated, not catalogued',
    text: 'Every product is chosen for how it feels unboxed — not just how it looks in a spreadsheet.',
  },
  {
    icon: Leaf,
    title: 'Kinder materials',
    text: 'Eco-friendly options, reusable packaging and products people keep instead of discard.',
  },
  {
    icon: BadgeCheck,
    title: 'Branding with care',
    text: 'Engraving, embroidery, foil and print applied with the finish your brand deserves.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for bulk',
    text: 'Transparent timelines, sample approvals and one accountable contact from quote to delivery.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About RootEco"
        title="Gifting that grows with your team"
        subtitle="We believe a thoughtful gift can do what a thousand emails can't — make people feel seen, valued and part of something."
        crumbs={[{ label: 'About' }]}
        forest
      />

      <Section>
        <Container>
          <Story>
            <Media>
              <Image
                src={unsplash('photo-1522071820081-009f0129c71c', 1400)}
                alt="A team collaborating around a table"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </Media>
            <Copy>
              <Eyebrow>Our Story</Eyebrow>
              <h2>Gifts should feel personal, even at scale</h2>
              <p>
                RootEco began with a simple frustration: corporate gifting often felt like a
                transaction — the same generic mug, the same logo, the same lack of thought. We
                wanted to build something better.
              </p>
              <p>
                So we created a curated catalogue of welcome kits, hampers, tech and everyday
                objects — each one chosen to be genuinely useful, beautifully finished and ready
                to carry your brand. Then we wrapped it in a process built for real teams: clear
                quotes, sample approvals, quality checks and reliable delivery.
              </p>
              <Points>
                <li>
                  <Check size={16} />{' '}
                  <span>
                    <strong>One partner</strong> for products, branding, packaging and delivery.
                  </span>
                </li>
                <li>
                  <Check size={16} />{' '}
                  <span>
                    <strong>Transparent process</strong> from purchase order to final doorstep.
                  </span>
                </li>
                <li>
                  <Check size={16} />{' '}
                  <span>
                    <strong>Gifting with intent</strong> — useful, sustainable and memorable.
                  </span>
                </li>
              </Points>
              <ButtonLink href="/get-a-quote">
                Talk to our team <ArrowRight size={16} />
              </ButtonLink>
            </Copy>
          </Story>
        </Container>
      </Section>

      <Section style={{ paddingTop: 0 }}>
        <Container>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 42px' }}>
            <Eyebrow>What we stand for</Eyebrow>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.6vw, 42px)',
                color: theme.colors.forest,
                margin: '12px 0 10px',
              }}
            >
              Thoughtful by design
            </h2>
            <p style={{ color: theme.colors.muted }}>
              Four principles shape everything we curate, brand and ship.
            </p>
          </div>
          <Values>
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <ValueCard key={value.title}>
                  <span className="icon">
                    <Icon size={22} />
                  </span>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </ValueCard>
              );
            })}
          </Values>
        </Container>
      </Section>

      <Section style={{ paddingTop: 0 }}>
        <Container>
          <Stats>
            <div>
              <strong>28</strong>
              <span>curated gifts in the demo catalogue</span>
            </div>
            <div>
              <strong>10</strong>
              <span>gifting categories</span>
            </div>
            <div>
              <strong>8</strong>
              <span>steps from PO to delivery</span>
            </div>
            <div>
              <strong>1</strong>
              <span>dedicated contact per order</span>
            </div>
          </Stats>
        </Container>
      </Section>

      <Section style={{ paddingTop: 0, background: '#fff' }}>
        <Container>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 42px' }}>
            <Eyebrow>How we work</Eyebrow>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.6vw, 42px)',
                color: theme.colors.forest,
                margin: '12px 0 10px',
              }}
            >
              From brief to doorstep
            </h2>
          </div>
          <Approach>
            <ApproachCard>
              <div className="n">01</div>
              <h3>Understand the brief</h3>
              <p>
                We start with your people, occasion, budget and timeline — not a product list. Then
                we propose options that actually fit.
              </p>
            </ApproachCard>
            <ApproachCard>
              <div className="n">02</div>
              <h3>Build and approve</h3>
              <p>
                Branding mock-ups, samples and packaging are shared for approval before any
                production begins.
              </p>
            </ApproachCard>
            <ApproachCard>
              <div className="n">03</div>
              <h3>Deliver with care</h3>
              <p>
                Every order is quality-checked, carefully packed and delivered across India — to
                one office or many.
              </p>
            </ApproachCard>
          </Approach>

          <DemoNote>
            This is a demo storefront. Catalogue content, reviews and contact details are
            illustrative — see our <Link href="/contact">contact page</Link>.
          </DemoNote>
        </Container>
      </Section>

      <CtaBand
        title="Let's make your next gift unforgettable"
        text="Tell us about your team and the moment you're celebrating. We'll take it from there."
        primary={{ label: 'Get a Quote', href: '/get-a-quote' }}
        secondary={{ label: 'Explore Categories', href: '/categories' }}
      />
    </>
  );
}
