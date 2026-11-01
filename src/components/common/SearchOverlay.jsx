'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Search, X } from 'lucide-react';
import { searchProducts } from '@/lib/search';
import { formatINR } from '@/lib/utils';
import theme from '@/styles/theme';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(21, 34, 27, 0.45);
  backdrop-filter: blur(4px);
`;

const Panel = styled(motion.div)`
  background: ${theme.colors.white};
  max-height: 82vh;
  overflow-y: auto;
  box-shadow: ${theme.shadow.lift};
`;

const Box = styled.div`
  max-width: 820px;
  margin: 0 auto;
  padding: 26px 24px 40px;
`;

const Field = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid ${theme.colors.forest};
  padding-bottom: 12px;
  svg {
    color: ${theme.colors.forest};
  }
  input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 20px;
    color: ${theme.colors.ink};
    &::placeholder {
      color: ${theme.colors.muted};
    }
  }
`;

const Hint = styled.p`
  margin-top: 14px;
  font-size: 13px;
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  button {
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid ${theme.colors.line};
    font-size: 12.5px;
    color: ${theme.colors.forest};
    transition: all 0.2s ease;
    &:hover {
      background: ${theme.colors.forest};
      color: #fff;
    }
  }
`;

const Results = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 22px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Row = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: ${theme.radius.sm};
  transition: background 0.2s ease;
  &:hover {
    background: ${theme.colors.cream};
  }
  .thumb {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: ${theme.colors.creamDark};
    img {
      object-fit: cover;
    }
  }
  .info {
    min-width: 0;
    strong {
      display: block;
      font-size: 14px;
      color: ${theme.colors.ink};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    span {
      font-size: 12.5px;
      color: ${theme.colors.muted};
    }
  }
  .price {
    margin-left: auto;
    font-size: 13px;
    font-weight: 600;
    color: ${theme.colors.forest};
    white-space: nowrap;
  }
`;

const ViewAll = styled(Link)`
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.forest};
  &:hover {
    gap: 12px;
  }
  transition: gap 0.2s ease;
`;

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => searchProducts(query).slice(0, 8), [query]);

  const submit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Panel
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box>
              <form onSubmit={submit}>
                <Field>
                  <Search size={22} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search gifts, categories, occasions…"
                    aria-label="Search products"
                  />
                  <button type="button" onClick={onClose} aria-label="Close search">
                    <X size={22} />
                  </button>
                </Field>
              </form>
              {!query && (
                <Hint>
                  Popular:
                  {['Diwali hamper', 'Welcome kit', 'Bottle', 'Notebook', 'Hoodie'].map((t) => (
                    <button key={t} type="button" onClick={() => setQuery(t)}>
                      {t}
                    </button>
                  ))}
                </Hint>
              )}

              {query && results.length === 0 && (
                <Hint>
                  No results for “{query}”. Try “hampers”, “tech” or “apparel”.
                </Hint>
              )}

              {results.length > 0 && (
                <>
                  <Results>
                    {results.map((p) => (
                      <Row key={p.slug} href={`/products/${p.slug}`} onClick={onClose}>
                        <span className="thumb">
                          <Image src={p.images[0]} alt={p.name} fill sizes="52px" />
                        </span>
                        <span className="info">
                          <strong>{p.name}</strong>
                          <span>{p.type}</span>
                        </span>
                        <span className="price">{formatINR(p.price)}</span>
                      </Row>
                    ))}
                  </Results>
                  <ViewAll href={`/search?q=${encodeURIComponent(query)}`} onClick={onClose}>
                    View all results <ArrowRight size={15} />
                  </ViewAll>
                </>
              )}
            </Box>
          </Panel>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
