'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  BadgePercent,
  CalendarClock,
  Check,
  Copy,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
  X,
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
  SearchBox,
  Select,
  SkeletonRows,
  Table,
  TableScroll,
  Toggle,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, formatMoney, useDebounced, useList } from '@/components/dashboard/hooks';

const emptyCoupon = {
  code: '',
  type: 'percent',
  value: '',
  minSubtotal: '',
  active: true,
  expiresAt: '',
};

function dateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function isExpired(coupon) {
  return coupon.expiresAt ? new Date(coupon.expiresAt).getTime() < Date.now() : false;
}

function expiresSoon(coupon) {
  if (!coupon.expiresAt) return false;
  const diff = new Date(coupon.expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
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
    color: ${(p) => (p.$tone === 'red' ? 'var(--dash-red)' : p.$tone === 'green' ? 'var(--dash-green)' : 'var(--dash-accent)')};
  }
`;

const CodeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  .code {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-weight: 650;
    letter-spacing: 0.04em;
    font-size: 12.5px;
    color: var(--dash-ink);
    background: var(--dash-panel-2);
    border: 1px dashed var(--dash-line);
    padding: 3px 8px;
    border-radius: 6px;
  }
`;

export default function CouponsModule() {
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('');
  const debouncedQ = useDebounced(q, 240);

  const { data, loading, error, refresh } = useList('/api/marketing/coupons', {
    pageSize: 100,
    sort: sort || 'createdAt',
    order: sort === 'value' ? 'asc' : 'desc',
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const coupons = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return data
      .filter((coupon) => (term ? coupon.code.toLowerCase().includes(term) : true))
      .filter((coupon) => {
        if (!status) return true;
        if (status === 'active') return coupon.active && !isExpired(coupon);
        if (status === 'inactive') return !coupon.active;
        if (status === 'expired') return isExpired(coupon);
        return true;
      })
      .sort((a, b) => {
        if (sort === 'value') return Number(b.value) - Number(a.value);
        if (sort === 'code') return a.code.localeCompare(b.code);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [data, debouncedQ, status, sort]);

  const summary = useMemo(() => {
    const now = Date.now();
    return {
      total: data.length,
      active: data.filter((coupon) => coupon.active && !isExpired(coupon)).length,
      expired: data.filter((coupon) => isExpired(coupon)).length,
      expiring: data.filter((coupon) => coupon.active && expiresSoon(coupon)).length,
    };
  }, [data]);

  function openCreate() {
    setEditing(null);
    setForm(emptyCoupon);
    setFormError('');
    setCreateOpen(true);
  }

  function openEdit(coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: Number(coupon.value || 0),
      minSubtotal: coupon.minSubtotal === null || coupon.minSubtotal === undefined ? '' : Number(coupon.minSubtotal),
      active: Boolean(coupon.active),
      expiresAt: dateInput(coupon.expiresAt),
    });
    setFormError('');
    setCreateOpen(true);
  }

  async function save() {
    if (form.code.trim().length < 2) {
      setFormError('Enter a coupon code of at least 2 characters.');
      return;
    }
    if (form.value === '' || Number(form.value) <= 0) {
      setFormError(form.type === 'percent' ? 'Enter a percentage greater than 0.' : 'Enter a discount amount greater than 0.');
      return;
    }
    if (form.type === 'percent' && Number(form.value) > 100) {
      setFormError('A percentage discount cannot exceed 100%.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minSubtotal: form.minSubtotal === '' ? null : Number(form.minSubtotal),
        active: Boolean(form.active),
        expiresAt: form.expiresAt || null,
      };
      if (editing) {
        await apiRequest(`/api/marketing/coupons/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        notify(`Coupon ${payload.code.toUpperCase()} updated.`);
      } else {
        await apiRequest('/api/marketing/coupons', { method: 'POST', body: JSON.stringify(payload) });
        notify(`Coupon ${payload.code.toUpperCase()} created.`);
      }
      setCreateOpen(false);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon) {
    setBusyId(coupon.id);
    try {
      await apiRequest(`/api/marketing/coupons/${coupon.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !coupon.active }),
      });
      notify(`${coupon.code} ${coupon.active ? 'paused' : 'activated'}.`);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!deleting) return;
    setSaving(true);
    try {
      await apiRequest(`/api/marketing/coupons/${deleting.id}`, { method: 'DELETE' });
      notify(`Coupon ${deleting.code} deleted.`);
      setDeleting(null);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  }

  async function copy(code) {
    try {
      await navigator.clipboard.writeText(code);
      notify('Coupon code copied.');
    } catch {
      notify('Could not copy the code.', 'error');
    }
  }

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Marketing</span>
          <h1>Coupons &amp; promotions</h1>
          <p>
            Percent or fixed-value codes applied at checkout. Codes are validated on the server
            against the minimum subtotal, expiry and active state.
          </p>
        </div>
        <div className="actions">
          <Button type="button" $variant="outline" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus size={15} /> New coupon
          </Button>
        </div>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <div className="label">
            <Tag /> Total codes
          </div>
          <div className="value">{summary.total}</div>
          <div className="hint">All coupons created</div>
        </StatCard>
        <StatCard $tone="green">
          <div className="label">
            <Check /> Active
          </div>
          <div className="value">{summary.active}</div>
          <div className="hint">Redeemable right now</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <CalendarClock /> Expiring soon
          </div>
          <div className="value">{summary.expiring}</div>
          <div className="hint">Within the next 30 days</div>
        </StatCard>
        <StatCard $tone="red">
          <div className="label">
            <X /> Expired
          </div>
          <div className="value">{summary.expired}</div>
          <div className="hint">No longer redeemable</div>
        </StatCard>
      </StatsGrid>

      <Card>
        <Toolbar>
          <SearchBox value={q} onChange={setQ} placeholder="Search coupon codes…" />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} style={{ width: 150 }}>
            <option value="">All states</option>
            <option value="active">Active</option>
            <option value="inactive">Paused</option>
            <option value="expired">Expired</option>
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value)} style={{ width: 160 }}>
            <option value="">Newest first</option>
            <option value="value">Highest discount</option>
            <option value="code">Code A–Z</option>
          </Select>
          <div className="spacer" />
          <span style={{ fontSize: 11.5, color: 'var(--dash-faint)' }}>{coupons.length} shown</span>
        </Toolbar>

        {error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonRows rows={5} />
        ) : coupons.length === 0 ? (
          <EmptyState
            icon={<BadgePercent size={26} />}
            title={data.length ? 'No coupons match' : 'No coupons yet'}
            text={data.length ? 'Try a different search or state.' : 'Create a percent or fixed-value code for promotions.'}
            action={
              <Button type="button" onClick={openCreate}>
                <Plus size={15} /> New coupon
              </Button>
            }
          />
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Minimum</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon);
                  return (
                    <tr key={coupon.id}>
                      <td>
                        <CodeCell>
                          <span className="code">{coupon.code}</span>
                          <IconButton type="button" onClick={() => copy(coupon.code)} aria-label="Copy code">
                            <Copy size={13} />
                          </IconButton>
                        </CodeCell>
                      </td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {coupon.type === 'percent' ? `${Number(coupon.value)}%` : formatMoney(coupon.value)}
                      </td>
                      <td className="muted">{coupon.minSubtotal ? formatMoney(coupon.minSubtotal) : 'No minimum'}</td>
                      <td>
                        {coupon.expiresAt ? (
                          <span style={{ color: expiresSoon(coupon) ? 'var(--dash-accent)' : undefined }}>
                            {formatDate(coupon.expiresAt)}
                          </span>
                        ) : (
                          <span className="muted">No expiry</span>
                        )}
                      </td>
                      <td>
                        <Badge $tone={expired ? 'red' : coupon.active ? 'green' : 'neutral'}>
                          {expired ? 'expired' : coupon.active ? 'active' : 'paused'}
                        </Badge>
                      </td>
                      <td className="muted">{formatDate(coupon.createdAt)}</td>
                      <td>
                        <div className="actions">
                          <Button
                            type="button"
                            $variant="ghost"
                            onClick={() => toggleActive(coupon)}
                            disabled={busyId === coupon.id || expired}
                            style={{ padding: '5px 9px', fontSize: 12 }}
                          >
                            {coupon.active ? 'Pause' : 'Activate'}
                          </Button>
                          <Button type="button" $variant="outline" onClick={() => openEdit(coupon)} style={{ padding: '5px 11px', fontSize: 12 }}>
                            Edit
                          </Button>
                          <IconButton type="button" onClick={() => setDeleting(coupon)} aria-label={`Delete ${coupon.code}`}>
                            <Trash2 size={13} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </Card>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={520}
        title={editing ? `Edit ${editing.code}` : 'New coupon'}
        subtitle="Discounts apply to the cart subtotal at checkout."
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save coupon' : 'Create coupon'}
            </Button>
          </>
        }
      >
        {formError && <ErrorBlock message={formError} />}
        <FormGrid $cols={2}>
          <Field label="Code" required>
            <Input
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
              placeholder="WELCOME10"
            />
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount</option>
            </Select>
          </Field>
          <Field label={form.type === 'percent' ? 'Percent off' : 'Amount off (₹)'} required>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
            />
          </Field>
          <Field label="Minimum subtotal (₹)">
            <Input
              type="number"
              min="0"
              value={form.minSubtotal}
              onChange={(event) => setForm((prev) => ({ ...prev, minSubtotal: event.target.value }))}
            />
          </Field>
          <Field label="Expires on">
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
            />
          </Field>
          <Field label="Status">
            <Toggle
              checked={Boolean(form.active)}
              onChange={(next) => setForm((prev) => ({ ...prev, active: next }))}
              label="Active"
              hint="Redeemable at checkout"
            />
          </Field>
        </FormGrid>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        busy={saving}
        title="Delete this coupon?"
        message={deleting ? `Code ${deleting.code} will stop working immediately. This cannot be undone.` : ''}
        confirmLabel="Delete coupon"
      />
    </>
  );
}
