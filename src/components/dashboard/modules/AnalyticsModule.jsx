'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  Activity,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Settings2,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  SkeletonRows,
  Table,
  TableScroll,
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

const EVENT_TONES = {
  purchase: 'green',
  quote_request: 'gold',
  contact_submit: 'blue',
  whatsapp_click: 'green',
  add_to_cart: 'blue',
  checkout_started: 'gold',
  product_view: 'neutral',
};

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

const ChartCard = styled(Card)`
  margin-bottom: 14px;
`;

const Chart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 160px;
  padding-top: 16px;
  .col {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 6px;
    height: 100%;
  }
  .bar {
    width: 100%;
    border-radius: 3px 3px 0 0;
    background: linear-gradient(180deg, rgba(233, 166, 78, 0.85), rgba(233, 166, 78, 0.25));
    min-height: 3px;
    transition: opacity 0.15s ease;
  }
  .col:hover .bar {
    opacity: 0.75;
  }
  .day {
    font-size: 9.5px;
    color: var(--dash-faint);
  }
`;

const BreakdownRow = styled.div`
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 54px;
  gap: 12px;
  align-items: center;
  padding: 7px 0;
  font-size: 12px;
  .label {
    color: var(--dash-ink);
  }
  .track {
    height: 5px;
    border-radius: 999px;
    background: var(--dash-panel-3);
    overflow: hidden;
  }
  .track span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--dash-accent);
    opacity: 0.8;
  }
  .count {
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
`;

const FunnelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--dash-line-soft);
  &:last-child {
    border-bottom: 0;
  }
  .step {
    width: 150px;
    font-size: 12px;
    color: var(--dash-muted);
  }
  .bar-wrap {
    flex: 1;
    height: 26px;
    border-radius: 5px;
    background: var(--dash-panel-2);
    overflow: hidden;
    position: relative;
  }
  .bar {
    height: 100%;
    background: rgba(233, 166, 78, 0.22);
    border-right: 2px solid var(--dash-accent);
    display: flex;
    align-items: center;
    padding-left: 8px;
    font-size: 11px;
    font-weight: 650;
    color: var(--dash-ink);
    min-width: 36px;
  }
  .rate {
    width: 70px;
    text-align: right;
    font-size: 11.5px;
    color: var(--dash-faint);
    font-variant-numeric: tabular-nums;
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
  margin-bottom: 14px;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
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
  }
  a {
    font-size: 11.5px;
    color: var(--dash-accent);
    font-weight: 600;
  }
`;

export default function AnalyticsModule() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiRequest('/api/marketing');
      setData(payload.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const events = data?.events;
  const daily = events?.daily || [];
  const maxDaily = Math.max(1, ...daily.map((point) => point.count));
  const byType = [...(events?.byType || [])].sort((a, b) => b.count - a.count);
  const maxType = Math.max(1, ...byType.map((row) => row.count));
  const typeCount = (type) => byType.find((row) => row.type === type)?.count || 0;

  const funnel = [
    { key: 'product_view', label: 'Product views' },
    { key: 'add_to_cart', label: 'Added to cart' },
    { key: 'checkout_started', label: 'Checkout started' },
    { key: 'purchase', label: 'Purchased' },
  ];
  const funnelMax = Math.max(1, ...funnel.map((step) => typeCount(step.key)));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        <div>
          <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dash-accent)', marginBottom: 6 }}>
            Marketing
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3vw, 32px)', letterSpacing: '-0.02em', marginBottom: 5 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: 'var(--dash-muted)', maxWidth: 640 }}>
            First-party storefront events recorded through the public site — product interest, cart
            activity, checkouts, quote requests and contact submissions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button as={Link} href="/dashboard/seo" $variant="outline">
            <Settings2 size={14} /> Tracking settings
          </Button>
          <Button type="button" $variant="outline" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <ErrorBlock message={error} onRetry={load} />
        </Card>
      ) : loading || !data ? (
        <Card>
          <SkeletonRows rows={7} />
        </Card>
      ) : (
        <>
          <KPI_GRID>
            <KPI>
              <div className="label">
                <Activity /> Events (30 days)
              </div>
              <div className="value">{events?.total30d ?? 0}</div>
              <div className="hint">Across the public storefront</div>
            </KPI>
            <KPI>
              <div className="label">
                <TrendingUp /> Quote requests
              </div>
              <div className="value">{typeCount('quote_request')}</div>
              <div className="hint">30-day total</div>
            </KPI>
            <KPI>
              <div className="label">
                <MessageCircle /> WhatsApp clicks
              </div>
              <div className="value">{typeCount('whatsapp_click')}</div>
              <div className="hint">30-day total</div>
            </KPI>
            <KPI>
              <div className="label">
                <ShoppingBag /> Purchases
              </div>
              <div className="value">{typeCount('purchase')}</div>
              <div className="hint">30-day total</div>
            </KPI>
          </KPI_GRID>

          <ChartCard>
            <SectionTitle>
              <h2>Last 14 days</h2>
              <span style={{ fontSize: 11.5, color: 'var(--dash-faint)' }}>
                {daily.reduce((sum, point) => sum + point.count, 0)} events
              </span>
            </SectionTitle>
            <Chart>
              {daily.map((point) => (
                <div className="col" key={point.date} title={`${point.date}: ${point.count} events`}>
                  <span className="bar" style={{ height: `${Math.max(2, (point.count / maxDaily) * 100)}%` }} />
                  <span className="day">{new Date(point.date).getDate()}</span>
                </div>
              ))}
            </Chart>
          </ChartCard>

          <TwoCol>
            <Card>
              <SectionTitle>
                <h2>Event breakdown</h2>
                <span style={{ fontSize: 11.5, color: 'var(--dash-faint)' }}>30 days</span>
              </SectionTitle>
              {byType.length === 0 ? (
                <EmptyState title="No events yet" text="Events appear as visitors browse the storefront." />
              ) : (
                byType.map((row) => (
                  <BreakdownRow key={row.type}>
                    <span className="label">{EVENT_LABELS[row.type] || row.type}</span>
                    <span className="track">
                      <span style={{ width: `${(row.count / maxType) * 100}%` }} />
                    </span>
                    <span className="count">{row.count}</span>
                  </BreakdownRow>
                ))
              )}
            </Card>

            <Card>
              <SectionTitle>
                <h2>Purchase funnel</h2>
                <span style={{ fontSize: 11.5, color: 'var(--dash-faint)' }}>30 days</span>
              </SectionTitle>
              {funnel.map((step, index) => {
                const count = typeCount(step.key);
                const previous = index === 0 ? null : typeCount(funnel[index - 1].key);
                const rate = previous ? Math.round((count / Math.max(1, previous)) * 100) : null;
                return (
                  <FunnelRow key={step.key}>
                    <span className="step">{step.label}</span>
                    <span className="bar-wrap">
                      <span className="bar" style={{ width: `${(count / funnelMax) * 100}%` }}>
                        {count}
                      </span>
                    </span>
                    <span className="rate">{rate === null ? '—' : `${rate}%`}</span>
                  </FunnelRow>
                );
              })}
              <p style={{ marginTop: 10, fontSize: 11.5, color: 'var(--dash-muted)', lineHeight: 1.65 }}>
                Funnel steps count unique first-party events, not sessions. Rates compare each step
                with the one above it.
              </p>
            </Card>
          </TwoCol>

          <Card>
            <SectionTitle>
              <h2>Latest events</h2>
              <a href="/dashboard/seo">Configure tracking →</a>
            </SectionTitle>
            {(data.recent || []).length === 0 ? (
              <EmptyState
                icon={<Activity size={26} />}
                title="No tracked events"
                text="Browse the storefront to generate product, cart and checkout events."
              />
            ) : (
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Path</th>
                      <th>Metadata</th>
                      <th>Time</th>
                      <th style={{ width: 30 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <Badge $tone={EVENT_TONES[event.type] || 'neutral'}>
                            {EVENT_LABELS[event.type] || event.type}
                          </Badge>
                        </td>
                        <td className="mono" style={{ fontSize: 11.5 }}>
                          {event.path || '—'}
                        </td>
                        <td className="muted" style={{ maxWidth: 320 }}>
                          {event.metadata && Object.keys(event.metadata).length
                            ? Object.entries(event.metadata)
                                .slice(0, 3)
                                .map(([key, value]) => `${key}: ${String(value).slice(0, 30)}`)
                                .join(' · ')
                            : '—'}
                        </td>
                        <td className="muted">{formatDateTime(event.createdAt)}</td>
                        <td>
                          {event.path ? (
                            <a href={event.path} target="_blank" rel="noreferrer" aria-label="Open path" style={{ color: 'var(--dash-faint)' }}>
                              <ExternalLink size={13} />
                            </a>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            )}
          </Card>
        </>
      )}
    </>
  );
}
