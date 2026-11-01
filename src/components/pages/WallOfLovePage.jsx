'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight, MessageSquareQuote, Quote, Star } from 'lucide-react';
import testimonials from '@/data/testimonials';
import theme from '@/styles/theme';
import { ButtonLink, Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';

const DemoBanner = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px 20px;
  border-radius: ${theme.radius.md};
  background: rgba(201, 162, 39, 0.12);
  border: 1px solid rgba(201, 162, 39, 0.3);
  font-size: 13px;
  line-height: 1.6;
  color: ${theme.colors.ink};
  margin-bottom: 34px;
  svg {
    color: ${theme.colors.gold};
    flex-shrink: 0;
    margin-top: 2px;
  }
  strong {
    font-weight: 700;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.figure`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadow.card};
  }
  blockquote {
    font-size: 15px;
    line-height: 1.7;
    color: ${theme.colors.ink};
  }
  .stars {
    display: flex;
    gap: 3px;
    svg {
      width: 15px;
      height: 15px;
      color: ${theme.colors.gold};
      fill: ${theme.colors.gold};
    }
  }
  figcaption {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
    padding-top: 6px;
    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${theme.colors.forest};
      color: ${theme.colors.goldLight};
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
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
  .qm {
    color: ${theme.colors.gold};
    opacity: 0.55;
  }
`;

const Invite = styled.div`
  margin-top: 48px;
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  border-radius: ${theme.radius.lg};
  padding: 36px 40px;
  display: flex;
  align-items: center;
  gap: 26px;
  flex-wrap: wrap;
  h2 {
    font-size: clamp(24px, 3vw, 32px);
    color: #fff;
    margin-bottom: 6px;
  }
  p {
    font-size: 14.5px;
    color: rgba(246, 241, 231, 0.78);
    max-width: 560px;
  }
  .cta {
    margin-left: auto;
  }
  @media (max-width: 760px) {
    padding: 28px 24px;
    .cta {
      margin-left: 0;
    }
  }
`;

export default function WallOfLovePage() {
  return (
    <>
      <PageHero
        eyebrow="Wall of Love"
        title="Gifting stories we'd love to hear"
        subtitle="A preview of how verified customer stories will look once reviews are connected. Every quote on this page is illustrative demo copy — not a real testimonial."
        crumbs={[{ label: 'Wall of Love' }]}
      />

      <Section>
        <Container>
          <DemoBanner>
            <MessageSquareQuote size={18} />
            <span>
              <strong>Demo content notice:</strong> the eight reviews below are fictional
              placeholders created for layout preview. We don&apos;t display invented customer
              names, company logos or ratings as real endorsements.
            </span>
          </DemoBanner>

          <Grid>
            {testimonials.map((t) => (
              <Card key={t.id}>
                <Quote className="qm" size={28} />
                <blockquote>“{t.review}”</blockquote>
                <div className="stars" aria-label={`${t.rating} out of 5 stars (demo)`}>
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
                    <strong>
                      {t.client}, {t.role}
                    </strong>
                    <span>{t.company} · Demo review</span>
                  </div>
                </figcaption>
              </Card>
            ))}
          </Grid>

          <Invite>
            <div>
              <h2>Planning your own gifting moment?</h2>
              <p>
                See how it feels to work with RootEco — start with a curated quote or build a hamper
                exactly the way you want it.
              </p>
            </div>
            <div className="cta">
              <ButtonLink href="/get-a-quote" $variant="gold">
                Start a Quote <ArrowRight size={16} />
              </ButtonLink>
            </div>
          </Invite>

          <p style={{ textAlign: 'center', fontSize: 13, color: theme.colors.muted, marginTop: 22 }}>
            Have feedback on this demo?{' '}
            <Link href="/contact" style={{ color: theme.colors.forest, fontWeight: 600 }}>
              Tell us here
            </Link>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
