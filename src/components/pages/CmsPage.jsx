'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import { ButtonLink, Container, Section } from '@/components/common/ui';
import theme from '@/styles/theme';

const Prose = styled.div`
  max-width: 760px;
  color: ${theme.colors.ink};
  font-size: 16.5px;
  line-height: 1.75;
  p {
    margin-bottom: 16px;
  }
  h2 {
    font-size: clamp(26px, 3.4vw, 36px);
    color: ${theme.colors.forest};
    margin: 8px 0 16px;
  }
  h3 {
    font-size: 22px;
    color: ${theme.colors.forest};
    margin: 26px 0 10px;
  }
  ul {
    margin: 0 0 18px 20px;
    list-style: disc;
    li {
      margin-bottom: 8px;
    }
  }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 34px;
`;

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

function SectionBlock({ section, index }) {
  const type = section.type || 'text';
  const hasImage = Boolean(section.image);

  if (type === 'image') {
    return (
      <Split key={section.id || index} $reverse={index % 2 === 1}>
        <div>
          {section.heading && <h2 style={{ color: theme.colors.forest, marginBottom: 14 }}>{section.heading}</h2>}
          <div style={{ color: theme.colors.muted, lineHeight: 1.75 }}>
            <TextBody text={section.body} />
          </div>
        </div>
        {hasImage && (
          <Media>
            <Image src={section.image} alt={section.heading || ''} fill sizes="(max-width: 860px) 100vw, 50vw" />
          </Media>
        )}
      </Split>
    );
  }

  if (type === 'quote') {
    return (
      <Quote key={section.id || index}>
        {section.heading && <div>{section.heading}</div>}
        {section.body && <div>{section.body}</div>}
        {section.data?.cite && <cite>{section.data.cite}</cite>}
      </Quote>
    );
  }

  if (type === 'columns') {
    const items = Array.isArray(section.data?.items) ? section.data.items : [];
    return (
      <div key={section.id || index}>
        {section.heading && <h2 style={{ color: theme.colors.forest, marginBottom: 18 }}>{section.heading}</h2>}
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
            <TextBody text={section.body} />
          </Block>
        )}
      </div>
    );
  }

  if (type === 'cta') {
    return (
      <Cta key={section.id || index}>
        <div>
          {section.heading && <h2>{section.heading}</h2>}
          {section.body && <p>{section.body}</p>}
        </div>
        <ButtonLink href={safeHref(section.data?.href)} $variant="gold">
          {section.data?.label || 'Get a quote'} <ArrowRight size={15} />
        </ButtonLink>
      </Cta>
    );
  }

  return (
    <Block key={section.id || index}>
      {hasImage && (
        <Media style={{ marginBottom: 22 }}>
          <Image src={section.image} alt={section.heading || ''} fill sizes="(max-width: 900px) 100vw, 760px" />
        </Media>
      )}
      {section.heading && <h2>{section.heading}</h2>}
      <div style={{ color: theme.colors.muted }}>
        <TextBody text={section.body} />
      </div>
    </Block>
  );
}

export default function CmsPage({ page }) {
  const sections = Array.isArray(page.sections) ? page.sections : [];

  return (
    <>
      <PageHero
        eyebrow="RootEco"
        title={page.title}
        subtitle={page.seoDescription || undefined}
        crumbs={[{ label: page.title }]}
      />
      <Section>
        <Container>
          <Stack>
            {page.content && (
              <Prose>
                <TextBody text={page.content} />
              </Prose>
            )}
            {sections.map((section, index) => (
              <SectionBlock key={section.id || index} section={section} index={index} />
            ))}
            {!page.content && sections.length === 0 && (
              <Prose>
                <p>The {page.title} page is being prepared. In the meantime,</p>
                <p>
                  <Link href="/products" style={{ color: theme.colors.forest, fontWeight: 600 }}>
                    browse the catalogue
                  </Link>{' '}
                  or{' '}
                  <Link href="/contact" style={{ color: theme.colors.forest, fontWeight: 600 }}>
                    contact the team
                  </Link>
                  .
                </p>
              </Prose>
            )}
          </Stack>
        </Container>
      </Section>
    </>
  );
}
