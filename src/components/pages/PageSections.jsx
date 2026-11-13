'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import styled, { css } from 'styled-components';
import { ButtonLink } from '@/components/common/ui';
import { visibleSections } from '@/lib/cms';
import theme from '@/styles/theme';

const Block = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 30px;
  @media (max-width: 640px) {
    padding: 22px;
  }
`;

const Split = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: center;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
  ${(p) =>
    p.$reverse &&
    css`
      @media (min-width: 861px) {
        direction: rtl;
        > * {
          direction: ltr;
        }
      }
    `}
`;

const Media = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  background: ${theme.colors.cream};
  img {
    object-fit: cover;
  }
`;

const Quote = styled.blockquote`
  border-left: 3px solid ${theme.colors.gold};
  padding: 6px 0 6px 24px;
  font-family: ${theme.fonts.display};
  font-size: clamp(21px, 2.6vw, 28px);
  line-height: 1.45;
  color: ${theme.colors.forest};
  cite {
    display: block;
    margin-top: 14px;
    font-family: ${theme.fonts.body};
    font-size: 13px;
    font-style: normal;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
  }
`;

const Cta = styled.div`
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  border-radius: ${theme.radius.lg};
  padding: 38px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  h2 {
    color: #fff;
    font-size: clamp(24px, 3vw, 32px);
    margin-bottom: 8px;
  }
  p {
    color: rgba(246, 241, 231, 0.8);
    max-width: 560px;
  }
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 22px;
`;

const Hero = styled(Block)`
  display: grid;
  gap: 28px;
  align-items: center;
  padding: 40px;
  ${(p) =>
    p.$hasImage &&
    css`
      grid-template-columns: 1.05fr 0.95fr;
      @media (max-width: 860px) {
        grid-template-columns: 1fr;
      }
    `}
  .eyebrow {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${theme.colors.gold};
    margin-bottom: 10px;
  }
  h2 {
    font-family: ${theme.fonts.display};
    font-size: clamp(32px, 4.4vw, 52px);
    line-height: 1.08;
    color: ${theme.colors.forest};
    margin-bottom: 14px;
  }
  @media (max-width: 640px) {
    padding: 26px;
  }
`;

const Steps = styled.ol`
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
  li {
    counter-increment: step;
    position: relative;
    padding: 0 0 14px 42px;
    color: ${theme.colors.muted};
    line-height: 1.7;
    &::before {
      content: counter(step);
      position: absolute;
      left: 0;
      top: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: ${theme.colors.cream};
      color: ${theme.colors.forest};
      font-size: 12px;
      font-weight: 700;
    }
  }
`;

const Shell = styled.div`
  ${(p) =>
    p.$bg === 'cream' &&
    css`
      background: ${theme.colors.cream};
      border-radius: ${theme.radius.lg};
      padding: 26px;
      @media (max-width: 640px) {
        padding: 18px;
      }
    `}
  ${(p) =>
    p.$bg === 'white' &&
    css`
      background: #fff;
      border: 1px solid ${theme.colors.line};
      border-radius: ${theme.radius.lg};
      padding: 26px;
    `}
  ${(p) =>
    p.$bg === 'forest' &&
    css`
      background: ${theme.colors.forest};
      border-radius: ${theme.radius.lg};
      padding: 30px;
      h2,
      h3 {
        color: #fff;
      }
      p,
      li {
        color: rgba(246, 241, 231, 0.82);
      }
      blockquote {
        color: #fff;
      }
    `}
  ${(p) =>
    p.$align === 'center' &&
    css`
      text-align: center;
      blockquote {
        border-left: 0;
        padding-left: 0;
      }
      ${Cta} {
        justify-content: center;
        text-align: center;
      }
    `}
  ${(p) => p.$spacing === 'compact' && css`margin-top: -14px;`}
  ${(p) => p.$spacing === 'roomy' && css`margin-top: 18px;`}
