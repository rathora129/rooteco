'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { brand, offices } from '@/data/navigation';
import Reveal from '@/components/common/Reveal';
import { Container, Eyebrow, Section, SectionHead } from '@/components/common/ui';
import theme from '@/styles/theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MapPanel = styled.div`
  position: relative;
  background: ${theme.colors.forest};
  border-radius: ${theme.radius.lg};
  padding: 30px;
  color: #fff;
  overflow: hidden;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  .glow {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201, 162, 39, 0.4), transparent 70%);
  }
  .india {
    position: absolute;
    top: 26px;
    left: 26px;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
  }
  ul {
    position: relative;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      svg {
        color: ${theme.colors.gold};
        flex-shrink: 0;
      }
    }
  }
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  padding: 26px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.25s ease;
  &:hover {
    box-shadow: ${theme.shadow.card};
    transform: translateY(-4px);
  }
  .pin {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${theme.colors.cream};
    color: ${theme.colors.forest};
    display: grid;
    place-items: center;
    margin-bottom: 8px;
  }
  h3 {
    font-size: 19px;
    color: ${theme.colors.ink};
  }
  .label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${theme.colors.green};
  }
  p {
    font-size: 13.5px;
    color: ${theme.colors.muted};
  }
  a {
    margin-top: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13.5px;
    font-weight: 600;
    color: ${theme.colors.forest};
    padding-top: 12px;
    &:hover {
      gap: 10px;
    }
    transition: gap 0.2s ease;
  }
`;

export default function OfficesSection() {
  return (
    <Section style={{ background: theme.colors.cream }}>
      <Container>
        <Reveal>
          <SectionHead>
            <Eyebrow>Our Offices</Eyebrow>
            <h2>Plan your in-person meet at ease across our offices</h2>
            <p>Demo office locations shown — addresses will be updated soon.</p>
          </SectionHead>
        </Reveal>
        <Grid>
          <Reveal>
            <MapPanel>
              <span className="glow" />
              <span className="india">Pan India Delivery</span>
              <ul>
                <li><MapPin size={16} /> {brand.address}</li>
                <li><Phone size={16} /> {brand.phone} (demo)</li>
                <li><Mail size={16} /> {brand.email} (demo)</li>
                <li><Clock size={16} /> {brand.hours}</li>
              </ul>
            </MapPanel>
          </Reveal>
          <Cards>
            {offices.map((office, i) => (
              <Reveal key={office.city} delay={i * 0.08}>
                <Card>
                  <span className="pin">
                    <MapPin size={20} />
                  </span>
                  <h3>{office.city}</h3>
                  <span className="label">{office.label}</span>
                  <p>{office.detail}</p>
                  <Link href="/contact">
                    Plan a visit <ArrowUpRight size={14} />
                  </Link>
                </Card>
              </Reveal>
            ))}
          </Cards>
        </Grid>
      </Container>
    </Section>
  );
}
