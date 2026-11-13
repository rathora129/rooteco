/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowUpRight,
  BellRing,
  Boxes,
  ChevronRight,
  CircleHelp,
  FileText,
  Image as ImageIcon,
  Megaphone,
  MessageCircle,
  Newspaper,
  Package,
  Percent,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  PageHeader,
  SectionHead,
  SkeletonBar,
  SkeletonRows,
  StatusBadge,
  Table,
  TableScroll,
} from '@/components/dashboard/ui';
import { formatDate, formatDateTime, formatMoney, getDashboardStats } from '@/components/dashboard/hooks';

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Kpi = styled(Link)`
  display: block;
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: 14px;
  padding: 16px 17px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.16s ease, transform 0.16s ease;
  &:hover {
    border-color: rgba(233, 166, 78, 0.38);
    transform: translateY(-1px);
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 14px;
  }
  .label {
    font-size: 10.5px;
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dash-faint);
  }
  .icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: var(--dash-accent-soft);
    color: var(--dash-accent);
    svg { width: 14px; height: 14px; }
  }
  .value {
    font-size: clamp(23px, 2.3vw, 29px);
    font-weight: 650;
    letter-spacing: -0.03em;
    color: var(--dash-ink);
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .hint {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 7px;
    font-size: 11px;
    color: var(--dash-muted);
  }
  .hint .good { color: var(--dash-green); }
`;

const Split = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 0.85fr);
  gap: 14px;
  margin-bottom: 16px;
  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 14px;
  margin-bottom: 16px;
  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const Row3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const ChartWrap = styled.div`
  position: relative;
  margin-top: 6px;
  svg { width: 100%; height: auto; display: block; }
  .grid line { stroke: rgba(255, 255, 255, 0.055); stroke-dasharray: 3 5; }
  .labels { display: flex; justify-content: space-between; margin-top: 4px; font-size: 9.5px; color: var(--dash-faint); }
  .empty { height: 210px; display: grid; place-items: center; color: var(--dash-faint); font-size: 12px; }
`;

const AlertLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  border-radius: 9px;
  border: 1px solid var(--dash-line-soft);
  background: var(--dash-panel-2);
  margin-bottom: 8px;
  transition: border-color 0.15s ease, background 0.15s ease;
  &:hover { border-color: rgba(233, 166, 78, 0.36); background: var(--dash-panel-3); }
  .ic {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: var(--dash-accent-soft);
    color: var(--dash-accent);
    svg { width: 14px; height: 14px; }
  }
  .txt { flex: 1; min-width: 0; }
  .txt strong { display: block; font-size: 12.3px; font-weight: 600; color: var(--dash-ink); }
  .txt span { display: block; font-size: 10.5px; color: var(--dash-faint); margin-top: 1px; }
  .n { font-size: 16px; font-weight: 650; color: var(--dash-ink); font-variant-numeric: tabular-nums; }
  svg.chev { width: 13px; height: 13px; color: var(--dash-faint); }
`;

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Quick = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--dash-line-soft);
  background: var(--dash-panel-2);
  color: var(--dash-muted);
  font-size: 11.5px;
  font-weight: 550;
  transition: border-color 0.15s ease, color 0.15s ease;
  &:hover { border-color: rgba(233, 166, 78, 0.4); color: var(--dash-ink); }
  svg { width: 16px; height: 16px; color: var(--dash-accent); }
`;

const TimelineItem = styled(Link)`
  display: flex;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--dash-line-soft);
  &:last-child { border-bottom: 0; }
  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: var(--dash-panel-3);
    color: var(--dash-muted);
    font-size: 10px;
    font-weight: 700;
  }
  .body { flex: 1; min-width: 0; }
  .body strong { display: block; font-size: 12px; font-weight: 600; color: var(--dash-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .body span { display: block; font-size: 10.5px; color: var(--dash-faint); margin-top: 1px; }
  &:hover .body strong { color: var(--dash-accent); }
`;

