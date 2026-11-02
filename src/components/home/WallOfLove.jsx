'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { Quote, Star } from 'lucide-react';
import Marquee from '@/components/common/Marquee';
import Reveal from '@/components/common/Reveal';
import { Container, Eyebrow, Section, SectionHead } from '@/components/common/ui';
import theme from '@/styles/theme';

const Card = styled.figure`
  width: 380px;
  flex-shrink: 0;
  margin: 0 12px;
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.25s ease;
  &:hover {
    box-shadow: ${theme.shadow.card};
  }
  @media (max-width: 520px) {
    width: 300px;
  }
  blockquote {
    font-size: 14.5px;
    color: ${theme.colors.ink};
    line-height: 1.65;
  }
  .stars {
    display: flex;
    gap: 3px;
    svg {
      width: 14px;
      height: 14px;
      color: ${theme.colors.gold};
      fill: ${theme.colors.gold};
    }
  }
  figcaption {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: ${theme.colors.forest};
      color: ${theme.colors.goldLight};
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 14px;
    }
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
  .quote-mark {
    color: ${theme.colors.gold};
    opacity: 0.5;
  }
`;

const DemoNote = styled.p`
  text-align: center;
  margin-top: 26px;
  font-size: 12.5px;
  color: ${theme.colors.muted};
  a {
    color: ${theme.colors.forest};
    font-weight: 600;
    text-decoration: underline;
  }
`;

export default function WallOfLove({ testimonials = [] }) {
  if (!testimonials.length) return null;
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHead>
            <Eyebrow>Wall of Love</Eyebrow>
            <h2>What our clients say</h2>
            <p>Stories from teams who trusted RootEco with their gifting moments.</p>
          </SectionHead>
        </Reveal>
      </Container>
      <Reveal delay={0.1}>
        <Marquee duration="55s">
          {testimonials.map((t) => (
            <Card key={t.id}>
              <Quote className="quote-mark" size={26} />
              <blockquote>“{t.review}”</blockquote>
              <div className="stars" aria-label={`${t.rating} star rating`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} />
                ))}
              </div>
              <figcaption>
                <span className="avatar">
                  {t.client.charAt(0)}
                  {t.role.charAt(0)}
                </span>
                <div>
                  <strong>{t.client}{t.role ? `, ${t.role}` : ''}</strong>
                  <span>{t.company}</span>
                </div>
              </figcaption>
            </Card>
          ))}
        </Marquee>
      </Reveal>
      <Container>
        <DemoNote>
          See <Link href="/wall-of-love">all testimonials</Link>.
        </DemoNote>
      </Container>
    </Section>
  );
}
