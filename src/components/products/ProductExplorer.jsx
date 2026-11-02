'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styled, { css } from 'styled-components';
import { Gift, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import theme from '@/styles/theme';
import { Button, ButtonLink } from '@/components/common/ui';
import ProductCard from '@/components/common/ProductCard';

const PRICE_RANGES = [
  { id: 'under-1000', label: 'Under ₹1,000', test: (p) => p.price < 1000 },
  { id: '1000-2500', label: '₹1,000 – ₹2,500', test: (p) => p.price >= 1000 && p.price <= 2500 },
  { id: '2500-4000', label: '₹2,500 – ₹4,000', test: (p) => p.price > 2500 && p.price <= 4000 },
  { id: 'over-4000', label: '₹4,000 & above', test: (p) => p.price > 4000 },
];

const TAGS = [
  { id: 'best', label: 'Best sellers', test: (p) => p.bestSeller },
  { id: 'new', label: 'New arrivals', test: (p) => p.isNew },
  { id: 'sale', label: 'On sale', test: (p) => p.mrp > p.price },
  { id: 'premium', label: 'Premium', test: (p) => p.badge === 'Premium' },
];

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'newest', label: 'Newest first' },
  { id: 'best-selling', label: 'Best selling' },
  { id: 'rating', label: 'Top rated' },
];

const Layout = styled.div`
  display: grid;
  grid-template-columns: 256px 1fr;
  gap: 34px;
  align-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FilterOverlay = styled.button`
  display: none;
  @media (max-width: 900px) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 290;
    background: rgba(21, 34, 27, 0.45);
    backdrop-filter: blur(3px);
  }
`;

const Side = styled.aside`
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 120px);
  max-height: calc(100dvh - 120px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: ${theme.colors.line} transparent;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.line};
    border-radius: 999px;
  }
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  padding: 22px 20px;
  @media (max-width: 900px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 300;
    display: flex;
    flex-direction: column;
    max-height: min(84vh, 660px);
    overflow: hidden;
    border-radius: 20px 20px 0 0;
    border: none;
    padding: 0;
    box-shadow: 0 -22px 55px rgba(11, 61, 46, 0.22);
    transform: translateY(105%);
    visibility: hidden;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.3s;
    ${(p) =>
      p.$open &&
      css`
        transform: translateY(0);
        visibility: visible;
      `}
  }
`;

const FilterBody = styled.div`
  @media (max-width: 900px) {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 16px 20px;
  }
`;

const DrawerHead = styled.div`
  display: none;
  @media (max-width: 900px) {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #fff;
    border-bottom: 1px solid ${theme.colors.line};
    border-radius: 20px 20px 0 0;
    strong {
      font-size: 17px;
      color: ${theme.colors.forest};
    }
    button {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: ${theme.colors.ink};
      &:hover {
        background: ${theme.colors.cream};
      }
    }
  }
`;

const DrawerApply = styled.div`
  display: none;
  @media (max-width: 900px) {
    flex-shrink: 0;
    display: block;
    padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
    background: #fff;
    border-top: 1px solid ${theme.colors.line};
    box-shadow: 0 -8px 20px rgba(11, 61, 46, 0.06);
    button {
      width: 100%;
      height: 46px;
      border-radius: ${theme.radius.pill};
      background: ${theme.colors.forest};
      color: #fff;
      font-size: 14.5px;
      font-weight: 600;
      &:hover {
        background: ${theme.colors.green};
      }
    }
  }
`;

const FilterBlock = styled.div`
  & + & {
    margin-top: 22px;
    padding-top: 20px;
    border-top: 1px solid ${theme.colors.line};
  }
  h4 {
    font-family: ${theme.fonts.body};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
    margin-bottom: 12px;
  }
`;

const Field = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.pill};
  padding: 0 14px;
  background: ${theme.colors.white};
  svg {
    color: ${theme.colors.muted};
    flex-shrink: 0;
  }
  input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    padding: 10px 8px;
    font-size: 14px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: ${theme.radius.sm};
  border: 1px solid ${theme.colors.line};
  background: #fff;
  font-size: 14px;
  color: ${theme.colors.ink};
  cursor: pointer;
`;

const Check = styled.label`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 0;
  font-size: 14px;
  color: ${theme.colors.ink};
  cursor: pointer;
  input {
    accent-color: ${theme.colors.green};
    width: 15px;
    height: 15px;
  }
`;

const Clear = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.sale};
  &:hover {
    text-decoration: underline;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 22px;
  .count {
    font-size: 14px;
    color: ${theme.colors.muted};
    strong {
      color: ${theme.colors.ink};
    }
  }
  .right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  @media (max-width: 640px) {
    .right {
      width: 100%;
      margin-left: 0;
      display: grid;
      grid-template-columns: auto auto minmax(0, 1fr);
      gap: 8px;
    }
    .right > * {
      flex: initial;
    }
  }
`;

const SortWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: ${theme.colors.muted};
  ${Select} {
    width: auto;
    min-width: 178px;
  }
  @media (max-width: 640px) {
    min-width: 0;
    ${Select} {
      width: 100%;
      min-width: 0;
      padding: 10px;
      font-size: 13px;
    }
  }
`;

const ViewToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.pill};
  background: #fff;
  flex-shrink: 0;
  button {
    width: 36px;
    height: 32px;
    border-radius: ${theme.radius.pill};
    display: grid;
    place-items: center;
    color: ${theme.colors.muted};
    transition: background 0.2s ease, color 0.2s ease;
    &:hover {
      background: ${theme.colors.cream};
      color: ${theme.colors.forest};
    }
    &.active {
      background: ${theme.colors.forest};
      color: #fff;
    }
  }
  @media (max-width: 640px) {
    padding: 2px;
    button {
      width: 32px;
      height: 32px;
    }
  }
