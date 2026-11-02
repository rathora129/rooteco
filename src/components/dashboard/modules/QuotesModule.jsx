/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  Field,
  FormGrid,
  Full,
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
import { apiRequest, formatDate, formatDateTime, formatMoney, useDebounced, useList } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

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
    productId: quote.productId || '',
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

  const [active, setActive] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mode, setMode] = useState('view');
  const [edit, setEdit] = useState(null);
  const [convert, setConvert] = useState(null);
  const [converted, setConverted] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function openQuote(quote) {
    setActive(quote);
    setMode('view');
    setEdit(initialEdit(quote));
    setConvert(emptyConvert(quote));
    setConverted(null);
    setFormError('');
    setDetailLoading(true);
    try {
      const response = await apiRequest(`/api/quotes/${quote.id}`);
      setActive(response.data);
      setEdit(initialEdit(response.data));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setActive(null);
    setEdit(null);
    setConvert(null);
    setConverted(null);
    setFormError('');
  }

  async function save() {
    if (!active || !edit) return;
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        status: edit.status,
        amount: edit.amount === '' ? null : Number(edit.amount),
        quantity: edit.quantity === '' ? null : Number(edit.quantity),
        productId: edit.productId || null,
        productName: edit.productName || null,
        followUpDate: edit.followUpDate || null,
        internalNotes: edit.internalNotes || null,
        message: edit.message || null,
      };
      await apiRequest(`/api/quotes/${active.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const detail = await apiRequest(`/api/quotes/${active.id}`);
      setActive(detail.data);
      setEdit(initialEdit(detail.data));
      notify('Quote updated.');
      refresh();
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
          <h1>Quotes</h1>
          <p>
            Work bulk and corporate enquiries from quotation to confirmed order. Record the amount
            you quoted, internal notes, next follow-up and convert won quotes into orders.
          </p>
        </div>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchBox
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="Search name, company, email, phone, product…"
          />
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            style={{ width: 'auto' }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Toolbar>

        {error && <ErrorBlock message={error} onRetry={refresh} />}
        {loading ? (
          <LoadingBlock label="Loading quotes…" />
        ) : data.length === 0 ? (
          <EmptyState
            title="No quotes found"
            text="Requests submitted through the public quote form will appear here."
          />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
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
                    <tr key={quote.id}>
                      <td>
                        <div className="strong">{quote.name}</div>
                        <div className="muted">{quote.company || quote.email}</div>
                      </td>
                      <td>
                        <div className="strong" style={{ fontWeight: 600 }}>
                          {quote.productName || quote.product?.name || 'Custom gifting'}
                        </div>
                        <div className="muted">{quote.budget || quote.message?.slice(0, 48) || '—'}</div>
                      </td>
                      <td>{quote.quantity || '—'}</td>
                      <td className="strong">{quote.amount ? formatMoney(quote.amount) : '—'}</td>
                      <td>
                        <StatusBadge value={quote.status} />
                        {quote.orderId && <div className="muted" style={{ marginTop: 4 }}>Converted</div>}
                      </td>
                      <td className="muted">{quote.followUpDate ? formatDate(quote.followUpDate) : '—'}</td>
                      <td className="muted">{formatDateTime(quote.createdAt)}</td>
                      <td>
                        <div className="actions">
                          <Button
                            type="button"
                            $variant="outline"
                            onClick={() => openQuote(quote)}
                            style={{ padding: '6px 12px' }}
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

      <Modal
        open={Boolean(active)}
        onClose={closeModal}
        title={
          mode === 'convert'
            ? 'Convert quote to order'
            : active
              ? `Quote — ${active.name}`
              : 'Quote'
        }
        wide
        footer={
          mode === 'convert' ? (
            <>
              <Button type="button" $variant="outline" onClick={() => { setMode('view'); setFormError(''); }}>
                Back
              </Button>
              {converted ? (
                <Button type="button" onClick={closeModal}>Done</Button>
              ) : (
                <Button type="button" onClick={convertQuote} disabled={saving}>
                  {saving ? 'Creating order…' : 'Create order'}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button type="button" $variant="outline" onClick={closeModal}>Close</Button>
              <Button type="button" onClick={save} disabled={saving || !edit}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )
        }
      >
        {active && mode === 'view' && edit && (
          <>
            {formError && <ErrorBlock message={formError} />}
            {detailLoading && <LoadingBlock label="Loading quote history…" />}
            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 20 }}>
              <div>
                <div
                  style={{
                    background: '#fff',
                    border: `1px solid ${theme.colors.line}`,
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 12.5,
                    lineHeight: 1.75,
                  }}
                >
                  <h3 style={{ fontSize: 15, color: theme.colors.forest, marginBottom: 6 }}>
                    Requirement
                  </h3>
                  <div>
                    <strong>{active.company || active.name}</strong>
                    {active.company ? ` · ${active.name}` : ''}
                  </div>
                  <div>{active.email}</div>
                  <div>{active.phone}</div>
                  {active.city && <div>Ship to: {active.city}</div>}
                  <div style={{ marginTop: 8 }}>
                    Product: <strong>{active.productName || active.product?.name || 'Custom gifting'}</strong>
                  </div>
                  {active.quantity && <div>Quantity: {active.quantity}</div>}
                  {active.budget && <div>Budget: {active.budget}</div>}
                  {active.branding && <div>Branding: {active.branding}</div>}
                  {active.message && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: theme.colors.muted }}>Message</span>
                      <div style={{ fontStyle: 'italic' }}>{active.message}</div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    background: '#fff',
                    border: `1px solid ${theme.colors.line}`,
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 12.5,
                    lineHeight: 1.8,
                  }}
                >
                  <h3 style={{ fontSize: 15, color: theme.colors.forest, marginBottom: 6 }}>History</h3>
                  {(active.events || []).length > 0 ? (
                    active.events.map((event) => (
                      <div key={event.id} style={{ color: theme.colors.muted }}>
                        {formatDateTime(event.createdAt)} — {event.message || event.type}
                      </div>
                    ))
                  ) : (
                    <>
                      <div style={{ color: theme.colors.muted }}>
                        {formatDateTime(active.createdAt)} — Quote received from the website
                      </div>
                      {active.followUpDate && (
                        <div style={{ color: theme.colors.muted }}>
                          {formatDate(active.followUpDate)} — Follow-up scheduled
                        </div>
                      )}
                      <div style={{ color: theme.colors.muted }}>
                        {formatDateTime(active.updatedAt)} — Last updated
                      </div>
                    </>
                  )}
                  {active.order && (
                    <div style={{ marginTop: 6 }}>
                      Converted to{' '}
                      <Link href="/dashboard/orders" style={{ color: theme.colors.forest, fontWeight: 600 }}>
                        order {active.order.number}
                      </Link>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {active.lead && <Badge $tone="cream">Lead: {active.lead.status}</Badge>}
                  {active.client && <Badge $tone="cream">Client: {active.client.name}</Badge>}
                  {active.order && <Badge $tone="green">Order {active.order.number}</Badge>}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 15, color: theme.colors.forest, marginBottom: 10 }}>
                  Quotation
                </h3>
                <FormGrid $cols={2}>
                  <Field label="Status">
                    <Select
                      value={edit.status}
                      onChange={(event) => setEdit((prev) => ({ ...prev, status: event.target.value }))}
                    >
                      {STATUSES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
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
                  <Full>
                    <Field label="Product / description" hint="Shown on the converted order">
                      <Input
                        value={edit.productName}
                        onChange={(event) => setEdit((prev) => ({ ...prev, productName: event.target.value }))}
                        placeholder="Product or custom gifting brief"
                      />
                    </Field>
                  </Full>
                  <Full>
                    <Field label="Customer message / requirement">
                      <Textarea
                        value={edit.message}
                        onChange={(event) => setEdit((prev) => ({ ...prev, message: event.target.value }))}
                      />
                    </Field>
                  </Full>
                  <Full>
                    <Field label="Internal notes" hint="Only visible to the owner">
                      <Textarea
                        value={edit.internalNotes}
                        onChange={(event) => setEdit((prev) => ({ ...prev, internalNotes: event.target.value }))}
                        placeholder="Negotiation, sampling, approval details"
                      />
                    </Field>
                  </Full>
                </FormGrid>

                {!active.orderId && (
                  <div style={{ marginTop: 14 }}>
                    <Button
                      type="button"
                      onClick={() => {
                        setMode('convert');
                        setFormError('');
                      }}
                      disabled={!edit.amount && !active.product}
                    >
                      Convert to order
                    </Button>
                    {!edit.amount && !active.product && (
                      <div style={{ fontSize: 11.5, color: theme.colors.muted, marginTop: 6 }}>
                        Set a quoted amount (or keep a linked catalogue product) before converting.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {active && mode === 'convert' && convert && (
          <>
            {formError && <ErrorBlock message={formError} />}
            {converted ? (
              <div
                style={{
                  background: '#fff',
                  border: `1px solid ${theme.colors.line}`,
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <Badge $tone="green">Order created</Badge>
                <h3 style={{ color: theme.colors.forest, margin: '12px 0 6px' }}>
                  {converted.number}
                </h3>
                <p style={{ color: theme.colors.muted, fontSize: 13 }}>
                  The quote is marked won and the order is pending payment. Confirm payment from the
                  Orders module once received.
                </p>
                <div style={{ fontWeight: 700, fontSize: 18, marginTop: 8 }}>
                  {formatMoney(converted.total)}
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12.5, color: theme.colors.muted, marginBottom: 14 }}>
                  Create a confirmed order for <strong>{active.name}</strong>. Unit price is derived
                  from the quoted amount divided by the quantity. Payment stays pending until received.
                </p>
                <FormGrid $cols={2}>
                  <Full>
                    <Field label="Address line 1" required>
                      <Input
                        value={convert.addressLine1}
                        onChange={(event) => setConvert((prev) => ({ ...prev, addressLine1: event.target.value }))}
                        placeholder="Building, street, area"
                      />
                    </Field>
                  </Full>
                  <Full>
                    <Field label="Address line 2">
                      <Input
                        value={convert.addressLine2}
                        onChange={(event) => setConvert((prev) => ({ ...prev, addressLine2: event.target.value }))}
                        placeholder="Landmark, floor (optional)"
                      />
                    </Field>
                  </Full>
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
              </>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
