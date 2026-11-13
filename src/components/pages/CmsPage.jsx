'use client';

import Link from 'next/link';
import styled from 'styled-components';
import PageHero from '@/components/common/PageHero';
import { Container, Section } from '@/components/common/ui';
import PageSections from '@/components/pages/PageSections';
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

export default function CmsPage({ page, preview = false }) {
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
            <PageSections sections={sections} />
            {!preview && !page.content && sections.length === 0 && (
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
