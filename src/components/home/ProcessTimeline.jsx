'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BadgeCheck, CheckCircle2 } from 'lucide-react';
import { processSteps } from '@/data/navigation';
import Reveal from '@/components/common/Reveal';
import { Container, Eyebrow, Section, SectionHead } from '@/components/common/ui';
import theme from '@/styles/theme';

const Timeline = styled.div`
  position: relative;
  max-width: 860px;
  margin: 0 auto;
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 27px;
    width: 2px;
    background: linear-gradient(
      ${theme.colors.creamDark},
      ${theme.colors.green} 60%,
      ${theme.colors.gold}
    );
    @media (min-width: 768px) {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const Step = styled(motion.div)`
  position: relative;
  display: flex;
  gap: 26px;
  padding: 0 0 38px 0;
  @media (min-width: 768px) {
    width: 50%;
    &:nth-child(odd) {
      margin-left: 0;
      padding-right: 46px;
      text-align: right;
      flex-direction: row-reverse;
      .num {
        right: -27px;
        left: auto;
      }
    }
    &:nth-child(even) {
      margin-left: 50%;
      padding-left: 46px;
      .num {
        left: -27px;
      }
    }
  }
  @media (max-width: 767px) {
    padding-left: 70px;
    .num {
      left: 0;
    }
  }
  &:last-child {
    padding-bottom: 0;
  }
`;

const Num = styled.span`
  position: absolute;
  top: 0;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid ${theme.colors.green};
  color: ${theme.colors.forest};
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 16px;
  z-index: 2;
  box-shadow: ${theme.shadow.soft};
  &.final {
    background: ${theme.colors.gold};
    border-color: ${theme.colors.gold};
    color: ${theme.colors.forest};
  }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  padding: 18px 22px;
  flex: 1;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  &:hover {
    box-shadow: ${theme.shadow.card};
    transform: translateY(-3px);
  }
  h3 {
    font-size: 17px;
    color: ${theme.colors.forest};
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    @media (min-width: 768px) {
      .step:nth-child(odd) & {
        justify-content: flex-end;
      }
    }
  }
  p {
    font-size: 14px;
    color: ${theme.colors.muted};
  }
`;

const Complete = styled.div`
  max-width: 860px;
  margin: 34px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: ${theme.colors.green};
  font-weight: 700;
  font-size: 16px;
  svg {
    color: ${theme.colors.gold};
  }
`;

export default function ProcessTimeline() {
  return (
    <Section style={{ background: theme.colors.cream }}>
      <Container>
        <Reveal>
          <SectionHead>
            <Eyebrow>The Process</Eyebrow>
            <h2>Process &amp; track delivery of every order</h2>
            <p>In just a few easy steps — from purchase order to doorstep.</p>
          </SectionHead>
        </Reveal>
        <Timeline>
          {processSteps.map((step, i) => (
            <Step
              key={step.title}
              className="step"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            >
              <Num className={`num ${i === processSteps.length - 1 ? 'final' : ''}`}>
                {i === processSteps.length - 1 ? <BadgeCheck size={22} /> : i + 1}
              </Num>
              <Card>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Card>
            </Step>
          ))}
        </Timeline>
        <Reveal>
          <Complete>
            <CheckCircle2 size={22} /> Successful Order Fulfilment
          </Complete>
        </Reveal>
      </Container>
    </Section>
  );
}
