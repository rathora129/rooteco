/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatusBadge,
  Table,
  TableScroll,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, formatDateTime, formatMoney } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

function StatCard({ label, value, hint, href }) {
  const inner = (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${theme.colors.line}`,
        borderRadius: 14,
        padding: '16px 18px',
        height: '100%',
        boxShadow: theme.shadow.soft,
      }}
    >
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.colors.muted }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: theme.colors.forest, marginTop: 6 }}>{value}</div>
      {hint && <div style={{ fontSize: 11.5, color: theme.colors.muted, marginTop: 4 }}>{hint}</div>}
    </div>
  );
  return href ? <Link href={href} style={{ display: 'block' }}>{inner}</Link> : inner;
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
    apiRequest('/api/dashboard/stats')
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
  const maxRevenue = Math.max(1, ...daily.map((point) => Number(point.value)));
  const pipeline = data?.pipeline?.leads || [];
  const pipelineTotal = Math.max(1, pipeline.reduce((sum, row) => sum + row.count, 0));

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Owner overview</span>
          <h1>Dashboard</h1>
          <p>
            Store health at a glance — revenue, orders, pipeline and the enquiries that need a reply
            today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="button" $variant="outline" onClick={() => setRefreshKey((key) => key + 1)}>
            Refresh
          </Button>
          <Button as="a" href="/" target="_blank" rel="noreferrer">View storefront</Button>
        </div>
      </PageHeader>

      {error && <ErrorBlock message={error} onRetry={() => setRefreshKey((key) => key + 1)} />}
      {loading && <Card><LoadingBlock label="Loading overview…" /></Card>}

      {data && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <StatCard
              label="Order value"
              value={formatMoney(data.value?.orderValue)}
              hint={`${formatMoney(data.value?.paidValue)} confirmed paid`}
              href="/dashboard/orders"
            />
            <StatCard
              label="Orders"
              value={data.counts?.orders ?? 0}
              hint={`${data.counts?.pendingOrders ?? 0} awaiting confirmation`}
              href="/dashboard/orders"
            />
            <StatCard
              label="Products"
              value={data.counts?.publishedProducts ?? 0}
              hint={`${data.counts?.lowStock ?? 0} low stock · ${data.counts?.products ?? 0} total`}
              href="/dashboard/products"
            />
            <StatCard
              label="Leads"
              value={data.counts?.activeLeads ?? 0}
              hint={`${data.counts?.monthLeads ?? 0} new this month`}
              href="/dashboard/leads"
            />
            <StatCard
              label="Quotes"
              value={data.counts?.quotes ?? 0}
              hint={`${data.counts?.newQuotes ?? 0} new requests`}
              href="/dashboard/quotes"
            />
            <StatCard
              label="Clients"
              value={data.counts?.clients ?? 0}
              hint={`${data.counts?.messages ?? 0} WhatsApp messages`}
              href="/dashboard/leads"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: 18, marginBottom: 18 }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, color: theme.colors.forest }}>Order value · last 14 days</h2>
                <Badge $tone="cream">Live orders</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 150 }}>
                {daily.map((point) => (
                  <div
                    key={point.date}
                    style={{ flex: 1, textAlign: 'center' }}
                    title={`${point.date} · ${formatMoney(point.value)} · ${point.orders} orders`}
                  >
                    <div
                      style={{
                        height: `${Math.max(4, (Number(point.value) / maxRevenue) * 100)}px`,
                        background: Number(point.value) ? theme.colors.forest : theme.colors.creamDark,
                        borderRadius: 4,
                      }}
                    />
                    <div style={{ fontSize: 9, color: theme.colors.muted, marginTop: 4 }}>
                      {new Date(point.date).getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: theme.colors.muted }}>
                Daily order value excludes cancelled orders.
              </div>
            </Card>

            <Card>
              <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Lead pipeline</h2>
              {pipeline.length === 0 ? (
                <EmptyState title="No leads yet" text="Website enquiries will populate the pipeline." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pipeline.map((row) => (
                    <div key={row.status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ textTransform: 'capitalize' }}>{row.status}</span>
                        <strong>{row.count}</strong>
                      </div>
                      <div style={{ height: 7, background: theme.colors.creamDark, borderRadius: 999 }}>
                        <div
                          style={{
                            width: `${Math.max(4, (row.count / pipelineTotal) * 100)}%`,
                            height: '100%',
                            background: theme.colors.green,
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button as={Link} href="/dashboard/leads" $variant="outline" style={{ marginTop: 14, width: '100%' }}>
                Open CRM
              </Button>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 18, marginBottom: 18 }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, color: theme.colors.forest }}>Recent orders</h2>
                <Link href="/dashboard/orders" style={{ fontSize: 12, color: theme.colors.forest, fontWeight: 600 }}>
                  View all
                </Link>
              </div>
              {(data.recent?.orders || []).length === 0 ? (
                <EmptyState title="No orders yet" text="Storefront checkouts will appear here." />
              ) : (
                <TableScroll>
                  <Table>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Payment</th>
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
                            <div className="muted">{order.email}</div>
                          </td>
                          <td className="strong">{formatMoney(order.total)}</td>
                          <td><StatusBadge value={order.status} /></td>
                          <td><StatusBadge value={order.paymentStatus} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableScroll>
              )}
            </Card>

            <Card>
              <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Follow-ups due</h2>
              {(data.recent?.followUps || []).length === 0 ? (
                <EmptyState title="Nothing due" text="No overdue follow-ups right now." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.recent.followUps.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#fff',
                        border: `1px solid ${theme.colors.line}`,
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 12.5,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong>{item.lead?.name || 'Lead'}</strong>
                        <Badge $tone="gold">{formatDate(item.dueDate)}</Badge>
                      </div>
                      {item.note && <div style={{ color: theme.colors.muted, marginTop: 3 }}>{item.note}</div>}
                      <div style={{ color: theme.colors.muted, fontSize: 11, marginTop: 3 }}>
                        {item.lead?.phone || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h2 style={{ fontSize: 15, color: theme.colors.forest }}>Latest quotes</h2>
                <Link href="/dashboard/quotes" style={{ fontSize: 12, color: theme.colors.forest, fontWeight: 600 }}>
                  View
                </Link>
              </div>
              {(data.recent?.quotes || []).length === 0 ? (
                <EmptyState title="No quotes" text="Bulk quote requests will appear here." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.recent.quotes.map((quote) => (
                    <div key={quote.id} style={{ fontSize: 12.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong>{quote.name}</strong>
                        <StatusBadge value={quote.status} />
                      </div>
                      <div style={{ color: theme.colors.muted }}>
                        {quote.productName || quote.product?.name || 'Custom gifting'}
                        {quote.quantity ? ` · ${quote.quantity} units` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h2 style={{ fontSize: 15, color: theme.colors.forest }}>Latest leads</h2>
                <Link href="/dashboard/leads" style={{ fontSize: 12, color: theme.colors.forest, fontWeight: 600 }}>
                  View
                </Link>
              </div>
              {(data.recent?.leads || []).length === 0 ? (
                <EmptyState title="No leads" text="Enquiries will appear here." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.recent.leads.map((lead) => (
                    <div key={lead.id} style={{ fontSize: 12.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong>{lead.name}</strong>
                        <StatusBadge value={lead.status} />
                      </div>
                      <div style={{ color: theme.colors.muted }}>
                        {lead.phone} · {lead.source}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 style={{ fontSize: 15, color: theme.colors.forest, marginBottom: 10 }}>Top products</h2>
              {(data.topProducts || []).length === 0 ? (
                <EmptyState title="No sales yet" text="Best sellers appear after orders are placed." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {data.topProducts.map((product) => (
                    <div key={product.productId} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: 34, height: 34, borderRadius: 7, objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ width: 34, height: 34, borderRadius: 7, background: theme.colors.cream }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5 }}>
                        <div className="strong" style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name}
                        </div>
                        <div style={{ color: theme.colors.muted }}>{product.qty} sold</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div style={{ marginTop: 18, fontSize: 11.5, color: theme.colors.muted, textAlign: 'right' }}>
            Updated {formatDateTime(new Date())}
          </div>
        </>
      )}
    </>
  );
}
