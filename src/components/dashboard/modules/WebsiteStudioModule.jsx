'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowUpRight,
  BookOpen,
  Globe2,
  Image as ImageIcon,
  Images,
  LayoutTemplate,
  Megaphone,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBag,
  Tags,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  ErrorBlock,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  Table,
  TableScroll,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, getDashboardStats } from '@/components/dashboard/hooks';

const KPI_GRID = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

const KPI = styled.div`
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: 11px;
  padding: 14px 15px;
  .label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10.5px;
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dash-faint);
  }
  .value {
    margin-top: 7px;
    font-size: 26px;
    font-weight: 650;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .hint {
    font-size: 11px;
    color: var(--dash-muted);
    margin-top: 2px;
  }
  svg {
    width: 13px;
    height: 13px;
    color: var(--dash-accent);
  }
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 14px;
  margin-bottom: 14px;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const HealthRow = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 54px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  font-size: 12px;
  .label {
    color: var(--dash-muted);
  }
  .bar {
    height: 5px;
    border-radius: 999px;
    background: var(--dash-panel-3);
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--dash-accent);
    opacity: 0.8;
  }
  .count {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--dash-ink);
    font-weight: 600;
  }
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 9px;
    border-radius: 7px;
    font-size: 12.5px;
    color: var(--dash-ink);
    transition: background 0.14s ease;
  }
  a:hover {
    background: var(--dash-panel-2);
  }
  .path {
    font-size: 11px;
    color: var(--dash-faint);
    font-family: var(--font-mono, ui-monospace, monospace);
  }
  svg {
    width: 13px;
    height: 13px;
    color: var(--dash-faint);
    flex-shrink: 0;
  }
`;

const ThumbStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
  img,
  span {
    display: block;
    aspect-ratio: 1 / 1;
    width: 100%;
    object-fit: cover;
    border-radius: 7px;
    border: 1px solid var(--dash-line);
    background: var(--dash-panel-2);
  }
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  a,
  button {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 12px;
    border-radius: 9px;
    border: 1px solid var(--dash-line);
    background: var(--dash-panel-2);
    color: var(--dash-ink);
    font-size: 12.5px;
    font-weight: 550;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  a:hover {
    border-color: rgba(233, 166, 78, 0.4);
    background: var(--dash-panel-3);
  }
  svg {
    width: 15px;
    height: 15px;
    color: var(--dash-accent);
    flex-shrink: 0;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  h2 {
    font-size: 13.5px;
    font-weight: 650;
    color: var(--dash-ink);
  }
  a {
    font-size: 11.5px;
    color: var(--dash-accent);
    font-weight: 600;
  }
`;

const PUBLIC_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Categories', path: '/categories' },
  { label: 'Collections', path: '/collections' },
  { label: 'Journal', path: '/blog' },
  { label: 'Contact', path: '/contact' },
  { label: 'Request a quote', path: '/get-a-quote' },
  { label: 'Track order', path: '/track-order' },
];

export default function WebsiteStudioModule() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [stats, pages, banners, media] = await Promise.all([
        getDashboardStats(),
        apiRequest('/api/content/pages?pageSize=6'),
        apiRequest('/api/banners?pageSize=6'),
        apiRequest('/api/media?pageSize=8'),
      ]);
      setData({
        stats,
        pages: pages.data || [],
        banners: banners.data || [],
        media: media.data || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = data?.stats?.data?.counts || {};
  const publishedPages = counts.publishedPages || 0;
  const totalPages = counts.pages || 0;
  const publishedProducts = counts.publishedProducts || 0;
  const totalProducts = counts.products || 0;
  const activeBanners = counts.activeBanners || 0;
  const publishedBlogs = counts.publishedBlogs || 0;

  const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0);

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Website studio</span>
          <h1>Your website</h1>
          <p>
            Build pages, arrange sections, publish banners and manage the media behind the public
            storefront. Published changes go live immediately.
          </p>
        </div>
        <div className="actions">
          <Button as="a" href="/" target="_blank" rel="noreferrer" $variant="outline">
            <Globe2 size={14} /> View storefront
          </Button>
          <Button as={Link} href="/dashboard/website/settings" $variant="outline">
            <Settings2 size={14} /> Website settings
          </Button>
        </div>
      </PageHeader>

      {error && <ErrorBlock message={error} onRetry={load} />}
      {loading && !data ? (
        <Card>
          <SkeletonRows rows={7} />
        </Card>
      ) : (
        <>
          <KPI_GRID>
            <KPI>
              <div className="label">
                <LayoutTemplate /> Published pages
              </div>
              <div className="value">{publishedPages}</div>
              <div className="hint">{totalPages} pages in total</div>
            </KPI>
            <KPI>
              <div className="label">
                <ImageIcon /> Live banners
              </div>
              <div className="value">{activeBanners}</div>
              <div className="hint">Active homepage sliders</div>
            </KPI>
            <KPI>
              <div className="label">
                <Images /> Media assets
              </div>
              <div className="value">{counts.media ?? 0}</div>
              <div className="hint">Images in the library</div>
            </KPI>
            <KPI>
              <div className="label">
                <BookOpen /> Journal posts
              </div>
              <div className="value">{publishedBlogs}</div>
              <div className="hint">Published articles</div>
            </KPI>
          </KPI_GRID>

          <Columns>
            <Card>
              <SectionTitle>
                <h2>Publishing health</h2>
                <Badge $tone="green">Live</Badge>
              </SectionTitle>
              <HealthRow>
                <span className="label">Pages</span>
                <span className="bar">
                  <span style={{ width: `${percent(publishedPages, totalPages)}%` }} />
                </span>
                <span className="count">
                  {publishedPages}/{totalPages}
                </span>
              </HealthRow>
              <HealthRow>
                <span className="label">Products</span>
                <span className="bar">
                  <span style={{ width: `${percent(publishedProducts, totalProducts)}%` }} />
                </span>
                <span className="count">
                  {publishedProducts}/{totalProducts}
                </span>
              </HealthRow>
              <HealthRow>
                <span className="label">Banners</span>
                <span className="bar">
                  <span style={{ width: `${activeBanners ? 100 : 0}%` }} />
                </span>
                <span className="count">{activeBanners}</span>
              </HealthRow>
              <HealthRow>
                <span className="label">Journal</span>
                <span className="bar">
                  <span style={{ width: `${publishedBlogs ? 100 : 0}%` }} />
                </span>
                <span className="count">{publishedBlogs}</span>
              </HealthRow>
              <p style={{ marginTop: 10, fontSize: 11.5, color: 'var(--dash-muted)', lineHeight: 1.65 }}>
                Draft pages and unpublished products stay hidden from visitors. Preview a page
                before publishing it from the page builder.
              </p>
            </Card>

            <Card>
              <SectionTitle>
                <h2>Public site map</h2>
                <Globe2 size={14} style={{ color: 'var(--dash-faint)' }} />
              </SectionTitle>
              <LinkList>
                {PUBLIC_LINKS.map((link) => (
                  <a key={link.path} href={link.path} target="_blank" rel="noreferrer">
                    <span>
                      {link.label} <span className="path">{link.path}</span>
                    </span>
                    <ArrowUpRight />
                  </a>
                ))}
              </LinkList>
            </Card>
          </Columns>

          <Card style={{ marginBottom: 14 }}>
            <SectionTitle>
              <h2>Recently updated pages</h2>
              <Link href="/dashboard/pages">Manage all pages →</Link>
            </SectionTitle>
            {!data?.pages?.length ? (
              <p style={{ fontSize: 12.5, color: 'var(--dash-muted)' }}>
                No pages yet — create your first page to start building the site.
              </p>
            ) : (
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Sections</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pages.map((page) => (
                      <tr key={page.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{page.title}</div>
                          <div className="muted">/pages/{page.slug}</div>
                        </td>
                        <td className="mono">{page.sections?.length || 0}</td>
                        <td>
                          <StatusBadge value={page.status} />
                        </td>
                        <td className="muted">{formatDate(page.updatedAt)}</td>
                        <td>
                          <div className="actions">
                            <Button as="a" href={`/preview/${page.slug}`} target="_blank" rel="noreferrer" $variant="ghost" style={{ padding: '5px 9px', fontSize: 12 }}>
                              Preview
                            </Button>
                            <Button as={Link} href={`/dashboard/pages/${page.id}`} $variant="outline" style={{ padding: '5px 11px', fontSize: 12 }}>
                              Build
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            )}
          </Card>

          <Columns>
            <Card>
              <SectionTitle>
                <h2>Banners &amp; sliders</h2>
                <Link href="/dashboard/banners">Manage →</Link>
              </SectionTitle>
              {!data?.banners?.length ? (
                <p style={{ fontSize: 12.5, color: 'var(--dash-muted)' }}>No banners yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.banners.slice(0, 4).map((banner) => (
                    <div key={banner.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 64,
                          height: 36,
                          borderRadius: 6,
                          border: '1px solid var(--dash-line)',
                          background: banner.desktopImage ? `url(${banner.desktopImage}) center / cover` : 'var(--dash-panel-2)',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {banner.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--dash-muted)' }}>
                          Order {banner.order ?? 0}
                        </div>
                      </div>
                      <Badge $tone={banner.active ? 'green' : 'neutral'}>{banner.active ? 'live' : 'off'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <SectionTitle>
                <h2>Media library</h2>
                <Link href="/dashboard/media">Open library →</Link>
              </SectionTitle>
              {!data?.media?.length ? (
                <p style={{ fontSize: 12.5, color: 'var(--dash-muted)' }}>Upload images to use across the site.</p>
              ) : (
                <ThumbStrip>
                  {data.media.slice(0, 8).map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer" title={item.filename || item.alt || ''}>
                      <img src={item.url} alt={item.alt || ''} loading="lazy" />
                    </a>
                  ))}
                </ThumbStrip>
              )}
            </Card>
          </Columns>

          <Card>
            <SectionTitle>
              <h2>Quick actions</h2>
              <Button type="button" $variant="ghost" onClick={load} style={{ padding: '4px 8px', fontSize: 11.5 }}>
                <RefreshCw size={13} /> Refresh
              </Button>
            </SectionTitle>
            <ActionsGrid>
              <Link href="/dashboard/pages">
                <Plus /> New page
              </Link>
              <Link href="/dashboard/banners">
                <Megaphone /> Banners
              </Link>
              <Link href="/dashboard/media">
                <Images /> Media library
              </Link>
              <Link href="/dashboard/website/settings">
                <Settings2 /> Website settings
              </Link>
              <Link href="/dashboard/seo">
                <Search /> SEO &amp; search
              </Link>
              <Link href="/dashboard/blogs">
                <BookOpen /> Journal
              </Link>
              <Link href="/dashboard/products">
                <ShoppingBag /> Catalogue
              </Link>
              <Link href="/dashboard/categories">
                <Tags /> Categories
              </Link>
              <Link href="/dashboard/enquiries">
                <MessageCircle /> Enquiries
              </Link>
            </ActionsGrid>
          </Card>
        </>
      )}
    </>
  );
}
