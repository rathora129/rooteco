'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowRight,
  BarChart3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Megaphone,
  MessageSquareQuote,
  Newspaper,
  RefreshCw,
  Search,
  TicketPercent,
  Users,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
} from '@/components/dashboard/ui';
import { apiRequest, formatDateTime } from '@/components/dashboard/hooks';

const EVENT_LABELS = {
  product_view: 'Product views',
  add_to_cart: 'Add to cart',
  checkout_started: 'Checkouts started',
  purchase: 'Purchases',
  quote_request: 'Quote requests',
  whatsapp_click: 'WhatsApp clicks',
  contact_submit: 'Contact submissions',
};

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: 11px;
  padding: 13px 15px;
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
    margin-top: 6px;
    font-size: 24px;
    font-weight: 650;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .hint { font-size: 11px; color: var(--dash-muted); margin-top: 2px; }
  svg { width: 13px; height: 13px; color: var(--dash-accent); }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const ToolLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 2px;
  border-bottom: 1px solid var(--dash-line-soft);
  color: var(--dash-muted);
  font-size: 12.5px;
  &:last-child { border-bottom: 0; }
  .ic {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: var(--dash-panel-2);
    border: 1px solid var(--dash-line);
    color: var(--dash-accent);
    flex-shrink: 0;
    svg { width: 14px; height: 14px; }
  }
  .grow { flex: 1; min-width: 0; }
  strong { display: block; color: var(--dash-ink); font-weight: 600; font-size: 12.5px; }
  span { display: block; font-size: 10.5px; color: var(--dash-faint); margin-top: 1px; }
  &:hover strong { color: var(--dash-accent); }