`;

function paragraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function TextBody({ text }) {
  return paragraphs(text).map((block, index) => {
    const lines = block.split('\n');
    if (lines.every((line) => line.trim().startsWith('- '))) {
      return (
        <ul key={index}>
          {lines.map((line, i) => (
            <li key={i}>{line.replace(/^-\s*/, '')}</li>
          ))}
        </ul>
      );
    }
    return <p key={index}>{block}</p>;
  });
}

function safeHref(value, fallback = '/get-a-quote') {
  const href = String(value || '').trim();
  if (!href) return fallback;
  if (href.startsWith('/') || /^https?:\/\//i.test(href)) return href;
  return fallback;
}

function callToAction(section, fallback = '/get-a-quote') {
  const data = section.data || {};
  return {
    href: safeHref(data.href || data.buttonHref, fallback),
    label: data.label || data.buttonLabel || 'Get a quote',
  };
}

function SectionImage({ src, alt, sizes = '(max-width: 860px) 100vw, 50vw' }) {
  if (!src) return null;
  return (
    <Media>
      <Image src={src} alt={alt || ''} fill sizes={sizes} />
    </Media>
  );
}

function SectionBody({ section }) {
  return (
    <div style={{ color: theme.colors.muted, lineHeight: 1.75 }}>
      <TextBody text={section.body} />
    </div>
  );
}

function SectionContent({ section, index }) {
  const type = section.type || 'text';
  const data = section.data || {};
  const heading = section.heading || '';
  const subheading = data.subheading || '';
  const alt = data.imageAlt || heading;
  const { href, label } = callToAction(section);

  if (type === 'hero') {
    return (
      <Hero $hasImage={Boolean(section.image)}>
        <div>
          {subheading && <span className="eyebrow">{subheading}</span>}
          {heading && <h2>{heading}</h2>}
          <SectionBody section={section} />
          <div style={{ marginTop: 20 }}>
            <ButtonLink href={href} $variant="gold">
              {label} <ArrowRight size={15} />
            </ButtonLink>
          </div>
        </div>
        {section.image && (
          <Media style={{ aspectRatio: '5 / 4' }}>
            <Image src={section.image} alt={alt} fill sizes="(max-width: 860px) 100vw, 45vw" priority />
          </Media>
        )}
      </Hero>
    );
  }

  if (type === 'image' || type === 'story') {
    return (
      <Split $reverse={Boolean(data.reverse) || (type === 'story' && index % 2 === 1)}>
        <div>
          {heading && <h2 style={{ color: theme.colors.forest, marginBottom: 14 }}>{heading}</h2>}
          <SectionBody section={section} />
        </div>
        <SectionImage src={section.image} alt={alt} />
      </Split>
    );
  }

  if (type === 'collection') {
    const fallback = data.collectionSlug
      ? `/collections/${data.collectionSlug}`
      : data.categorySlug
        ? `/categories/${data.categorySlug}`
        : '/collections';
    const link = callToAction(section, fallback);
    return (
      <Block>
        <Split $reverse={Boolean(data.reverse)}>
          <div>
            {subheading && (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: theme.colors.gold,
                  marginBottom: 8,
                }}
              >
                {subheading}
              </span>
            )}
            {heading && <h2 style={{ color: theme.colors.forest, marginBottom: 12 }}>{heading}</h2>}
            <SectionBody section={section} />
            <div style={{ marginTop: 18 }}>
              <ButtonLink href={link.href} $variant="primary">
                {link.label} <ArrowRight size={15} />
              </ButtonLink>
            </div>
          </div>
          <SectionImage src={section.image} alt={alt} />
        </Split>
      </Block>
    );
  }

  if (type === 'process') {
    const steps = Array.isArray(data.steps)
      ? data.steps.map((step) => String(step || '').trim()).filter(Boolean)
      : String(section.body || '')
          .split('\n')
          .map((step) => step.replace(/^[-*]\s*/, '').trim())
          .filter(Boolean);
    return (
      <Block>
        {heading && <h2 style={{ color: theme.colors.forest, marginBottom: 8 }}>{heading}</h2>}
        {subheading && <p style={{ color: theme.colors.gold, fontWeight: 600 }}>{subheading}</p>}
        {steps.length > 0 ? (
          <Steps>
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </Steps>
        ) : (
          <SectionBody section={section} />
        )}
        {section.image && (
          <div style={{ marginTop: 20 }}>
            <SectionImage src={section.image} alt={alt} sizes="(max-width: 900px) 100vw, 760px" />
          </div>
        )}
      </Block>
    );
  }

  if (type === 'quote') {
    return (
      <Quote>
        {heading && <div>{heading}</div>}
        {section.body && <div>{section.body}</div>}
        {data.cite && <cite>{data.cite}</cite>}
      </Quote>
    );
  }

  if (type === 'columns') {
    const items = Array.isArray(data.items) ? data.items : [];
    return (
      <div>
        {heading && <h2 style={{ color: theme.colors.forest, marginBottom: 18 }}>{heading}</h2>}
        {items.length > 0 ? (
          <Columns>
            {items.map((item, i) => (
              <Block key={i}>
                {item.heading && <h3 style={{ color: theme.colors.forest, marginBottom: 8 }}>{item.heading}</h3>}
                {item.body && <p style={{ color: theme.colors.muted }}>{item.body}</p>}
              </Block>
            ))}
          </Columns>
        ) : (
          <Block>
            <SectionBody section={section} />
          </Block>
        )}
      </div>
    );
  }

  if (type === 'cta') {
    return (
      <Cta>
        <div>
          {heading && <h2>{heading}</h2>}
          {section.body && <p>{section.body}</p>}
        </div>
        <ButtonLink href={href} $variant="gold">
          {label} <ArrowRight size={15} />
        </ButtonLink>
      </Cta>
    );
  }

  return (
    <Block>
      {section.image && (
        <Media style={{ marginBottom: 22 }}>
          <Image src={section.image} alt={alt} fill sizes="(max-width: 900px) 100vw, 760px" />
        </Media>
      )}
      {heading && <h2 style={{ color: theme.colors.forest, marginBottom: 10 }}>{heading}</h2>}
      <SectionBody section={section} />
    </Block>
  );
}

function isEmpty(section) {
  const data = section.data || {};
  return (
    !section.heading &&
    !section.body &&
    !section.image &&
    !(Array.isArray(data.items) && data.items.length) &&
    !(Array.isArray(data.steps) && data.steps.length)
  );
}

export default function PageSections({ sections }) {
  return visibleSections(sections)
    .filter((section) => !isEmpty(section))
    .map((section, index) => {
      const data = section.data || {};
      return (
        <Shell
          key={section.id || `${section.type}-${index}`}
          $bg={data.background}
          $align={data.align}
          $spacing={data.spacing}
        >
          <SectionContent section={section} index={index} />
        </Shell>
      );
    });
}
