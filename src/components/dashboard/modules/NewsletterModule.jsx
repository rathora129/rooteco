'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Copy,
  Mail,
  MailCheck,
  MailX,
  RefreshCw,
  SearchX,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorBlock,
  IconButton,
  PageHeader,
  Pagination,
  SearchBox,
  Select,
  SkeletonRows,
  Table,
  TableScroll,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, useDebounced, useList } from '@/components/dashboard/hooks';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  @media (max-width: 700px) {
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
    color: ${(p) =>
      p.$tone === 'green'
        ? 'var(--dash-green)'
        : p.$tone === 'red'
          ? 'var(--dash-red)'
          : 'var(--dash-accent)'};
  }
`;

const SelectionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 9px 12px;
  margin-bottom: 10px;
  border: 1px solid var(--dash-line);
  background: var(--dash-panel-2);
  border-radius: 9px;
  font-size: 12px;
  color: var(--dash-muted);
  .count {
    color: var(--dash-ink);
    font-weight: 600;
  }
`;

export default function NewsletterModule() {
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 280);

  const { data, meta, loading, error, refresh } = useList('/api/newsletter', {
    q: debouncedQ,
    page,
    pageSize: 25,
    filters: { state },
  });

  const [selected, setSelected] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    setSelected([]);
  }, [debouncedQ, state, page]);

  const allSelected = data.length > 0 && data.every((item) => selected.includes(item.id));

  function toggleAll() {
    setSelected(allSelected ? [] : data.map((item) => item.id));
  }

  function toggleOne(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function toggleActive(subscriber) {
    setBusyId(subscriber.id);
    try {
      await apiRequest(`/api/newsletter/${subscriber.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !subscriber.active }),
      });
      notify(
        subscriber.active
          ? `${subscriber.email} marked unsubscribed.`
          : `${subscriber.email} resubscribed.`
      );
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function copyEmail(email) {
    try {
      await navigator.clipboard.writeText(email);
      notify('Email copied.');
    } catch {
      notify('Could not copy the email.', 'error');
    }
  }

  async function bulkUnsubscribe() {
    setBulkBusy(true);
    const targets = data.filter((item) => selected.includes(item.id) && item.active);
    try {
      for (const subscriber of targets) {
        await apiRequest(`/api/newsletter/${subscriber.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ active: false }),
        });
      }
      notify(
        targets.length === 1
          ? '1 subscriber marked unsubscribed.'
          : `${targets.length} subscribers marked unsubscribed.`
      );
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
      setSelected([]);
      refresh();
    }
  }

  async function deleteSubscribers(ids) {
    setBulkBusy(true);
    try {
      for (const id of ids) {
        await apiRequest(`/api/newsletter/${id}`, { method: 'DELETE' });
      }
      notify(ids.length === 1 ? 'Subscriber deleted.' : `${ids.length} subscribers deleted.`);
      setConfirm(null);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      refresh();
    } catch (err) {
      notify(err.message, 'error');
      setConfirm(null);
    } finally {
      setBulkBusy(false);
    }
  }

  const summary = useMemo(
    () => ({
      total: meta?.active !== undefined ? meta.active + meta.unsubscribed : 0,
      active: meta?.active ?? 0,
      unsubscribed: meta?.unsubscribed ?? 0,
    }),
    [meta]
  );

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Communication</span>
          <h1>Newsletter</h1>
          <p>
            Everyone who subscribed from the storefront footer or checkout. Subscribers are stored
            once per email; unsubscribing keeps the record so future sign-ups stay suppressed.
          </p>
        </div>
        <div className="actions">
          <Button type="button" $variant="outline" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <div className="label">
            <Users /> Audience
          </div>
          <div className="value">{summary.total}</div>
          <div className="hint">Total captured email addresses</div>
        </StatCard>
        <StatCard $tone="green">
          <div className="label">
            <MailCheck /> Subscribed
          </div>
          <div className="value">{summary.active}</div>
          <div className="hint">Eligible to receive campaigns</div>
        </StatCard>
        <StatCard $tone="red">
          <div className="label">
            <MailX /> Unsubscribed
          </div>
          <div className="value">{summary.unsubscribed}</div>
          <div className="hint">Suppressed from sends</div>
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
            placeholder="Search email address…"
          />
          <Select
            value={state}
            onChange={(event) => {
              setState(event.target.value);
              setPage(1);
            }}
            style={{ width: 170 }}
          >
            <option value="">All subscribers</option>
            <option value="active">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </Select>
          <div className="spacer" />
          <span style={{ fontSize: 11.5, color: 'var(--dash-faint)' }}>
            {meta?.total ?? 0} matching
          </span>
        </Toolbar>

        {selected.length > 0 && (
          <SelectionBar>
            <span>
              <span className="count">{selected.length}</span> selected
            </span>
            <Button
              type="button"
              $variant="outline"
              onClick={bulkUnsubscribe}
              disabled={bulkBusy}
              style={{ padding: '5px 11px', fontSize: 12 }}
            >
              Mark unsubscribed
            </Button>
            <Button
              type="button"
              $variant="ghost"
              onClick={() => setConfirm({ ids: selected.slice() })}
              disabled={bulkBusy}
              style={{ padding: '5px 11px', fontSize: 12, color: 'var(--dash-red)' }}
            >
              Delete
            </Button>
            <Button
              type="button"
              $variant="ghost"
              onClick={() => setSelected([])}
              style={{ padding: '5px 9px', fontSize: 12, marginLeft: 'auto' }}
            >
              Clear
            </Button>
          </SelectionBar>
        )}

        {error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonRows rows={6} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={q || state ? <SearchX size={26} /> : <Mail size={26} />}
            title={q || state ? 'No subscribers match' : 'No subscribers yet'}
            text={
              q || state
                ? 'Try a different email search or state.'
                : 'Subscribers appear here when visitors use the newsletter form on the storefront.'
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
                        onChange={toggleAll}
                        aria-label="Select all subscribers"
                      />
                    </th>
                    <th>Email</th>
                    <th>Source</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(subscriber.id)}
                          onChange={() => toggleOne(subscriber.id)}
                          aria-label={`Select ${subscriber.email}`}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span className="mono" style={{ fontSize: 12.5 }}>
                            {subscriber.email}
                          </span>
                          <IconButton
                            type="button"
                            onClick={() => copyEmail(subscriber.email)}
                            aria-label={`Copy ${subscriber.email}`}
                          >
                            <Copy size={12} />
                          </IconButton>
                        </div>
                      </td>
                      <td>
                        <Badge $tone="neutral">{subscriber.source || 'footer'}</Badge>
                      </td>
                      <td className="muted">{formatDate(subscriber.createdAt)}</td>
                      <td>
                        <Badge $tone={subscriber.active ? 'green' : 'red'}>
                          {subscriber.active ? 'subscribed' : 'unsubscribed'}
                        </Badge>
                      </td>
                      <td>
                        <div className="actions">
                          <Button
                            type="button"
                            $variant="outline"
                            onClick={() => toggleActive(subscriber)}
                            disabled={busyId === subscriber.id}
                            style={{ padding: '5px 11px', fontSize: 12 }}
                          >
                            {busyId === subscriber.id
                              ? 'Saving…'
                              : subscriber.active
                                ? 'Unsubscribe'
                                : 'Resubscribe'}
                          </Button>
                          <IconButton
                            type="button"
                            onClick={() => setConfirm({ ids: [subscriber.id], email: subscriber.email })}
                            aria-label={`Delete ${subscriber.email}`}
                          >
                            <Trash2 size={13} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <Pagination meta={meta} onPage={setPage} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && deleteSubscribers(confirm.ids)}
        busy={bulkBusy}
        title={confirm?.ids.length > 1 ? 'Delete selected subscribers?' : 'Delete this subscriber?'}
        message={
          confirm?.email
            ? `${confirm.email} will be removed permanently.`
            : `${confirm?.ids.length || 0} subscribers will be removed permanently. This cannot be undone.`
        }
        confirmLabel="Delete"
      />
    </>
  );
}
