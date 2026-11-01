'use client';

import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import categories from '@/data/categories';
import products from '@/data/products';
import theme from '@/styles/theme';

const Panel = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  background: #fff;
  border-top: 1px solid ${theme.colors.line};
  box-shadow: ${theme.shadow.lift};
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
  z-index: 50;
`;

const Wrap = styled.div`
  max-width: ${theme.container};
  margin: 0 auto;
  padding: 34px 24px 30px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 300px;
  gap: 36px;
`;

const Col = styled.div`
  h4 {
    font-family: ${theme.fonts.body};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
    margin-bottom: 10px;
  }
  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  a {
    font-size: 14.5px;
    color: ${theme.colors.ink};
    transition: color 0.2s ease, padding-left 0.2s ease;
    &:hover {
      color: ${theme.colors.green};
      padding-left: 4px;
    }
    &.cat-link {
      font-weight: 600;
      color: ${theme.colors.forest};
    }
  }
`;

const Featured = styled(Link)`
  position: relative;
  display: block;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  aspect-ratio: 4 / 3.4;
  img {
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  .cap {
    position: absolute;
    inset: auto 0 0 0;
    padding: 36px 16px 14px;
    background: linear-gradient(transparent, rgba(11, 61, 46, 0.88));
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    span {
      display: block;
      font-size: 11.5px;
      font-weight: 400;
      opacity: 0.85;
    }
  }
  &:hover img {
    transform: scale(1.05);
  }
`;

export default function MegaMenu() {
  const featured = products.filter((p) => p.featured)[0];
  return (
    <Panel className="mega-panel">
      <Wrap>
        {[categories.slice(0, 4), categories.slice(4, 7), categories.slice(7, 10)].map(
          (group, gi) => (
            <Col key={gi}>
              {group.map((cat) => (
                <div key={cat.slug} style={{ marginBottom: 18 }}>
                  <h4>{cat.name}</h4>
                  <ul>
                    {cat.subcategories.slice(0, 2).map((sub) => (
                      <li key={sub.slug}>
                        <Link href={`/categories/${cat.slug}/${sub.slug}`}>{sub.name}</Link>
                      </li>
                    ))}
                    <li>
                      <Link className="cat-link" href={`/categories/${cat.slug}`}>
                        Explore All →
                      </Link>
                    </li>
                  </ul>
                </div>
              ))}
            </Col>
          )
        )}
        <Col>
          <h4>Featured</h4>
          {featured && (
            <Featured href={`/products/${featured.slug}`}>
              <Image src={featured.images[0]} alt={featured.name} fill sizes="300px" />
              <div className="cap">
                {featured.name}
                <span>View product →</span>
              </div>
            </Featured>
          )}
        </Col>
      </Wrap>
    </Panel>
  );
}
