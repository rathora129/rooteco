'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import { Container, Section } from '@/components/common/ui';
import theme from '@/styles/theme';

const Wrap = styled(Container)`
  max-width: 860px;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 13px;
  color: ${theme.colors.muted};
  margin-bottom: 22px;
  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .cat {
    padding: 3px 10px;
    border-radius: ${theme.radius.pill};
    background: ${theme.colors.cream};
    color: ${theme.colors.green};
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 11px;
  }
`;

const HeroImage = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  background: ${theme.colors.creamDark};
  margin-bottom: 32px;
  img {
    object-fit: cover;
  }
`;

const Body = styled.article`
  font-size: 16px;
  line-height: 1.85;
  color: ${theme.colors.ink};
  p {
    margin-bottom: 18px;
  }
  h2 {
    font-size: 28px;
    color: ${theme.colors.forest};
    margin: 34px 0 12px;
  }
  h3 {
    font-size: 21px;
    color: ${theme.colors.forest};
    margin: 28px 0 10px;
  }
  ul,
  ol {
    margin: 0 0 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  a {
    color: ${theme.colors.forest};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  blockquote {
    border-left: 3px solid ${theme.colors.gold};
    padding: 6px 0 6px 18px;
    margin: 22px 0;
    color: ${theme.colors.muted};
    font-style: italic;
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 30px;
  span {
    padding: 5px 12px;
    border-radius: ${theme.radius.pill};
    border: 1px solid ${theme.colors.line};
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 34px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.forest};
  &:hover {
    text-decoration: underline;
  }
`;

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderBlocks(content) {
  const text = String(content || '').trim();
  if (!text) return null;
  return text.split(/\n{2,}/).map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return null;
    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return (
        <ul key={index}>
          {lines.map((line) => (
            <li key={line}>{line.replace(/^[-*]\s+/, '')}</li>
          ))}
        </ul>
      );
    }
    if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      return (
        <ol key={index}>
          {lines.map((line) => (
            <li key={line}>{line.replace(/^\d+[.)]\s+/, '')}</li>
          ))}
        </ol>
      );
    }
    if (lines.length === 1 && lines[0].startsWith('## ')) {
      return <h2 key={index}>{lines[0].slice(3)}</h2>;
    }
    if (lines.length === 1 && lines[0].startsWith('### ')) {
      return <h3 key={index}>{lines[0].slice(4)}</h3>;
    }
    return <p key={index}>{lines.join(' ')}</p>;
  });
}

export default function BlogPost({ blog }) {
  return (
    <>
      <PageHero
        eyebrow={blog.category || 'Journal'}
        title={blog.title}
        subtitle={blog.excerpt || undefined}
        crumbs={[{ label: 'Journal', href: '/blog' }, { label: blog.title }]}
      />
      <Section>
        <Wrap>
          <Meta>
            {blog.author && <span><User size={14} /> {blog.author}</span>}
            <span><CalendarDays size={14} /> {formatDate(blog.publishedAt || blog.createdAt)}</span>
          </Meta>
          {blog.image && (
            <HeroImage>
              <Image src={blog.image} alt={blog.title} fill sizes="(max-width: 900px) 100vw, 860px" priority />
            </HeroImage>
          )}
          <Body>{renderBlocks(blog.content)}</Body>
          {(blog.tags || []).length > 0 && (
            <Tags>
              {blog.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </Tags>
          )}
          <Back href="/blog"><ArrowLeft size={15} /> All articles</Back>
        </Wrap>
      </Section>
    </>
  );
}
