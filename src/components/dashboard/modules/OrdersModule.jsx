/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import {
  Button,
  Badge,
  Card,
  EmptyState,
  ErrorBlock,
  Field,
  FormGrid,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Pagination,
  SearchBox,
  Select,
  StatusBadge,
  Table,
  TableScroll,
  Textarea,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDateTime, formatMoney, useDebounced, useList } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'authorized', 'failed', 'refunded'];

export default function OrdersModule() {
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 320);
  const { data, meta, loading, error, refresh } = useList('/api/orders', {
    q: debouncedQ,
    page,
    pageSize: 20,
    filters: { status, paymentStatus },
  });

  const [active, setActive] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ status: 'pending', paymentStatus: 'pending', paymentRef: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function openOrder(order) {
    setActive(order);
    setDetailLoading(true);
    setForm({
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus === 'paid' ? 'paid' : order.paymentStatus || 'pending',
      paymentRef: order.paymentRef || '',
      notes: order.notes || '',
    });
    setFormError('');
    try {
      const response = await apiRequest(`/api/orders/${order.id}`);
      setActive(response.data);
      setForm({
        status: response.data.status || 'pending',
        paymentStatus: response.data.paymentStatus === 'paid' ? 'paid' : response.data.paymentStatus || 'pending',
        paymentRef: response.data.paymentRef || '',
        notes: response.data.notes || '',
      });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        status: form.status,
        paymentRef: form.paymentRef || undefined,
        notes: form.notes || undefined,
      };
      if (form.paymentStatus !== 'paid') payload.paymentStatus = form.paymentStatus;
      await apiRequest(`/api/orders/${active.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      notify('Order updated.');
      setActive(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Sales</span>
          <h1>Orders</h1>
          <p>
            Review incoming orders, confirm payment and production status, and keep fulfilment notes
            together. Paid status is only set by a verified payment provider.
          </p>
        </div>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchBox value={q} onChange={(value) => { setQ(value); setPage(1); }} placeholder="Search order number, customer, email…" />
          <Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} style={{ width: 'auto' }}>
            <option value="">All order statuses</option>
            {ORDER_STATUSES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
          <Select value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); setPage(1); }} style={{ width: 'auto' }}>
            <option value="">All payment statuses</option>
            {['pending', 'authorized', 'paid', 'failed', 'refunded'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        </Toolbar>

        {error && <ErrorBlock message={error} onRetry={refresh} />}
        {loading ? (
          <LoadingBlock label="Loading orders…" />
        ) : data.length === 0 ? (
          <EmptyState title="No orders found" text="New storefront orders will appear here as soon as a customer checks out." />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Placed</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Order status</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="strong">{order.number}</div>
                        <div className="muted">{order.paymentMethod || '—'}</div>
                      </td>
                      <td>
                        <div className="strong">{order.customerName}</div>
                        <div className="muted">{order.email}</div>
                      </td>
                      <td className="muted">{formatDateTime(order.createdAt)}</td>
                      <td>{order.items?.reduce((sum, item) => sum + item.qty, 0) || 0}</td>
                      <td className="strong">{formatMoney(order.total)}</td>
                      <td><StatusBadge value={order.status} /></td>
                      <td><StatusBadge value={order.paymentStatus} /></td>
                      <td>
                        <div className="actions">
                          <Button type="button" $variant="outline" onClick={() => openOrder(order)} style={{ padding: '6px 12px' }}>
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <Pagination meta={meta} onPage={(next) => setPage(next)} />
          </>
        )}
      </Card>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active ? `Order ${active.number}` : 'Order'}
        wide
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setActive(null)}>Close</Button>
            <Button type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </>
        }
      >
        {active && (
          <>
            {formError && <ErrorBlock message={formError} />}
            {detailLoading && <LoadingBlock label="Loading order history…" />}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, color: theme.colors.forest, marginBottom: 10 }}>Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(active.items || []).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        background: '#fff',
                        border: `1px solid ${theme.colors.line}`,
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: 46, height: 46, borderRadius: 7, objectFit: 'cover' }} />
                      ) : (
                        <span style={{ width: 46, height: 46, borderRadius: 7, background: theme.colors.cream }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="strong" style={{ fontSize: 12.5 }}>{item.name}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>
                          Qty {item.qty}{item.color ? ` · ${item.color}` : ''}{item.variant ? ` · ${item.variant}` : ''}
                        </div>
                      </div>
                      <strong style={{ fontSize: 12.5 }}>{formatMoney(Number(item.price) * item.qty)}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, background: '#fff', border: `1px solid ${theme.colors.line}`, borderRadius: 10, padding: 14, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span style={{ color: theme.colors.muted }}>Subtotal</span>
                    <span>{formatMoney(active.subtotal)}</span>
                  </div>
                  {Number(active.discount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span style={{ color: theme.colors.muted }}>Discount</span>
                      <span>−{formatMoney(active.discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span style={{ color: theme.colors.muted }}>Shipping</span>
                    <span>{formatMoney(active.shipping)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', marginTop: 6, borderTop: `1px solid ${theme.colors.line}`, fontWeight: 700 }}>
                    <span>Total</span>
                    <span>{formatMoney(active.total)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 16, background: '#fff', border: `1px solid ${theme.colors.line}`, borderRadius: 10, padding: 14, fontSize: 12.5, lineHeight: 1.7 }}>
                  <h3 style={{ fontSize: 14, color: theme.colors.forest, marginBottom: 6 }}>Shipping address</h3>
                  <div><strong>{active.customerName}</strong>{active.company ? ` · ${active.company}` : ''}</div>
                  <div>{active.addressLine1}{active.addressLine2 ? `, ${active.addressLine2}` : ''}</div>
                  <div>{active.city}, {active.state} {active.pincode} · {active.country}</div>
                  <div>{active.phone} · {active.email}</div>
                  {active.gstin && <div>GSTIN: {active.gstin}</div>}
                  {active.notes && <div style={{ marginTop: 6, fontStyle: 'italic' }}>Notes: {active.notes}</div>}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 17, color: theme.colors.forest, marginBottom: 10 }}>Manage</h3>
                <FormGrid $cols={1}>
                  <Field label="Order status">
                    <Select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                      {ORDER_STATUSES.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Payment status"
                    hint={form.paymentStatus === 'paid' ? 'Confirmed by provider' : undefined}
                  >
                    {form.paymentStatus === 'paid' ? (
                      <Badge $tone="green">Paid — confirmed by provider</Badge>
                    ) : (
                      <Select
                        value={form.paymentStatus}
                        onChange={(event) => setForm((prev) => ({ ...prev, paymentStatus: event.target.value }))}
                      >
                        {PAYMENT_STATUSES.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <Field label="Payment reference">
                    <Input
                      value={form.paymentRef}
                      onChange={(event) => setForm((prev) => ({ ...prev, paymentRef: event.target.value }))}
                      placeholder="UTR, transaction or receipt number"
                    />
                  </Field>
                  <Field label="Internal notes">
                    <Textarea
                      value={form.notes}
                      onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Production, branding or delivery notes"
                    />
                  </Field>
                </FormGrid>
                <div style={{ marginTop: 12, fontSize: 11.5, color: theme.colors.muted, lineHeight: 1.6 }}>
                  Paid status cannot be set manually. Connect a payment provider webhook to confirm
                  online payments automatically.
                </div>
                <div style={{ marginTop: 14, fontSize: 11.5, color: theme.colors.muted }}>
                  Placed {formatDateTime(active.createdAt)}<br />
                  Last updated {formatDateTime(active.updatedAt)}
                </div>

                {(active.events || []).length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h3 style={{ fontSize: 15, color: theme.colors.forest, marginBottom: 8 }}>History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {active.events.map((event) => (
                        <div
                          key={event.id}
                          style={{
                            borderLeft: `3px solid ${theme.colors.line}`,
                            paddingLeft: 10,
                            fontSize: 12,
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{event.message || event.type}</div>
                          <div style={{ color: theme.colors.muted }}>
                            {formatDateTime(event.createdAt)} · {event.actor}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