const ProductRow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 11px;
  .thumb {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    background: var(--dash-panel-3);
    display: grid;
    place-items: center;
    overflow: hidden;
    flex-shrink: 0;
    font-size: 10px;
    color: var(--dash-faint);
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .meta { flex: 1; min-width: 0; }
  .meta strong { display: block; font-size: 11.8px; font-weight: 600; color: var(--dash-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar { height: 4px; border-radius: 4px; background: var(--dash-line); margin-top: 5px; overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: 4px; background: var(--dash-accent); }
  .qty { font-size: 11px; font-weight: 600; color: var(--dash-muted); font-variant-numeric: tabular-nums; }
`;

const HealthRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--dash-line-soft);
  &:last-child { border-bottom: 0; }
  .ic { width: 26px; height: 26px; border-radius: 7px; display: grid; place-items: center; background: var(--dash-panel-2); color: var(--dash-muted); flex-shrink: 0; svg { width: 13px; height: 13px; } }
  .label { flex: 1; font-size: 11.8px; color: var(--dash-muted); }
  .value { font-size: 11.8px; font-weight: 650; color: var(--dash-ink); font-variant-numeric: tabular-nums; }
  .value em { font-style: normal; color: var(--dash-faint); font-weight: 500; }
`;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function initials(value) {
  return String(value || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function RevenueChart({ daily }) {
  const width = 640;
  const height = 190;
  const values = daily.map((point) => Number(point.value) || 0);
  const max = Math.max(1, ...values);
  const step = daily.length > 1 ? width / (daily.length - 1) : width;
  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - (value / max) * (height - 22) - 6;
    return [x, y];
  });
  const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 24, fontWeight: 650, letterSpacing: '-0.03em', color: 'var(--dash-ink)', fontVariantNumeric: 'tabular-nums' }}>
          {formatMoney(total)}
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--dash-muted)' }}>order value in the last 14 days</span>
        <Badge $tone="green" style={{ marginLeft: 'auto' }}>
          <TrendingUp size={10} /> live orders
        </Badge>
      </div>
      <ChartWrap>
        <svg viewBox={`0 0 ${width} ${height + 2}`} role="img" aria-label="Daily order value for the last 14 days">
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e9a64e" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#e9a64e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="grid">
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <line key={ratio} x1="0" x2={width} y1={height - ratio * (height - 22)} y2={height - ratio * (height - 22)} />
            ))}
          </g>
          <path d={area} fill="url(#revFill)" />
          <path d={line} fill="none" stroke="#e9a64e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {points.map(([x, y], index) => (
            <g key={daily[index]?.date || index}>
              <circle cx={x} cy={y} r="2.6" fill="#080a09" stroke="#e9a64e" strokeWidth="1.6" />
              <title>{`${formatDate(daily[index]?.date)} · ${formatMoney(values[index])} · ${daily[index]?.orders || 0} orders`}</title>
            </g>
          ))}
        </svg>
        <div className="labels">
          {daily.map((point, index) =>
            index % 2 === 0 || index === daily.length - 1 ? (
              <span key={point.date}>{new Date(point.date).getDate()}</span>
            ) : (
              <span key={point.date} style={{ opacity: 0 }}>·</span>
            )
          )}
        </div>
      </ChartWrap>
    </>
  );
}