`;

const MobileFilterBtn = styled.button`
  display: none;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: ${theme.radius.pill};
  border: 1px solid ${theme.colors.line};
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.forest};
  @media (max-width: 900px) {
    display: inline-flex;
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  button {
    padding: 8px 16px;
    border-radius: ${theme.radius.pill};
    border: 1px solid ${theme.colors.line};
    background: #fff;
    font-size: 13px;
    font-weight: 500;
    color: ${theme.colors.ink};
    transition: all 0.2s ease;
    &.active {
      background: ${theme.colors.forest};
      border-color: ${theme.colors.forest};
      color: #fff;
    }
    &:hover {
      border-color: ${theme.colors.forest};
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 20px;
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
`;

const ListStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 640px) {
    gap: 12px;
  }
`;

const More = styled.div`
  text-align: center;
  margin-top: 36px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 56px 20px;
  border: 1px dashed ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  background: #fff;
  svg {
    color: ${theme.colors.green};
    margin-bottom: 12px;
  }
  h3 {
    font-size: 24px;
    color: ${theme.colors.forest};
    margin-bottom: 8px;
  }
  p {
    color: ${theme.colors.muted};
    max-width: 420px;
    margin: 0 auto 20px;
  }
`;

const ViewHead = styled.div`
  margin-bottom: 20px;
  h2 {
    font-size: 30px;
    color: ${theme.colors.forest};
    margin-bottom: 4px;
  }
  p {
    font-size: 14px;
    color: ${theme.colors.muted};
  }
`;

export function ExplorerSkeleton() {
  return (
    <Grid aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '3 / 4.4',
            borderRadius: 14,
            border: `1px solid ${theme.colors.line}`,
            background: '#fff',
            opacity: 0.6,
          }}
        />
      ))}
    </Grid>
  );
}

