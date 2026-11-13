'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Mail,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Trash2,
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

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function initialEdit(quote) {
  return {
    status: quote.status || 'new',
    amount: quote.amount === null || quote.amount === undefined ? '' : Number(quote.amount),
    quantity: quote.quantity ?? '',
    productName: quote.productName || '',
    followUpDate: toDateInput(quote.followUpDate),
    internalNotes: quote.internalNotes || '',
    message: quote.message || '',
  };
}

function emptyConvert(quote) {
  return {
    addressLine1: '',
    addressLine2: '',
    city: quote.city || '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'bank-transfer',
    status: 'confirmed',
  };
}

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function isOverdue(value, status) {
  if (!value || status === 'won' || status === 'lost') return false;
  return new Date(value).getTime() < new Date(new Date().toDateString()).getTime();
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
    font-size: 24px;
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
    color: ${(p) => (p.$tone === 'accent' ? 'var(--dash-accent)' : p.$tone === 'red' ? 'var(--dash-red)' : 'var(--dash-green)')};
  }
`;

const StageChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  button {
    border: 1px solid var(--dash-line);
    background: var(--dash-panel-2);
    color: var(--dash-muted);
    border-radius: 7px;
    font-size: 11.5px;
    font-weight: 600;
    padding: 5px 10px;
    text-transform: capitalize;
    cursor: pointer;
    transition: all 0.14s ease;
  }
  button:hover {
    border-color: rgba(233, 166, 78, 0.4);
    color: var(--dash-ink);
  }
  button[data-active='true'] {
    background: var(--dash-accent-soft);
    border-color: rgba(233, 166, 78, 0.5);
    color: var(--dash-accent);
  }
`;