function Pipeline({ rows, tone = 'accent' }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (!rows.length) return <EmptyState title="No pipeline data" text="Activity will populate this pipeline." />;
  const colors = {
    new: 'var(--dash-accent)',
    contacted: 'var(--dash-blue)',
    qualified: 'var(--dash-blue)',
    proposal: 'var(--dash-accent)',
    quoted: 'var(--dash-accent)',
    won: 'var(--dash-green)',
    lost: 'var(--dash-red)',
    pending: 'var(--dash-accent)',
    confirmed: 'var(--dash-blue)',
    converted: 'var(--dash-green)',
  };
  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', background: 'var(--dash-line)', marginBottom: 12 }}>
        {rows.map((row) => (
          <span
            key={row.status}
            title={`${row.status}: ${row.count}`}
            style={{ width: `${Math.max(3, (row.count / Math.max(1, total)) * 100)}%`, background: colors[row.status] || (tone === 'muted' ? 'var(--dash-muted)' : 'var(--dash-accent)') }}
          />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 8 }}>
        {rows.map((row) => (
          <div key={row.status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: colors[row.status] || 'var(--dash-muted)', flexShrink: 0 }} />
            <span style={{ color: 'var(--dash-muted)', textTransform: 'capitalize', flex: 1 }}>{row.status}</span>
            <strong style={{ color: 'var(--dash-ink)', fontVariantNumeric: 'tabular-nums' }}>{row.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewModule() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getDashboardStats(refreshKey ? 0 : 15000)
      .then((payload) => {
        if (active) setData(payload.data);
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

  const daily = data?.daily || [];
  const followUps = data?.recent?.followUps || [];
  const topProducts = data?.topProducts || [];
  const maxQty = Math.max(1, ...topProducts.map((product) => product.qty));
  const counts = data?.counts || {};
  const alerts = useMemo(() => {
    if (!data) return [];
    return [
      { show: counts.pendingOrders > 0, href: '/dashboard/orders', icon: ShoppingBag, title: 'Orders awaiting confirmation', meta: 'Confirm payment and start fulfilment', n: counts.pendingOrders },
      { show: counts.newQuotes > 0, href: '/dashboard/quotes', icon: Package, title: 'New quotation requests', meta: 'Reply with a tailored quote', n: counts.newQuotes },
      { show: followUps.length > 0, href: '/dashboard/leads?due=true', icon: BellRing, title: 'Follow-ups due', meta: 'Leads waiting on a reply', n: followUps.length },
      { show: counts.lowStock > 0, href: '/dashboard/products', icon: Boxes, title: 'Products low on stock', meta: 'Restock to avoid missed orders', n: counts.lowStock },
      { show: counts.activeLeads > 0, href: '/dashboard/leads', icon: Users, title: 'Active leads in pipeline', meta: 'Keep the conversation moving', n: counts.activeLeads },
    ].filter((row) => row.show);
  }, [data, counts, followUps]);

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">{getGreeting()} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1>Business overview</h1>
          <p>
            Revenue, orders, pipeline and website health — everything that needs your attention today in one
            place.
          </p>
        </div>
        <div className="actions">
          <Button type="button" $variant="outline" onClick={() => setRefreshKey((key) => key + 1)}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button as="a" href="/" target="_blank" rel="noreferrer" $variant="outline">
            <ArrowUpRight size={14} /> View storefront
          </Button>
        </div>
      </PageHeader>

      {error && <ErrorBlock message={error} onRetry={() => setRefreshKey((key) => key + 1)} />}

      {loading ? (
        <>
          <KpiGrid>
            {[0, 1, 2, 3].map((index) => (
              <Card key={index}>
                <SkeletonBar $w="48%" />
                <div style={{ height: 14 }} />
                <SkeletonBar $w="66%" style={{ height: 24 }} />
                <div style={{ height: 10 }} />
                <SkeletonBar $w="42%" />
              </Card>
            ))}
          </KpiGrid>
          <Split>
            <Card><SkeletonRows rows={5} /></Card>
            <Card><SkeletonRows rows={4} /></Card>
          </Split>
        </>
      ) : data ? (
        <>
          <KpiGrid>
            <Kpi href="/dashboard/orders">
              <div className="top">
                <span className="label">Order value</span>
                <span className="icon"><ShoppingBag /></span>
              </div>
              <div className="value">{formatMoney(data.value?.orderValue)}</div>
              <div className="hint"><span className="good">{formatMoney(data.value?.paidValue)}</span> confirmed paid</div>
            </Kpi>
            <Kpi href="/dashboard/orders">
              <div className="top">
                <span className="label">Orders</span>
                <span className="icon"><Package /></span>
              </div>
              <div className="value">{counts.orders ?? 0}</div>
              <div className="hint">{counts.pendingOrders ?? 0} awaiting confirmation</div>
            </Kpi>
            <Kpi href="/dashboard/leads">
              <div className="top">
                <span className="label">Active leads</span>
                <span className="icon"><Users /></span>
              </div>
              <div className="value">{counts.activeLeads ?? 0}</div>
              <div className="hint">{counts.monthLeads ?? 0} new this month</div>
            </Kpi>
            <Kpi href="/dashboard/quotes">
              <div className="top">
                <span className="label">Open quotes</span>
                <span className="icon"><FileText /></span>
              </div>
              <div className="value">{counts.quotes ?? 0}</div>
              <div className="hint">{counts.newQuotes ?? 0} new requests</div>
            </Kpi>
          </KpiGrid>

          <Split>
            <Card>
              <SectionHead>
                <div>
                  <h2>Revenue trend</h2>
                  <div className="sub">Daily order value, excluding cancelled orders</div>
                </div>
                <Link href="/dashboard/orders" style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-accent)' }}>
                  View orders
                </Link>
              </SectionHead>
              <RevenueChart daily={daily} />
            </Card>

            <Card>
              <SectionHead>
                <div>
                  <h2>Needs attention</h2>
                  <div className="sub">The work that moves revenue today</div>
                </div>
                <Badge $tone={alerts.length ? 'gold' : 'green'}>{alerts.length || 'Clear'}</Badge>
              </SectionHead>
              {alerts.length === 0 ? (
                <EmptyState title="All clear" text="No pending orders, quote requests or overdue follow-ups." />
              ) : (
                alerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <AlertLink key={alert.title} href={alert.href}>
                      <span className="ic"><Icon /></span>
                      <span className="txt">
                        <strong>{alert.title}</strong>
                        <span>{alert.meta}</span>
                      </span>
                      <span className="n">{alert.n}</span>
                      <ChevronRight className="chev" />
                    </AlertLink>
                  );
                })
              )}
            </Card>
          </Split>

          <Row2>
            <Card $pad="0">
              <div style={{ padding: '18px 20px 12px' }}>
                <SectionHead>
                  <div>
                    <h2>Recent orders</h2>
                    <div className="sub">The latest checkouts from your storefront</div>
                  </div>
                  <Link href="/dashboard/orders">View all</Link>
                </SectionHead>
              </div>
              {(data.recent?.orders || []).length === 0 ? (
                <EmptyState title="No orders yet" text="Storefront checkouts will appear here." />
              ) : (
                <TableScroll style={{ border: 0, borderRadius: 0 }}>
                  <Table>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <div className="strong">{order.number}</div>
                            <div className="muted">{formatDate(order.createdAt)}</div>
                          </td>
                          <td>
                            <div>{order.customerName}</div>
                            <div className="muted">{order.email || order.phone || '—'}</div>
                          </td>
                          <td className="strong mono">{formatMoney(order.total)}</td>
                          <td><StatusBadge value={order.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableScroll>
              )}
            </Card>

            <Card>
              <SectionHead>
                <div>
                  <h2>Latest enquiries</h2>
                  <div className="sub">Incoming leads and their source</div>
                </div>
                <Link href="/dashboard/leads">Open CRM</Link>
              </SectionHead>
              {(data.recent?.leads || []).length === 0 ? (
                <EmptyState title="No leads yet" text="Website enquiries will show up here." />
              ) : (
                data.recent.leads.map((lead) => (
                  <TimelineItem key={lead.id} href={`/dashboard/leads`}>
                    <span className="avatar">{initials(lead.name)}</span>
                    <span className="body">
                      <strong>{lead.name}</strong>
                      <span>{lead.phone || lead.email || 'No contact'} · {lead.source || 'website'}</span>
                    </span>
                    <StatusBadge value={lead.status} />
                  </TimelineItem>
                ))
              )}
            </Card>
          </Row2>

          <Row3>
            <Card>
              <SectionHead>
                <div>
                  <h2>Quotation pipeline</h2>
                  <div className="sub">Requests by current stage</div>
                </div>
                <Link href="/dashboard/quotes">Manage</Link>
              </SectionHead>
              <Pipeline rows={data.pipeline?.quotes || []} />
            </Card>

            <Card>
              <SectionHead>
                <div>
                  <h2>Best sellers</h2>
                  <div className="sub">Units sold across live orders</div>
                </div>
                <Link href="/dashboard/products">Catalogue</Link>
              </SectionHead>
              {topProducts.length === 0 ? (
                <EmptyState title="No sales yet" text="Best sellers appear after orders are placed." />
              ) : (
                topProducts.map((product) => (
                  <ProductRow key={product.productId}>
                    <span className="thumb">
                      {product.image ? <img src={product.image} alt={product.name} /> : initials(product.name)}
                    </span>
                    <span className="meta">
                      <strong>{product.name}</strong>
                      <span className="bar"><span style={{ width: `${Math.max(5, (product.qty / maxQty) * 100)}%` }} /></span>
                    </span>
                    <span className="qty">{product.qty}</span>
                  </ProductRow>
                ))
              )}
            </Card>

            <Card>
              <SectionHead>
                <div>
                  <h2>Website health</h2>
                  <div className="sub">What customers see right now</div>
                </div>
                <Link href="/dashboard/website">Studio</Link>
              </SectionHead>
              <HealthRow>
                <span className="ic"><FileText /></span>
                <span className="label">Published pages</span>
                <span className="value">{counts.publishedPages ?? 0} <em>/ {counts.pages ?? 0}</em></span>
              </HealthRow>
              <HealthRow>
                <span className="ic"><Boxes /></span>
                <span className="label">Live products</span>
                <span className="value">{counts.publishedProducts ?? 0} <em>/ {counts.products ?? 0}</em></span>
              </HealthRow>
              <HealthRow>
                <span className="ic"><Newspaper /></span>
                <span className="label">Published blogs</span>
                <span className="value">{counts.publishedBlogs ?? 0}</span>
              </HealthRow>
              <HealthRow>
                <span className="ic"><Megaphone /></span>
                <span className="label">Active banners</span>
                <span className="value">{counts.activeBanners ?? 0}</span>
              </HealthRow>
              <HealthRow>
                <span className="ic"><ImageIcon /></span>
                <span className="label">Media assets</span>
                <span className="value">{counts.media ?? 0}</span>
              </HealthRow>
            </Card>
          </Row3>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 14 }}>
            <Card>
              <SectionHead>
                <div>
                  <h2>Quick actions</h2>
                  <div className="sub">Common jobs, one click away</div>
                </div>
              </SectionHead>
              <QuickGrid>
                <Quick href="/dashboard/products"><Plus /> Add a product</Quick>
                <Quick href="/dashboard/pages"><FileText /> Build a page</Quick>
                <Quick href="/dashboard/coupons"><Percent /> Create a coupon</Quick>
                <Quick href="/dashboard/blogs"><Newspaper /> Write a blog post</Quick>
                <Quick href="/dashboard/whatsapp"><MessageCircle /> Message customers</Quick>
                <Quick href="/dashboard/help"><CircleHelp /> Open help centre</Quick>
              </QuickGrid>
            </Card>
          </div>

          {(followUps.length > 0 || (data.recent?.quotes || []).length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 16 }}>
              {followUps.length > 0 && (
                <Card>
                  <SectionHead>
                    <div>
                      <h2>Follow-ups due</h2>
                      <div className="sub">Overdue conversations</div>
                    </div>
                    <Link href="/dashboard/leads?due=true">Open leads</Link>
                  </SectionHead>
                  {followUps.slice(0, 4).map((item) => (
                    <AlertLink key={item.id} href="/dashboard/leads">
                      <span className="ic"><BellRing /></span>
                      <span className="txt">
                        <strong>{item.lead?.name || 'Lead'}</strong>
                        <span>{item.note || item.lead?.phone || 'Follow up'}</span>
                      </span>
                      <Badge $tone="gold">{formatDate(item.dueDate)}</Badge>
                    </AlertLink>
                  ))}
                </Card>
              )}
              {(data.recent?.quotes || []).length > 0 && (
                <Card>
                  <SectionHead>
                    <div>
                      <h2>Latest quotations</h2>
                      <div className="sub">Requests you can convert</div>
                    </div>
                    <Link href="/dashboard/quotes">View quotes</Link>
                  </SectionHead>
                  {data.recent.quotes.slice(0, 4).map((quote) => (
                    <TimelineItem key={quote.id} href="/dashboard/quotes">
                      <span className="avatar">{initials(quote.name)}</span>
                      <span className="body">
                        <strong>{quote.name}</strong>
                        <span>{quote.productName || quote.product?.name || 'Custom gifting'}{quote.quantity ? ` · ${quote.quantity} units` : ''}</span>
                      </span>
                      <StatusBadge value={quote.status} />
                    </TimelineItem>
                  ))}
                </Card>
              )}
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 10.5, color: 'var(--dash-faint)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={11} /> Live data from your RootEco store
            </span>
            <span>Updated {formatDateTime(new Date())}</span>
          </div>
        </>
      ) : null}
    </>
  );
}
