'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { FileText, Mail, ShieldAlert } from 'lucide-react';
import { brand } from '@/data/navigation';
import theme from '@/styles/theme';
import { Container, Section } from '@/components/common/ui';
import PageHero from '@/components/common/PageHero';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 290px;
  gap: 48px;
  align-items: start;
  max-width: 1080px;
  margin: 0 auto;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const Content = styled.article`
  max-width: 72ch;
  .meta {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: ${theme.colors.muted};
    background: ${theme.colors.cream};
    border: 1px solid ${theme.colors.line};
    padding: 6px 12px;
    border-radius: ${theme.radius.pill};
    margin-bottom: 20px;
  }
  .intro {
    font-size: 16px;
    color: ${theme.colors.ink};
    line-height: 1.7;
    margin-bottom: 10px;
  }
  section {
    padding-top: 30px;
    margin-top: 26px;
    border-top: 1px solid ${theme.colors.line};
    &:first-of-type {
      border-top: none;
      margin-top: 20px;
      padding-top: 0;
    }
    h2 {
      font-size: 24px;
      color: ${theme.colors.forest};
      margin-bottom: 12px;
      scroll-margin-top: 100px;
    }
    p {
      font-size: 14.5px;
      color: ${theme.colors.muted};
      line-height: 1.75;
      margin-bottom: 12px;
    }
    ul {
      margin: 0 0 12px 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      li {
        position: relative;
        padding-left: 18px;
        font-size: 14.5px;
        color: ${theme.colors.muted};
        line-height: 1.7;
        &::before {
          content: '';
          position: absolute;
          left: 2px;
          top: 11px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: ${theme.colors.gold};
        }
      }
    }
    a {
      color: ${theme.colors.forest};
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
`;

const DemoBox = styled.div`
  margin-top: 34px;
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 16px 18px;
  border-radius: ${theme.radius.md};
  background: rgba(201, 162, 39, 0.11);
  border: 1px solid rgba(201, 162, 39, 0.3);
  font-size: 12.5px;
  line-height: 1.65;
  color: ${theme.colors.ink};
  svg {
    color: ${theme.colors.gold};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const Aside = styled.aside`
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 900px) {
    position: static;
  }
`;

const Box = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  padding: 22px;
  h3 {
    font-family: ${theme.fonts.body};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
    margin-bottom: 12px;
  }
`;

const Toc = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  a {
    font-size: 13px;
    color: ${theme.colors.ink};
    line-height: 1.45;
    &:hover {
      color: ${theme.colors.green};
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
`;

const Contact = styled.div`
  p {
    font-size: 13px;
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin-bottom: 10px;
  }
  a {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 13.5px;
    font-weight: 600;
    color: ${theme.colors.forest};
    svg {
      color: ${theme.colors.green};
    }
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Related = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  a {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: ${theme.colors.ink};
    &:hover {
      color: ${theme.colors.green};
      text-decoration: underline;
    }
    svg {
      color: ${theme.colors.green};
      flex-shrink: 0;
    }
  }
`;

export default function LegalPage({ title, subtitle, updated, intro, sections, related = [] }) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        subtitle={subtitle}
        crumbs={[{ label: title }]}
      />

      <Section>
        <Container>
          <Layout>
            <Content>
              <span className="meta">
                <FileText size={13} /> Last updated: {updated}
              </span>
              <p className="intro">{intro}</p>

              {sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2>{section.heading}</h2>
                  {section.body?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.list && (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <DemoBox>
                <ShieldAlert size={17} />
                <span>
                  This policy is sample copy for a demonstration storefront and does not constitute
                  legal advice. RootEco here is a demo brand; no real company, registration or
                  commercial terms are represented.
                </span>
              </DemoBox>
            </Content>

            <Aside>
              <Box>
                <h3>On this page</h3>
                <Toc>
                  {sections.map((section) => (
                    <a key={section.id} href={`#${section.id}`}>
                      {section.heading}
                    </a>
                  ))}
                </Toc>
              </Box>

              <Box>
                <h3>Questions?</h3>
                <Contact>
                  <p>Questions about this policy or your data?</p>
                  <a href={`mailto:${brand.email}`}>
                    <Mail size={15} /> {brand.email}
                  </a>
                </Contact>
              </Box>

              {related.length > 0 && (
                <Box>
                  <h3>Related policies</h3>
                  <Related>
                    {related.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <FileText size={13} /> {item.label}
                      </Link>
                    ))}
                  </Related>
                </Box>
              )}
            </Aside>
          </Layout>
        </Container>
      </Section>
    </>
  );
}