const QuoteCell = styled.div`
  .name {
    font-weight: 600;
  }
  .sub {
    font-size: 11.5px;
    color: var(--dash-muted);
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
    background: var(--dash-accent);
    margin-top: 6px;
    flex-shrink: 0;
    opacity: 0.7;
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

export default function QuotesModule() {
  const { notify } = useToast();

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 320);

  const { data, meta, loading, error, refresh } = useList('/api/quotes', {
    q: debouncedQ,
    page,
    pageSize: 20,
    filters: { status },
  });

  const [pipeline, setPipeline] = useState(null);
  const loadPipeline = useCallback(async () => {
    try {
      const payload = await getDashboardStats();
      setPipeline(payload.data?.pipeline?.quotes || []);
    } catch {
      setPipeline(null);
    }
  }, []);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  const [selected, setSelected] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [active, setActive] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mode, setMode] = useState('view');
  const [edit, setEdit] = useState(null);
  const [convert, setConvert] = useState(null);
  const [converted, setConverted] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadQuote = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const response = await apiRequest(`/api/quotes/${id}`);
      setActive(response.data);
      setEdit(initialEdit(response.data));
      setConvert(emptyConvert(response.data));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function openQuote(quote) {
    setActiveId(quote.id);
    setActive(quote);
    setMode('view');
    setEdit(initialEdit(quote));
    setConvert(emptyConvert(quote));
    setConverted(null);
    setFormError('');
    loadQuote(quote.id);
  }

  function closeDrawer() {
    setActiveId(null);
    setActive(null);
    setEdit(null);
    setConvert(null);
    setConverted(null);
    setMode('view');
    setFormError('');
    setDeleteOpen(false);
  }

  async function save() {
    if (!active || !edit) return;
    setSaving(true);
    setFormError('');
    try {
      await apiRequest(`/api/quotes/${active.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: edit.status,
          amount: edit.amount === '' ? null : Number(edit.amount),
          quantity: edit.quantity === '' ? null : Number(edit.quantity),
          productName: edit.productName || null,
          followUpDate: edit.followUpDate || null,
          internalNotes: edit.internalNotes || null,
          message: edit.message || null,
        }),
      });
      notify('Quotation updated.');
      refresh();
      loadPipeline();
      loadQuote(active.id);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function convertQuote() {
    if (!active || !convert) return;
    setSaving(true);
    setFormError('');
    try {
      const response = await apiRequest(`/api/quotes/${active.id}/convert`, {
        method: 'POST',
        body: JSON.stringify({
          addressLine1: convert.addressLine1,
          addressLine2: convert.addressLine2 || null,
          city: convert.city,
          state: convert.state,
          pincode: convert.pincode,
          country: convert.country || 'India',
          paymentMethod: convert.paymentMethod,
          status: convert.status,
        }),
      });
      setConverted(response.data);
      notify(`Order ${response.data.number} created from quote.`);
      refresh();
      loadPipeline();
      loadQuote(active.id);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuote() {
    if (!active) return;
    setSaving(true);
    try {
      await apiRequest(`/api/quotes/${active.id}`, { method: 'DELETE' });
      notify('Quotation deleted.');
      setDeleteOpen(false);
      closeDrawer();
      setSelected((prev) => prev.filter((id) => id !== active.id));
      refresh();
      loadPipeline();
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

  async function bulkStage(nextStatus) {
    setBulkBusy(true);
    try {
      await Promise.all(
        selected.map((id) =>
          apiRequest(`/api/quotes/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) })
        )
      );
      notify(`${selected.length} quotation${selected.length === 1 ? '' : 's'} moved to ${nextStatus}.`);
      setSelected([]);
      refresh();
      loadPipeline();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete() {
    setBulkBusy(true);
    try {
      await Promise.all(selected.map((id) => apiRequest(`/api/quotes/${id}`, { method: 'DELETE' })));
      notify(`${selected.length} quotation${selected.length === 1 ? '' : 's'} deleted.`);
      setBulkDeleteOpen(false);
      setSelected([]);
      refresh();
      loadPipeline();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
    }
  }

  const countFor = (stage) => pipeline?.find((row) => row.status === stage)?.count || 0;
  const allSelected = data.length > 0 && data.every((quote) => selected.includes(quote.id));
  const canConvert = active && !active.orderId && (Number(edit?.amount) > 0 || Number(active.quantity) > 0 || active.productId);

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Sales operations</span>
          <h1>Quotations</h1>
          <p>
            Bulk and corporate enquiries from first contact to confirmed order. Record what you
            quoted, keep negotiation notes private and convert won business in one step.
          </p>
        </div>
        <div className="actions">
          <Button as={Link} href="/get-a-quote" $variant="outline" target="_blank" rel="noreferrer">
            <ClipboardList size={14} /> Open quote form
          </Button>
        </div>
      </PageHeader>

      <StatsGrid>
        <StatCard $tone="accent">
          <div className="label">
            <ClipboardList /> New requests
          </div>
          <div className="value">{pipeline ? countFor('new') : '—'}</div>
          <div className="hint">Awaiting first contact</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <Package /> In progress
          </div>
          <div className="value">{pipeline ? countFor('contacted') + countFor('quoted') : '—'}</div>
          <div className="hint">Contacted or quoted</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <CheckCircle2 /> Won
          </div>
          <div className="value">{pipeline ? countFor('won') : '—'}</div>
          <div className="hint">Converted to orders</div>
        </StatCard>
        <StatCard $tone="red">
          <div className="label">
            <Trash2 /> Lost
          </div>
          <div className="value">{pipeline ? countFor('lost') : '—'}</div>
          <div className="hint">Closed without order</div>
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
            placeholder="Search name, company, phone, product…"
          />
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            style={{ width: 160 }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            <Button type="button" $variant="outline" onClick={() => bulkStage('contacted')} disabled={bulkBusy}>
              Mark contacted
            </Button>
            <Button type="button" $variant="outline" onClick={() => bulkStage('lost')} disabled={bulkBusy}>
              Mark lost
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
            icon={<ClipboardList size={26} />}
            title="No quotations found"
            text={
              q || status
                ? 'Try a different search or clear the status filter.'
                : 'Requests submitted through the public quote form appear here automatically.'
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
                        onChange={(event) => setSelected(event.target.checked ? data.map((quote) => quote.id) : [])}
                        aria-label="Select all quotations"
                      />
                    </th>
                    <th>Quote</th>
                    <th>Requirement</th>
                    <th>Qty</th>
                    <th>Quoted</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th>Received</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((quote) => (
                    <tr key={quote.id} className={selected.includes(quote.id) ? 'selected' : undefined}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(quote.id)}
                          onChange={() => toggleSelected(quote.id)}
                          aria-label={`Select quote from ${quote.name}`}
                        />
                      </td>
                      <td>
                        <QuoteCell>
                          <div className="name">{quote.name}</div>
                          <div className="sub">{quote.company || quote.email}</div>
                        </QuoteCell>
                      </td>
                      <td>
                        <div>{quote.productName || quote.product?.name || 'Custom gifting'}</div>
                        <div className="muted">{quote.budget || quote.message?.slice(0, 44) || '—'}</div>
                      </td>
                      <td className="mono">{quote.quantity || '—'}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {quote.amount ? formatMoney(quote.amount) : '—'}
                      </td>
                      <td>
                        <StatusBadge value={quote.status} />
                        {quote.order ? (
                          <div className="muted" style={{ marginTop: 4 }}>
                            Order {quote.order.number}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        {quote.followUpDate ? (
                          <span style={{ color: isOverdue(quote.followUpDate, quote.status) ? 'var(--dash-red)' : undefined }}>
                            {formatDate(quote.followUpDate)}
                          </span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="muted">{formatDate(quote.createdAt)}</td>
                      <td>
                        <div className="actions">
                          {digits(quote.phone) ? (
                            <IconButton
                              as="a"
                              href={`https://wa.me/${digits(quote.phone)}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`WhatsApp ${quote.name}`}
                            >
                              <MessageCircle size={14} />
                            </IconButton>
                          ) : null}
                          <Button
                            type="button"
                            $variant="outline"
                            onClick={() => openQuote(quote)}
                            style={{ padding: '5px 11px', fontSize: 12 }}
                          >
                            Open
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
        width={640}
        title={
          mode === 'convert'
            ? 'Convert to order'
            : active
              ? `Quotation — ${active.name}`
              : 'Quotation'
        }
        subtitle={
          active ? [active.company, active.email].filter(Boolean).join(' · ') || active.phone : 'Loading…'
        }
        footer={
          mode === 'convert' ? (
            <>
              <Button
                type="button"
                $variant="outline"
                onClick={() => {
                  setMode('view');
                  setFormError('');
                }}
              >
                Back
              </Button>
              {converted ? (
                <Button as={Link} href="/dashboard/orders" onClick={closeDrawer}>
                  View orders
                </Button>
              ) : (
                <Button type="button" onClick={convertQuote} disabled={saving}>
                  {saving ? 'Creating order…' : 'Create order'}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" $variant="danger" onClick={() => setDeleteOpen(true)} disabled={saving || detailLoading}>
                <Trash2 size={14} /> Delete
              </Button>
              <Button type="button" $variant="outline" onClick={closeDrawer} disabled={saving}>
                Close
              </Button>
              <Button type="button" onClick={save} disabled={saving || !edit}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )
        }
      >
        {formError && <ErrorBlock message={formError} />}
        {active && mode === 'view' && edit && (
          <>
            {detailLoading && <SkeletonRows rows={3} />}
            <DetailSection title="Requirement">
              <DetailList>
                <DetailRow label="Contact">{active.name}</DetailRow>
                <DetailRow label="Company">{active.company || '—'}</DetailRow>
                <DetailRow label="Email">{active.email || '—'}</DetailRow>
                <DetailRow label="Phone">{active.phone}</DetailRow>
                <DetailRow label="City">{active.city || '—'}</DetailRow>
                <DetailRow label="Product">
                  {active.productName || active.product?.name || 'Custom gifting'}
                </DetailRow>
                <DetailRow label="Quantity">{active.quantity || '—'}</DetailRow>
                <DetailRow label="Budget">{active.budget || '—'}</DetailRow>
                <DetailRow label="Branding">{active.branding || '—'}</DetailRow>
              </DetailList>
              {active.message && (
                <p style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.7, color: 'var(--dash-muted)' }}>
                  “{active.message}”
                </p>
              )}
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
                {active.lead && (
                  <Link href="/dashboard/leads">
                    <ClipboardList /> Lead: {active.lead.status}
                  </Link>
                )}
                {active.client && (
                  <Link href={`/dashboard/clients/${active.client.id}`}>
                    <ArrowRight /> Customer
                  </Link>
                )}
              </ActionsRow>
            </DetailSection>

            <DetailSection title="Pipeline stage">
              <StageChips>
                {STATUSES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-active={edit.status === option.value}
                    onClick={() => setEdit((prev) => ({ ...prev, status: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </StageChips>
            </DetailSection>

            <DetailSection title="Quotation">
              <FormGrid $cols={2}>
                <Field label="Quoted amount (₹)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={edit.amount}
                    onChange={(event) => setEdit((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Quantity">
                  <Input
                    type="number"
                    min="1"
                    value={edit.quantity}
                    onChange={(event) => setEdit((prev) => ({ ...prev, quantity: event.target.value }))}
                  />
                </Field>
                <Field label="Follow-up date">
                  <Input
                    type="date"
                    value={edit.followUpDate}
                    onChange={(event) => setEdit((prev) => ({ ...prev, followUpDate: event.target.value }))}
                  />
                </Field>
                <Field label="Product / description" hint="Used on the order">
                  <Input
                    value={edit.productName}
                    onChange={(event) => setEdit((prev) => ({ ...prev, productName: event.target.value }))}
                    placeholder="Product or custom gifting brief"
                  />
                </Field>
                <Field label="Customer message" full>
                  <Textarea
                    value={edit.message}
                    onChange={(event) => setEdit((prev) => ({ ...prev, message: event.target.value }))}
                  />
                </Field>
                <Field label="Internal notes" hint="Only visible to you" full>
                  <Textarea
                    value={edit.internalNotes}
                    onChange={(event) => setEdit((prev) => ({ ...prev, internalNotes: event.target.value }))}
                    placeholder="Negotiation, sampling, approval details"
                  />
                </Field>
              </FormGrid>

              {!active.orderId && (
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    onClick={() => {
                      setMode('convert');
                      setFormError('');
                    }}
                    disabled={!canConvert}
                  >
                    <ArrowRight size={14} /> Convert to order
                  </Button>
                  {!canConvert && (
                    <span style={{ fontSize: 11.5, color: 'var(--dash-muted)' }}>
                      Add a quantity and quoted amount first.
                    </span>
                  )}
                </div>
              )}
            </DetailSection>

            <DetailSection title="History">
              {(active.events || []).length > 0 ? (
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
              ) : (
                <HistoryItem>
                  <span className="dot" />
                  <span>
                    <div className="msg">Quote received from the website</div>
                    <div className="when">{formatDateTime(active.createdAt)}</div>
                  </span>
                </HistoryItem>
              )}
              {active.order && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge $tone="green">
                    <CheckCircle2 size={11} /> Order {active.order.number}
                  </Badge>
                  <Link
                    href="/dashboard/orders"
                    style={{ fontSize: 12, color: 'var(--dash-accent)', fontWeight: 600 }}
                  >
                    Manage order →
                  </Link>
                </div>
              )}
            </DetailSection>
          </>
        )}

        {active && mode === 'convert' && convert && (
          <>
            {converted ? (
              <div
                style={{
                  border: '1px solid rgba(139, 189, 112, 0.3)',
                  background: 'var(--dash-green-soft)',
                  borderRadius: 12,
                  padding: 22,
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={28} style={{ color: 'var(--dash-green)', marginBottom: 8 }} />
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>Order {converted.number} created</h3>
                <p style={{ fontSize: 12.5, color: 'var(--dash-muted)', maxWidth: 380, margin: '0 auto' }}>
                  The quotation is marked won and the order is pending payment. Confirm payment
                  from the Orders module once received.
                </p>
                <div style={{ fontWeight: 700, fontSize: 22, marginTop: 12, fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(converted.total)}
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12.5, color: 'var(--dash-muted)', marginBottom: 16, lineHeight: 1.65 }}>
                  Create a confirmed order for <strong style={{ color: 'var(--dash-ink)' }}>{active.name}</strong>.
                  The unit price is derived from the quoted amount divided by quantity. Payment stays
                  pending until received. Delivery address is required.
                </p>
                <FormGrid $cols={2}>
                  <Field label="Address line 1" required full>
                    <Input
                      value={convert.addressLine1}
                      onChange={(event) => setConvert((prev) => ({ ...prev, addressLine1: event.target.value }))}
                      placeholder="Building, street, area"
                    />
                  </Field>
                  <Field label="Address line 2" full>
                    <Input
                      value={convert.addressLine2}
                      onChange={(event) => setConvert((prev) => ({ ...prev, addressLine2: event.target.value }))}
                      placeholder="Landmark, floor (optional)"
                    />
                  </Field>
                  <Field label="City" required>
                    <Input
                      value={convert.city}
                      onChange={(event) => setConvert((prev) => ({ ...prev, city: event.target.value }))}
                    />
                  </Field>
                  <Field label="State" required>
                    <Input
                      value={convert.state}
                      onChange={(event) => setConvert((prev) => ({ ...prev, state: event.target.value }))}
                    />
                  </Field>
                  <Field label="Pincode" required>
                    <Input
                      value={convert.pincode}
                      onChange={(event) => setConvert((prev) => ({ ...prev, pincode: event.target.value }))}
                    />
                  </Field>
                  <Field label="Country">
                    <Input
                      value={convert.country}
                      onChange={(event) => setConvert((prev) => ({ ...prev, country: event.target.value }))}
                    />
                  </Field>
                  <Field label="Payment method">
                    <Select
                      value={convert.paymentMethod}
                      onChange={(event) => setConvert((prev) => ({ ...prev, paymentMethod: event.target.value }))}
                    >
                      <option value="bank-transfer">Bank transfer / proforma invoice</option>
                      <option value="cod">Cash on delivery</option>
                    </Select>
                  </Field>
                  <Field label="Initial order status">
                    <Select
                      value={convert.status}
                      onChange={(event) => setConvert((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                    </Select>
                  </Field>
                </FormGrid>
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--dash-muted)' }}>
                  <CalendarClock size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} />
                  Quote total: <strong style={{ color: 'var(--dash-ink)' }}>{edit?.amount ? formatMoney(edit.amount) : 'From linked product price'}</strong>
                  {' · '}Quantity: {active.quantity || 1}
                </div>
              </>
            )}
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteQuote}
        busy={saving}
        title="Delete this quotation?"
        message={active ? `The quote request from “${active.name}” will be permanently deleted.` : ''}
        confirmLabel="Delete quotation"
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={bulkDelete}
        busy={bulkBusy}
        title={`Delete ${selected.length} quotation${selected.length === 1 ? '' : 's'}?`}
        message="Selected quotations and their history will be permanently deleted."
        confirmLabel="Delete selected"
      />
    </>
  );
}