`;

const TOOLS = [
  {
    href: '/dashboard/seo',
    icon: Search,
    title: 'SEO & search',
    text: 'Default metadata, canonical URL, sitemap and tracking IDs',
  },
  {
    href: '/dashboard/coupons',
    icon: TicketPercent,
    title: 'Coupons & promotions',
    text: 'Percent and fixed-value codes validated at checkout',
  },
  {
    href: '/dashboard/blogs',
    icon: Newspaper,
    title: 'Journal',
    text: 'Publish articles with SEO metadata and cover images',
  },
  {
    href: '/dashboard/testimonials',
    icon: MessageSquareQuote,
    title: 'Testimonials',
    text: 'Customer reviews shown on the storefront',
  },
  {
    href: '/dashboard/faqs',
    icon: FileText,
    title: 'FAQs',
    text: 'Answers used on product and help content',
  },
  {
    href: '/dashboard/banners',
    icon: ImageIcon,
    title: 'Banners',
    text: 'Promotional artwork and storefront placement',
  },
  {
    href: '/dashboard/analytics',
    icon: BarChart3,
    title: 'Analytics',
    text: 'First-party storefront events and funnels',
  },
];

export default function MarketingModule() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiRequest('/api/marketing')
      .then((payload) => {
        if (active) setStats(payload.data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const daily = stats?.events?.daily || [];
  const maxDaily = Math.max(1, ...daily.map((point) => point.count));
  const byType = useMemo(
    () => [...(stats?.events?.byType || [])].sort((a, b) => b.count - a.count).slice(0, 5),
    [stats]
  );

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Marketing</span>
          <h1>Marketing overview</h1>
          <p>
            Storefront events, search defaults, promotions and content in one place. Every number
            below comes from first-party data recorded by the public website.
          </p>
        </div>
        <div className="actions">
          <Button as="a" href="/sitemap.xml" target="_blank" rel="noreferrer" $variant="outline">
            Sitemap <ExternalLink size={12} />
          </Button>
          <Button type="button" $variant="outline" onClick={() => setRefreshKey((key) => key + 1)}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </PageHeader>

      {error && <ErrorBlock message={error} onRetry={() => setRefreshKey((key) => key + 1)} />}
      {loading && <Card><LoadingBlock label="Loading marketing data…" /></Card>}

      {stats && (
        <>
          <StatsGrid>
            <StatCard>
              <div className="label"><BarChart3 /> Events · 30 days</div>
              <div className="value">{stats.events?.total30d ?? 0}</div>
              <div className="hint">Recorded on the storefront</div>
            </StatCard>
            <StatCard>
              <div className="label"><TicketPercent /> Coupons</div>
              <div className="value">{stats.counts?.coupons ?? 0}</div>
              <div className="hint">Codes created</div>
            </StatCard>
            <StatCard>
              <div className="label"><Megaphone /> Active banners</div>
              <div className="value">{stats.counts?.activeBanners ?? 0}</div>
              <div className="hint">Currently live</div>
            </StatCard>
            <StatCard>
              <div className="label"><Newspaper /> Published posts</div>
              <div className="value">{stats.counts?.publishedBlogs ?? 0}</div>
              <div className="hint">Journal articles online</div>
            </StatCard>
          </StatsGrid>

          <Grid>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <h2 style={{ fontSize: 15 }}>Last 14 days</h2>
                <Badge $tone="cream" style={{ marginLeft: 'auto' }}>storefront events</Badge>
              </div>
              {daily.length === 0 ? (
                <EmptyState title="No events yet" text="Events appear as visitors browse the storefront." />
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 140 }}>
                    {daily.map((point) => (
                      <div key={point.date} style={{ flex: 1, textAlign: 'center' }} title={`${point.date}: ${point.count}`}>
                        <div
                          style={{
                            height: `${Math.max(4, (point.count / maxDaily) * 112)}px`,
                            background: point.count ? 'var(--dash-accent)' : 'var(--dash-panel-3)',
                            borderRadius: 4,
                            opacity: point.count ? 0.85 : 1,
                          }}
                        />
                        <div style={{ fontSize: 9, color: 'var(--dash-faint)', marginTop: 5 }}>
                          {new Date(point.date).getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--dash-muted)' }}>
                    Peak day:{' '}
                    <strong style={{ color: 'var(--dash-ink)' }}>
                      {Math.max(...daily.map((point) => point.count))} events
                    </strong>
                  </div>
                </>
              )}
            </Card>

            <Card>
              <h2 style={{ fontSize: 15, marginBottom: 10 }}>Top events</h2>
              {byType.length === 0 ? (
                <EmptyState title="Nothing tracked" text="Browse the storefront to generate events." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {byType.map((row) => {
                    const max = byType[0]?.count || 1;
                    return (
                      <div key={row.type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span>{EVENT_LABELS[row.type] || row.type}</span>
                          <strong>{row.count}</strong>
                        </div>
                        <div style={{ height: 5, borderRadius: 99, background: 'var(--dash-panel-3)' }}>
                          <div
                            style={{
                              width: `${Math.max(4, (row.count / max) * 100)}%`,
                              height: '100%',
                              borderRadius: 99,
                              background: 'var(--dash-green)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <Button as={Link} href="/dashboard/analytics" $variant="ghost" style={{ alignSelf: 'flex-start', padding: '4px 0', fontSize: 12 }}>
                    Open full analytics <ArrowRight size={12} />
                  </Button>
                </div>
              )}
            </Card>
          </Grid>

          <Grid>
            <Card>
              <h2 style={{ fontSize: 15, marginBottom: 8 }}>Marketing tools</h2>
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <ToolLink key={tool.href} href={tool.href}>
                    <span className="ic"><Icon /></span>
                    <span className="grow">
                      <strong>{tool.title}</strong>
                      <span>{tool.text}</span>
                    </span>
                    <ArrowRight size={13} />
                  </ToolLink>
                );
              })}
            </Card>

            <Card>
              <h2 style={{ fontSize: 15, marginBottom: 10 }}>Recent activity</h2>
              {(stats.recent || []).length === 0 ? (
                <EmptyState title="No tracked activity" text="Storefront events will appear here." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {stats.recent.slice(0, 8).map((event) => (
                    <div
                      key={event.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 0',
                        borderBottom: '1px solid var(--dash-line-soft)',
                        fontSize: 12,
                      }}
                    >
                      <Badge $tone="neutral">{EVENT_LABELS[event.type] || event.type}</Badge>
                      <span className="muted" style={{ marginLeft: 'auto', fontSize: 10.5, whiteSpace: 'nowrap' }}>
                        {formatDateTime(event.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--dash-faint)' }}>
                <Users size={13} /> Events are stored through the first-party /api/events endpoint.
              </div>
            </Card>
          </Grid>
        </>
      )}
    </>
  );
}
