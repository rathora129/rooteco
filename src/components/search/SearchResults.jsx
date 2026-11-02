'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { ArrowRight, Search, Sparkles, X } from 'lucide-react';
import theme from '@/styles/theme';
import { Button, Container, Section } from '@/components/common/ui';
import ProductCard from '@/components/common/ProductCard';

const popularSearches = ['Diwali hamper', 'Welcome kit', 'Bottle', 'Notebook', 'Hoodie'];

const Bar = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 760px;
  margin: 0 auto 18px;
  background: #fff;
  border: 1.5px solid ${theme.colors.forest};
  border-radius: ${theme.radius.pill};
  padding: 6px 6px 6px 20px;
  svg {
    color: ${theme.colors.muted};
    flex-shrink: 0;
  }
  input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    padding: 10px 0;
  }
  @media (max-width: 560px) {
    padding-left: 14px;
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 36px;
  a,
  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: ${theme.radius.pill};
    border: 1px solid ${theme.colors.line};
    background: #fff;
    font-size: 13px;
    color: ${theme.colors.ink};
    transition: all 0.2s ease;
    &:hover {
      border-color: ${theme.colors.forest};
      color: ${theme.colors.forest};
    }
  }
`;

const ResultsHead = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  h2 {
    font-size: clamp(24px, 3vw, 32px);
    color: ${theme.colors.forest};
    margin-bottom: 4px;
  }
  p {
    font-size: 14px;
    color: ${theme.colors.muted};
  }
  .clear {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13.5px;
    font-weight: 600;
    color: ${theme.colors.forest};
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  @media (max-width: 1180px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 54px 24px;
  border: 1px dashed ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  background: #fff;
  svg:first-child {
    color: ${theme.colors.gold};
    margin-bottom: 10px;
  }
  h2 {
    font-size: 26px;
    color: ${theme.colors.forest};
    margin-bottom: 8px;
  }
  p {
    color: ${theme.colors.muted};
    max-width: 460px;
    margin: 0 auto 18px;
  }
  .popular {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .popular a {
    padding: 7px 14px;
    border-radius: ${theme.radius.pill};
    background: ${theme.colors.cream};
    font-size: 13px;
    color: ${theme.colors.forest};
    &:hover {
      background: ${theme.colors.forest};
      color: #fff;
    }
  }
`;

const Discover = styled.div`
  margin-top: 10px;
  h2 {
    font-size: 26px;
    color: ${theme.colors.forest};
    margin-bottom: 16px;
  }
`;

const CatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 42px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 520px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CatPill = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 16px;
  border-radius: ${theme.radius.md};
  background: #fff;
  border: 1px solid ${theme.colors.line};
  font-size: 13.5px;
  font-weight: 600;
  color: ${theme.colors.ink};
  transition: all 0.2s ease;
  svg {
    color: ${theme.colors.green};
    flex-shrink: 0;
  }
  &:hover {
    border-color: ${theme.colors.forest};
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.soft};
  }
`;

export default function SearchResults({ products = [], categories = [] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = searchParams.get('q') || '';
  const [query, setQuery] = useState(initial);

  const paramString = searchParams.toString();
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [paramString]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = (searchParams.get('q') || '').trim();
  const results = useMemo(() => {
    const needle = q.toLowerCase();
    if (!needle) return [];
    return products.filter((product) => {
      const category = categories.find((c) => c.slug === product.category);
      return [product.name, product.type, product.description, category?.name, ...(product.occasions || [])]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [q, products, categories]);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);

  const submit = (e) => {
    e.preventDefault();
    const next = query.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : '/search');
  };

  return (
    <Section>
      <Container>
        <Bar onSubmit={submit} role="search">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, category or occasion…"
            aria-label="Search products"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={17} />
            </button>
          )}
          <Button type="submit">Search</Button>
        </Bar>

        {!q && (
          <>
            <Chips>
              {popularSearches.map((term) => (
                <Link key={term} href={`/search?q=${encodeURIComponent(term)}`}>
                  {term}
                </Link>
              ))}
            </Chips>

            <Discover>
              <h2>Browse categories</h2>
              <CatGrid>
                {categories.slice(0, 10).map((c) => (
                  <CatPill key={c.slug} href={`/categories/${c.slug}`}>
                    {c.name} <ArrowRight size={14} />
                  </CatPill>
                ))}
              </CatGrid>

              <h2>Popular right now</h2>
              <Grid>
                {bestSellers.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </Grid>
            </Discover>
          </>
        )}

        {q && results.length > 0 && (
          <>
            <ResultsHead>
              <div>
                <h2>
                  {results.length} {results.length === 1 ? 'result' : 'results'} for “{q}”
                </h2>
                <p>Every result supports custom branding and bulk pricing.</p>
              </div>
              <Link className="clear" href="/search">
                <X size={14} /> Clear search
              </Link>
            </ResultsHead>
            <Grid>
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </Grid>
          </>
        )}

        {q && results.length === 0 && (
          <>
            <Empty>
              <Sparkles size={36} />
              <h2>No gifts found for “{q}”</h2>
              <p>
                Try a broader search — like a category (“drinkware”), an occasion (“Diwali”) or a
                product type (“hamper”).
              </p>
              <div className="popular">
                {popularSearches.slice(0, 5).map((term) => (
                  <Link key={term} href={`/search?q=${encodeURIComponent(term)}`}>
                    {term}
                  </Link>
                ))}
              </div>
            </Empty>
            <Discover style={{ marginTop: 40 }}>
              <h2>Explore categories instead</h2>
              <CatGrid>
                {categories.slice(0, 10).map((c) => (
                  <CatPill key={c.slug} href={`/categories/${c.slug}`}>
                    {c.name} <ArrowRight size={14} />
                  </CatPill>
                ))}
              </CatGrid>
            </Discover>
          </>
        )}
      </Container>
    </Section>
  );
}
