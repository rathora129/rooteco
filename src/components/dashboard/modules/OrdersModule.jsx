/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  Banknote,
  ClipboardCheck,
  Mail,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorBlock,
  Field,
  FormGrid,
  IconButton,
  Input,
  PageHeader,
  Pagination,
  SearchBox,
  Select,
  SkeletonRows,
  StatusBadge,
  Table,
  TableScroll,
  Textarea,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { DetailList, DetailRow, DetailSection } from '@/components/dashboard/Workspace';
import {
  apiRequest,
  formatDate,
  formatDateTime,
  formatMoney,
  getDashboardStats,
  useDebounced,
  useList,
} from '@/components/dashboard/hooks';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'authorized', 'failed', 'refunded'];

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

const StatsGrid = styled.div`
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
    font-size: 22px;
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
    color: ${(p) => (p.$tone === 'accent' ? 'var(--dash-accent)' : p.$tone === 'green' ? 'var(--dash-green)' : 'var(--dash-blue)')};
  }
`;

const OrderCell = styled.div`
  .number {
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    color: var(--dash-ink);
  }
  .sub {
    font-size: 11.5px;
    color: var(--dash-muted);
    text-transform: capitalize;
  }
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--dash-line-soft);
  &:last-child {
    border-bottom: 0;
  }
  .thumb {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    object-fit: cover;
    background: var(--dash-panel-2);
    border: 1px solid var(--dash-line);
    flex-shrink: 0;
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 12.5px;
    font-weight: 600;
  }
  .meta {
    font-size: 11.5px;
    color: var(--dash-muted);
  }
  .amount {
    font-size: 12.5px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
`;

const Totals = styled.div`
  margin-top: 12px;
  border: 1px solid var(--dash-line);
  border-radius: 9px;
  padding: 12px 14px;
  background: var(--dash-panel-2);
  font-size: 12.5px;
  .row {
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
    color: var(--dash-muted);
  }
  .row.total {
    border-top: 1px solid var(--dash-line);
    margin-top: 6px;
    padding-top: 9px;
    color: var(--dash-ink);
    font-weight: 650;
    font-size: 14px;
  }
`;

const HistoryItem = styled.div`
  display: flex;
  gap: 10px;
  font-size: 12px;
  padding: 7px 0;
  border-bottom: 1px solid var(--dash-line-soft);
  &:last-child {
    border-bottom: 0;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--dash-blue);
    margin-top: 6px;
    flex-shrink: 0;
    opacity: 0.75;
  }
  .msg {
    color: var(--dash-ink);
  }
  .when {
    color: var(--dash-faint);
    font-size: 11px;
    margin-top: 2px;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--dash-ink);
    border: 1px solid var(--dash-line);
    border-radius: 7px;
    padding: 6px 10px;
  }
  a:hover {
    border-color: rgba(233, 166, 78, 0.45);
  }
  svg {
    width: 13px;
    height: 13px;
    color: var(--dash-muted);
  }
`;

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid rgba(233, 166, 78, 0.28);
  background: var(--dash-accent-soft);
  font-size: 12px;
  flex-wrap: wrap;
  b {
    color: var(--dash-accent);
  }
  .spacer {
    flex: 1;
  }
