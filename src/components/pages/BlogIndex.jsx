'use client';

import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight, CalendarDays, User } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import { Container, Section } from '@/components/common/ui';
import theme from '@/styles/theme';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadow.card};
  }
  .media {
    position: relative;
    aspect-ratio: 16 / 10;
    background: ${theme.colors.creamDark};
    img {
      object-fit: cover;
      transition: transform 0.6s ease;
    }
    &:hover img {
      transform: scale(1.04);
    }
  }
  .body {
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
  .cat {
    align-self: flex-start;
    padding: 3px 10px;
    border-radius: ${theme.radius.pill};
    background: ${theme.colors.cream};
    color: ${theme.colors.green};
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  h2 {
    font-size: 21px;
    line-height: 1.25;
    color: ${theme.colors.forest};
  }
  p {
    font-size: 13.5px;
    color: ${theme.colors.muted};
    line-height: 1.7;
  }
  .meta {
    margin-top: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    font-size: 12px;
    color: ${theme.colors.muted};
    span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
  }
  .read {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    color: ${theme.colors.forest};
    font-size: 13px;
    font-weight: 700;
  }
`;

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogIndex({ blogs = [] }) {
  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Gifting notes & guides"
        subtitle="Practical guides on corporate gifting, branding techniques, bulk planning and making your team feel valued."
        crumbs={[{ label: 'Journal' }]}
      />
      <Section>
        <Container>
          {blogs.length === 0 ? (
            <p style={{ color: theme.colors.muted, textAlign: 'center' }}>
              New articles are on the way. In the meantime, explore our{' '}
              <Link href="/products" style={{ color: theme.colors.forest, fontWeight: 600 }}>
                corporate gift catalogue
              </Link>.
            </p>
          ) : (
            <Grid>
              {blogs.map((blog) => (
                <Card key={blog.id} href={`/blog/${blog.slug}`}>
                  <div className="media">
                    {blog.image && (
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="body">
                    {blog.category && <span className="cat">{blog.category}</span>}
                    <h2>{blog.title}</h2>
                    {blog.excerpt && <p>{blog.excerpt}</p>}
                    <div className="meta">
                      {blog.author && (
                        <span><User size={13} /> {blog.author}</span>
                      )}
                      <span><CalendarDays size={13} /> {formatDate(blog.publishedAt || blog.createdAt)}</span>
                    </div>
                    <span className="read">Read the guide <ArrowRight size={14} /></span>
                  </div>
                </Card>
              ))}
            </Grid>
          )}
        </Container>
      </Section>
    </>
  );
}