export default function ProductExplorer({
  products,
  categories = [],
  lockedCategory = null,
  lockedSubcategory = null,
  subcategories = null,
  defaultSort = 'featured',
}) {
  const searchParams = useSearchParams();
  const { wishlist } = useStore();
  const view = searchParams.get('view');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(lockedCategory || 'all');
  const [sub, setSub] = useState(lockedSubcategory || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || defaultSort);
  const [prices, setPrices] = useState([]);
  const [tags, setTags] = useState([]);
  const [visible, setVisible] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layout, setLayout] = useState('grid');

  const paramString = searchParams.toString();
  useEffect(() => {
    const s = searchParams.get('sort');
    if (s) setSort(s);
    const q = searchParams.get('q');
    if (q !== null) setQuery(q);
  }, [paramString]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setVisible(12);
  }, [query, category, sub, sort, prices, tags, view]);

  useEffect(() => {
    if (!filtersOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setFiltersOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [filtersOpen]);

  const isWishlist = view === 'wishlist';

  const base = useMemo(() => {
    if (isWishlist) return products.filter((p) => wishlist.includes(p.slug));
    return products;
  }, [products, isWishlist, wishlist]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = base.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (sub !== 'all' && p.subcategory !== sub) return false;
      if (prices.length) {
        const ranges = PRICE_RANGES.filter((r) => prices.includes(r.id));
        if (!ranges.some((r) => r.test(p))) return false;
      }
      if (tags.length) {
        const selected = TAGS.filter((t) => tags.includes(t.id));
        if (!selected.some((t) => t.test(p))) return false;
      }
      if (q) {
        const cat = categories.find((c) => c.slug === p.category);
        const fields = [p.name, p.type, p.description, cat?.name, ...(p.occasions || [])];
        if (!fields.filter(Boolean).some((f) => f.toLowerCase().includes(q))) return false;
      }
      return true;
    });

    list = [...list];
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id);
        break;
      case 'best-selling':
        list.sort(
          (a, b) =>
            Number(b.bestSeller) - Number(a.bestSeller) || b.reviewsCount - a.reviewsCount
        );
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            Number(b.bestSeller) - Number(a.bestSeller) ||
            b.rating - a.rating
        );
    }
    return list;
  }, [base, category, sub, prices, tags, query, sort]);

  const toggle = (setter) => (id) =>
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const activeCount =
    (category !== 'all' && !lockedCategory ? 1 : 0) +
    (sub !== 'all' && !lockedSubcategory ? 1 : 0) +
    prices.length +
    tags.length +
    (query ? 1 : 0);

  const clearAll = () => {
    setQuery('');
    if (!lockedCategory) setCategory('all');
    if (!lockedSubcategory) setSub('all');
    setPrices([]);
    setTags([]);
    setSort(defaultSort);
  };

  const shown = filtered.slice(0, visible);

  return (
    <>
      {filtersOpen && (
        <FilterOverlay
          type="button"
          aria-label="Close filters"
          onClick={() => setFiltersOpen(false)}
        />
      )}
      <Layout>
        <Side
          id="product-filters"
          $open={filtersOpen}
          aria-label="Product filters"
        >
          <DrawerHead>
            <strong>Filters</strong>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
            >
              <X size={19} />
            </button>
          </DrawerHead>
          <FilterBody>
        <FilterBlock>
          <h4>Search</h4>
          <Field>
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gifts…"
              aria-label="Search products"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </Field>
        </FilterBlock>

        {!lockedCategory && (
          <FilterBlock>
            <h4>Category</h4>
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSub('all');
              }}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FilterBlock>
        )}

        <FilterBlock>
          <h4>Price</h4>
          {PRICE_RANGES.map((r) => (
            <Check key={r.id}>
              <input
                type="checkbox"
                checked={prices.includes(r.id)}
                onChange={() => toggle(setPrices)(r.id)}
              />
              {r.label}
            </Check>
          ))}
        </FilterBlock>

        <FilterBlock>
          <h4>Highlights</h4>
          {TAGS.map((t) => (
            <Check key={t.id}>
              <input
                type="checkbox"
                checked={tags.includes(t.id)}
                onChange={() => toggle(setTags)(t.id)}
              />
              {t.label}
            </Check>
          ))}
        </FilterBlock>

        {activeCount > 0 && (
          <FilterBlock>
            <Clear onClick={clearAll} type="button">
              <X size={14} /> Clear all filters
            </Clear>
          </FilterBlock>
        )}
          </FilterBody>
          <DrawerApply>
            <button type="button" onClick={() => setFiltersOpen(false)}>
              Show {filtered.length} {filtered.length === 1 ? 'gift' : 'gifts'}
            </button>
          </DrawerApply>
        </Side>

        <div>
        {isWishlist && (
          <ViewHead>
            <h2>Your Wishlist</h2>
            <p>Saved on this device. Add gifts to your cart when you&apos;re ready.</p>
          </ViewHead>
        )}

        <Toolbar>
          <span className="count">
            <strong>{filtered.length}</strong> {filtered.length === 1 ? 'gift' : 'gifts'}
            {query ? ` for “${query}”` : ''}
          </span>
          <div className="right">
            <MobileFilterBtn
              onClick={() => setFiltersOpen((o) => !o)}
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="product-filters"
            >
              <SlidersHorizontal size={16} /> Filters
              {activeCount > 0 ? ` (${activeCount})` : ''}
            </MobileFilterBtn>
            <ViewToggle role="group" aria-label="Product view">
              <button
                type="button"
                className={layout === 'grid' ? 'active' : ''}
                onClick={() => setLayout('grid')}
                aria-pressed={layout === 'grid'}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={layout === 'list' ? 'active' : ''}
                onClick={() => setLayout('list')}
                aria-pressed={layout === 'list'}
                aria-label="List view"
                title="List view"
              >
                <List size={17} />
              </button>
            </ViewToggle>
            <SortWrap>
              <span style={{ display: 'none' }}>Sort</span>
              <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    Sort: {s.label}
                  </option>
                ))}
              </Select>
            </SortWrap>
          </div>
        </Toolbar>

        {subcategories && subcategories.length > 0 && (
          <Chips>
            <button
              type="button"
              className={sub === 'all' ? 'active' : ''}
              onClick={() => setSub('all')}
            >
              All
            </button>
            {subcategories.map((s) => (
              <button
                key={s.slug}
                type="button"
                className={sub === s.slug ? 'active' : ''}
                onClick={() => setSub(s.slug)}
              >
                {s.name}
              </button>
            ))}
          </Chips>
        )}

        {shown.length === 0 ? (
          <Empty>
            <Gift size={38} />
            <h3>{isWishlist ? 'Your wishlist is empty' : 'No gifts match those filters'}</h3>
            <p>
              {isWishlist
                ? 'Tap the heart on any product to save it here for later.'
                : 'Try removing a filter or searching with a broader term.'}
            </p>
            {isWishlist ? (
              <ButtonLink href="/products">Explore the catalogue</ButtonLink>
            ) : (
              <Clear onClick={clearAll} type="button" style={{ margin: '0 auto' }}>
                Clear filters
              </Clear>
            )}
          </Empty>
        ) : (
          <>
            {layout === 'grid' ? (
              <Grid>
                {shown.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </Grid>
            ) : (
              <ListStack>
                {shown.map((p) => (
                  <ProductCard key={p.slug} product={p} layout="list" />
                ))}
              </ListStack>
            )}
            {visible < filtered.length && (
              <More>
                <Button onClick={() => setVisible((v) => v + 12)} $variant="outline">
                  Load more gifts
                </Button>
              </More>
            )}
          </>
        )}
        </div>
      </Layout>
    </>
  );
}