`;

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

  const [summary, setSummary] = useState(null);
  const loadSummary = useCallback(async () => {
    try {
      const payload = await getDashboardStats();
      setSummary(payload.data);
    } catch {
      setSummary(null);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const [selected, setSelected] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [activeId, setActiveId] = useState(null);
  const [active, setActive] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ status: 'pending', paymentStatus: 'pending', paymentRef: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadOrder = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const response = await apiRequest(`/api/orders/${id}`);
      setActive(response.data);
      setForm({
        status: response.data.status || 'pending',
        paymentStatus: response.data.paymentStatus || 'pending',
        paymentRef: response.data.paymentRef || '',
        notes: response.data.notes || '',
      });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function openOrder(order) {
    setActiveId(order.id);
    setActive(order);
    setForm({
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      paymentRef: order.paymentRef || '',
      notes: order.notes || '',
    });
    setFormError('');
    loadOrder(order.id);
  }

  function closeDrawer() {
    setActiveId(null);
    setActive(null);
    setFormError('');
    setDeleteOpen(false);
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    setFormError('');
    try {
      const payload = { status: form.status, notes: form.notes || undefined };
      if (form.paymentStatus !== 'paid') payload.paymentStatus = form.paymentStatus;
      if (form.paymentRef) payload.paymentRef = form.paymentRef;
      await apiRequest(`/api/orders/${active.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      notify('Order updated.');
      refresh();
      loadSummary();
      loadOrder(active.id);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrder() {
    if (!active) return;
    setSaving(true);
    try {
      await apiRequest(`/api/orders/${active.id}`, { method: 'DELETE' });
      notify('Order deleted.');
      setDeleteOpen(false);
      closeDrawer();
      setSelected((prev) => prev.filter((id) => id !== active.id));
      refresh();
      loadSummary();
    } catch (err) {
      setFormError(err.message);
      setDeleteOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function toggleSelected(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function bulkStatus(nextStatus) {
    setBulkBusy(true);
    try {
      await Promise.all(
        selected.map((id) =>
          apiRequest(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) })
        )
      );
      notify(`${selected.length} order${selected.length === 1 ? '' : 's'} moved to ${nextStatus}.`);
      setSelected([]);
      refresh();
      loadSummary();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete() {
    setBulkBusy(true);
    try {
      await Promise.all(selected.map((id) => apiRequest(`/api/orders/${id}`, { method: 'DELETE' })));
      notify(`${selected.length} order${selected.length === 1 ? '' : 's'} deleted.`);
      setBulkDeleteOpen(false);
      setSelected([]);
      refresh();
      loadSummary();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
    }
  }

  const counts = summary?.counts || {};
  const values = summary?.value || {};
  const allSelected = data.length > 0 && data.every((order) => selected.includes(order.id));

  const itemCount = useMemo(
    () => (order) => (order.items || []).reduce((sum, item) => sum + item.qty, 0),
    []
  );

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Sales operations</span>
          <h1>Orders</h1>
          <p>
            Fulfil incoming orders, confirm payments and follow each order from production to
            delivery. Paid status is only set by a verified payment provider.
          </p>
        </div>
        <div className="actions">
          <Button as={Link} href="/dashboard/quotes" $variant="outline">
            <ClipboardCheck size={14} /> Convert a quote
          </Button>
        </div>
      </PageHeader>

      <StatsGrid>
        <StatCard $tone="green">
          <div className="label">
            <Banknote /> Paid revenue
          </div>
          <div className="value">{values.paidValue !== undefined ? formatMoney(values.paidValue) : '—'}</div>
          <div className="hint">Confirmed payments only</div>
        </StatCard>
        <StatCard $tone="accent">
          <div className="label">
            <ShoppingBag /> Order value
          </div>
          <div className="value">{values.orderValue !== undefined ? formatMoney(values.orderValue) : '—'}</div>
          <div className="hint">All non-cancelled orders</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <Package /> Pending
          </div>
          <div className="value">{counts.pendingOrders ?? '—'}</div>
          <div className="hint">Awaiting confirmation</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <Truck /> Total orders
          </div>
          <div className="value">{counts.orders ?? '—'}</div>
          <div className="hint">Every order received</div>
        </StatCard>
      </StatsGrid>

      <Card>
        <Toolbar>
          <SearchBox
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="Search order number, customer, email…"
          />
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            style={{ width: 160 }}
          >
            <option value="">All order statuses</option>
            {ORDER_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value);
              setPage(1);
            }}
            style={{ width: 170 }}
          >
            <option value="">All payment statuses</option>
            {['pending', 'authorized', 'paid', 'failed', 'refunded'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <div className="spacer" />
          <IconButton type="button" onClick={refresh} aria-label="Refresh">
            <RefreshCw size={15} />
          </IconButton>
        </Toolbar>

        {selected.length > 0 && (
          <BulkBar>
            <b>{selected.length}</b> selected
            <div className="spacer" />
            <Button type="button" $variant="outline" onClick={() => bulkStatus('confirmed')} disabled={bulkBusy}>
              Confirm
            </Button>
            <Button type="button" $variant="outline" onClick={() => bulkStatus('shipped')} disabled={bulkBusy}>
              Mark shipped
            </Button>
            <Button type="button" $variant="danger" onClick={() => setBulkDeleteOpen(true)} disabled={bulkBusy}>
              <Trash2 size={13} /> Delete
            </Button>
            <Button type="button" $variant="ghost" onClick={() => setSelected([])} disabled={bulkBusy}>
              Clear
            </Button>
          </BulkBar>
        )}

        {error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonRows rows={6} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={26} />}
            title="No orders found"
            text={
              q || status || paymentStatus
                ? 'Try a different search or clear the filters.'
                : 'Storefront orders appear here as soon as a customer checks out.'
            }
          />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(event) => setSelected(event.target.checked ? data.map((order) => order.id) : [])}
                        aria-label="Select all orders"
                      />
                    </th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Placed</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((order) => (
                    <tr key={order.id} className={selected.includes(order.id) ? 'selected' : undefined}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(order.id)}
                          onChange={() => toggleSelected(order.id)}
                          aria-label={`Select order ${order.number}`}
                        />
                      </td>
                      <td>
                        <OrderCell>
                          <div className="number">{order.number}</div>
                          <div className="sub">{String(order.paymentMethod || '—').replace(/-/g, ' ')}</div>
                        </OrderCell>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                        <div className="muted">{order.email}</div>
                      </td>
                      <td className="mono">{itemCount(order)}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {formatMoney(order.total)}
                      </td>
                      <td>
                        <StatusBadge value={order.status} />
                      </td>
                      <td>
                        <StatusBadge value={order.paymentStatus} />
                      </td>
                      <td className="muted">{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="actions">
                          {digits(order.phone) ? (
                            <IconButton
                              as="a"
                              href={`https://wa.me/${digits(order.phone)}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`WhatsApp ${order.customerName}`}
                            >
                              <MessageCircle size={14} />
                            </IconButton>
                          ) : null}
                          <Button
                            type="button"
                            $variant="outline"
                            onClick={() => openOrder(order)}
                            style={{ padding: '5px 11px', fontSize: 12 }}
                          >
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

      <Drawer
        open={Boolean(activeId)}
        onClose={closeDrawer}
        width={660}
        title={active ? `Order ${active.number}` : 'Order'}
        subtitle={
          active
            ? `${active.customerName} · ${formatDateTime(active.createdAt)}`
            : 'Loading order…'
        }
        footer={
          <>
            <Button type="button" $variant="danger" onClick={() => setDeleteOpen(true)} disabled={saving || detailLoading}>
              <Trash2 size={14} /> Delete
            </Button>
            <Button type="button" $variant="outline" onClick={closeDrawer} disabled={saving}>
              Close
            </Button>
            <Button type="button" onClick={save} disabled={saving || detailLoading}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        {formError && <ErrorBlock message={formError} />}
        {detailLoading && !active?.events ? (
          <SkeletonRows rows={5} />
        ) : active ? (
          <>
            <DetailSection title={`Items (${itemCount(active)})`}>
              {(active.items || []).map((item) => (
                <ItemRow key={item.id}>
                  {item.image ? (
                    <img className="thumb" src={item.image} alt="" />
                  ) : (
                    <span className="thumb" />
                  )}
                  <div className="info">
                    <div className="name">{item.name}</div>
                    <div className="meta">
                      Qty {item.qty}
                      {item.color ? ` · ${item.color}` : ''}
                      {item.variant ? ` · ${item.variant}` : ''}
                    </div>
                  </div>
                  <div className="amount">{formatMoney(Number(item.price) * item.qty)}</div>
                </ItemRow>
              ))}
              <Totals>
                <div className="row">
                  <span>Subtotal</span>
                  <span>{formatMoney(active.subtotal)}</span>
                </div>
                {Number(active.discount) > 0 && (
                  <div className="row">
                    <span>Discount</span>
                    <span>−{formatMoney(active.discount)}</span>
                  </div>
                )}
                <div className="row">
                  <span>Shipping</span>
                  <span>{formatMoney(active.shipping)}</span>
                </div>
                <div className="row total">
                  <span>Total</span>
                  <span>{formatMoney(active.total)}</span>
                </div>
              </Totals>
            </DetailSection>

            <DetailSection title="Customer & shipping">
              <DetailList>
                <DetailRow label="Name">{active.customerName}</DetailRow>
                <DetailRow label="Company">{active.company || '—'}</DetailRow>
                <DetailRow label="Phone">{active.phone}</DetailRow>
                <DetailRow label="Email">{active.email}</DetailRow>
                <DetailRow label="Address">
                  {active.addressLine1}
                  {active.addressLine2 ? `, ${active.addressLine2}` : ''}
                  <br />
                  {active.city}, {active.state} {active.pincode}
                  <br />
                  {active.country}
                </DetailRow>
                {active.gstin && <DetailRow label="GSTIN">{active.gstin}</DetailRow>}
                <DetailRow label="Payment method">{String(active.paymentMethod || '—').replace(/-/g, ' ')}</DetailRow>
              </DetailList>
              <ActionsRow style={{ marginTop: 12 }}>
                {digits(active.phone) && (
                  <>
                    <a href={`tel:${digits(active.phone)}`}>
                      <Phone /> Call
                    </a>
                    <a href={`https://wa.me/${digits(active.phone)}`} target="_blank" rel="noreferrer">
                      <MessageCircle /> WhatsApp
                    </a>
                  </>
                )}
                <a href={`mailto:${active.email}`}>
                  <Mail /> Email
                </a>
              </ActionsRow>
            </DetailSection>

            <DetailSection title="Fulfilment">
              <FormGrid $cols={2}>
                <Field label="Order status">
                  <Select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                    {ORDER_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Payment status" hint={form.paymentStatus === 'paid' ? 'Confirmed by provider' : undefined}>
                  {form.paymentStatus === 'paid' ? (
                    <Badge $tone="green">Paid — confirmed by provider</Badge>
                  ) : (
                    <Select
                      value={form.paymentStatus}
                      onChange={(event) => setForm((prev) => ({ ...prev, paymentStatus: event.target.value }))}
                    >
                      {PAYMENT_STATUSES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Payment reference" full>
                  <Input
                    value={form.paymentRef}
                    onChange={(event) => setForm((prev) => ({ ...prev, paymentRef: event.target.value }))}
                    placeholder="UTR, transaction or receipt number"
                  />
                </Field>
                <Field label="Internal notes" full>
                  <Textarea
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Production, branding or delivery notes"
                  />
                </Field>
              </FormGrid>
              {form.paymentStatus !== 'paid' && (
                <p style={{ marginTop: 10, fontSize: 11.5, color: 'var(--dash-muted)', lineHeight: 1.6 }}>
                  Paid status is set automatically by a verified payment provider — it cannot be
                  marked manually.
                </p>
              )}
            </DetailSection>

            <DetailSection title="History">
              {(active.events || []).length === 0 ? (
                <HistoryItem>
                  <span className="dot" />
                  <span>
                    <div className="msg">Order placed</div>
                    <div className="when">{formatDateTime(active.createdAt)}</div>
                  </span>
                </HistoryItem>
              ) : (
                active.events.map((event) => (
                  <HistoryItem key={event.id}>
                    <span className="dot" />
                    <span>
                      <div className="msg">{event.message || event.type}</div>
                      <div className="when">
                        {formatDateTime(event.createdAt)} · {event.actor || 'system'}
                      </div>
                    </span>
                  </HistoryItem>
                ))
              )}
            </DetailSection>
          </>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteOrder}
        busy={saving}
        title="Delete this order?"
        message={active ? `Order ${active.number} will be permanently deleted. This cannot be undone.` : ''}
        confirmLabel="Delete order"
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={bulkDelete}
        busy={bulkBusy}
        title={`Delete ${selected.length} order${selected.length === 1 ? '' : 's'}?`}
        message="Selected orders and their history will be permanently deleted."
        confirmLabel="Delete selected"
      />
    </>
  );
}
