'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  SearchX,
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
  Input,
  PageHeader,
  Pagination,
  SearchBox,
  Select,
  SkeletonRows,
  Table,
  TableScroll,
  Textarea,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import {
  apiRequest,
  buildQuery,
  formatDateTime,
  useDebounced,
  useList,
} from '@/components/dashboard/hooks';

const ENQUIRY_SOURCES = 'contact-form,quote-form';

const STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
];

const SOURCE_LABELS = {
  'contact-form': 'Contact form',
  'quote-form': 'Quote request',
};

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
    color: ${(p) =>
      p.$tone === 'green'
        ? 'var(--dash-green)'
        : p.$tone === 'red'
          ? 'var(--dash-red)'
          : p.$tone === 'blue'
            ? 'var(--dash-blue)'
            : 'var(--dash-accent)'};
  }
`;

const StageRow = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  button {
    padding: 5px 11px;
    border-radius: 7px;
    border: 1px solid var(--dash-line);
    background: transparent;
    color: var(--dash-muted);
    font-size: 11.5px;
    font-weight: 550;
    transition: all 0.14s ease;
    &:hover { color: var(--dash-ink); border-color: var(--dash-muted); }
    &.active {
      background: var(--dash-accent-soft);
      border-color: rgba(233, 166, 78, 0.4);
      color: var(--dash-accent);
      font-weight: 650;
    }
  }
`;

const ContactLine = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--dash-muted);
  svg { width: 12px; height: 12px; color: var(--dash-faint); }
`;

function digits(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function tone(status) {
  if (status === 'won') return 'green';
  if (status === 'lost') return 'red';
  if (status === 'new') return 'gold';
  if (status === 'contacted' || status === 'qualified' || status === 'proposal') return 'blue';
  return 'neutral';
}

export default function EnquiriesModule() {
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 280);

  const sourceFilter = source || ENQUIRY_SOURCES;

  const { data, meta, loading, error, refresh } = useList('/api/leads', {
    q: debouncedQ,
    page,
    pageSize: 20,
    filters: { status, source: sourceFilter },
  });

  const counts = {
    all: useList('/api/leads', { pageSize: 1, filters: { source: ENQUIRY_SOURCES } }),
    new: useList('/api/leads', { pageSize: 1, filters: { source: ENQUIRY_SOURCES, status: 'new' } }),
    contacted: useList('/api/leads', { pageSize: 1, filters: { source: ENQUIRY_SOURCES, status: 'contacted' } }),
    won: useList('/api/leads', { pageSize: 1, filters: { source: ENQUIRY_SOURCES, status: 'won' } }),
  };

  function refreshAll() {
    refresh();
    Object.values(counts).forEach((entry) => entry.refresh());
  }

  const [active, setActive] = useState(null);
  const [edit, setEdit] = useState({ notes: '', followUpDate: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!active) return;
    setEdit({
      notes: active.notes || '',
      followUpDate: active.followUpDate ? new Date(active.followUpDate).toISOString().slice(0, 10) : '',
    });
    setFormError('');
  }, [active]);

  async function updateLead(payload, message) {
    if (!active) return;
    setSaving(true);
    setFormError('');
    try {
      const response = await apiRequest(`/api/leads/${active.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setActive(response.data);
      notify(message);
      refreshAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function setStage(next) {
    if (next === active.status) return;
    updateLead({ status: next }, `Enquiry marked ${next}.`);
  }

  async function saveDetails() {
    await updateLead(
      {
        notes: edit.notes,
        followUpDate: edit.followUpDate || null,
      },
      'Enquiry updated.'
    );
  }

  async function remove() {
    if (!active) return;
    setSaving(true);
    try {
      await apiRequest(`/api/leads/${active.id}`, { method: 'DELETE' });
      notify('Enquiry deleted.');
      setDeleting(false);
      setActive(null);
      refreshAll();
    } catch (err) {
      notify(err.message, 'error');
      setDeleting(false);
    } finally {
      setSaving(false);
    }
  }

  const csvHref = useMemo(
    () =>
      `/api/leads/export${buildQuery({
        source: sourceFilter,
        status,
        q: debouncedQ,
      })}`,
    [sourceFilter, status, debouncedQ]
  );

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Communication</span>
          <h1>Enquiries</h1>
          <p>
            Messages submitted through the public contact form and quote request form. Every
            submission also creates a lead, so replies and follow-ups stay in one place.
          </p>
        </div>
        <div className="actions">
          <Button as="a" href={csvHref} $variant="outline">
            Export CSV
          </Button>
          <Button type="button" $variant="outline" onClick={refreshAll}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <div className="label">
            <Inbox /> All enquiries
          </div>
          <div className="value">{counts.all.meta?.total ?? '—'}</div>
          <div className="hint">Contact and quote forms</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <Inbox /> New
          </div>
          <div className="value">{counts.new.meta?.total ?? '—'}</div>
          <div className="hint">Not yet contacted</div>
        </StatCard>
        <StatCard $tone="blue">
          <div className="label">
            <Phone /> Contacted
          </div>
          <div className="value">{counts.contacted.meta?.total ?? '—'}</div>
          <div className="hint">Awaiting qualification</div>
        </StatCard>
        <StatCard $tone="green">
          <div className="label">
            <CheckCircle2 /> Won
          </div>
          <div className="value">{counts.won.meta?.total ?? '—'}</div>
          <div className="hint">Converted enquiries</div>
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
            placeholder="Search name, email, phone or requirement…"
          />
          <Select
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPage(1);
            }}
            style={{ width: 170 }}
          >
            <option value="">All channels</option>
            <option value="contact-form">Contact form</option>
            <option value="quote-form">Quote request</option>
          </Select>
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          >
            <option value="">All statuses</option>
            {STAGES.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.label}
              </option>
            ))}
          </Select>
          <div className="spacer" />
          <span style={{ fontSize: 11.5, color: 'var(--dash-faint)' }}>
            {meta?.total ?? 0} matching
          </span>
        </Toolbar>

        {error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonRows rows={6} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={q || status || source ? <SearchX size={26} /> : <Inbox size={26} />}
            title={q || status || source ? 'No enquiries match' : 'No enquiries yet'}
            text={
              q || status || source
                ? 'Try a different search, channel or status.'
                : 'Submissions from the contact form and quote requests appear here.'
            }
          />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Channel</th>
                    <th>Requirement</th>
                    <th>Received</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 7,
                              display: 'grid',
                              placeItems: 'center',
                              background: 'var(--dash-panel-2)',
                              border: '1px solid var(--dash-line)',
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: 'var(--dash-accent)',
                              flexShrink: 0,
                            }}
                          >
                            {initials(lead.name)}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div className="strong" style={{ fontSize: 12.5 }}>
                              {lead.name}
                              {lead.company ? <span className="muted"> · {lead.company}</span> : null}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--dash-faint)' }}>
                              {lead.email || lead.phone || 'No contact details'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge $tone={lead.source === 'quote-form' ? 'blue' : 'cream'}>
                          {SOURCE_LABELS[lead.source] || lead.source}
                        </Badge>
                      </td>
                      <td style={{ maxWidth: 340 }}>
                        <span className="muted" style={{ fontSize: 12 }}>
                          {lead.requirement
                            ? lead.requirement.length > 110
                              ? `${lead.requirement.slice(0, 110)}…`
                              : lead.requirement
                            : lead.productInterest || '—'}
                        </span>
                      </td>
                      <td className="muted" style={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(lead.createdAt)}
                      </td>
                      <td>
                        <Badge $tone={tone(lead.status)}>{lead.status}</Badge>
                      </td>
                      <td>
                        <div className="actions">
                          <Button
                            type="button"
                            $variant="outline"
                            onClick={() => setActive(lead)}
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
            <Pagination meta={meta} onPage={setPage} />
          </>
        )}
      </Card>

      <Drawer
        open={Boolean(active)}
        onClose={() => setActive(null)}
        width={620}
        title={active?.name || 'Enquiry'}
        subtitle={active ? `${SOURCE_LABELS[active.source] || active.source} · ${formatDateTime(active.createdAt)}` : ''}
        footer={
          <>
            <Button
              type="button"
              $variant="ghost"
              onClick={() => setDeleting(true)}
              style={{ color: 'var(--dash-red)', marginRight: 'auto' }}
            >
              <Trash2 size={14} /> Delete
            </Button>
            <Button type="button" $variant="outline" onClick={() => setActive(null)} disabled={saving}>
              Close
            </Button>
            <Button type="button" onClick={saveDetails} disabled={saving}>
              {saving ? 'Saving…' : 'Save notes'}
            </Button>
          </>
        }
      >
        {active && (
          <>
            {formError && <ErrorBlock message={formError} />}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {active.phone && (
                <Button as="a" href={`tel:${digits(active.phone)}`} $variant="outline" target="_blank" rel="noreferrer">
                  <Phone size={14} /> Call
                </Button>
              )}
              {active.email && (
                <Button as="a" href={`mailto:${active.email}`} $variant="outline">
                  <Mail size={14} /> Email
                </Button>
              )}
              {active.phone && (
                <Button
                  as="a"
                  href={`https://wa.me/${digits(active.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  $variant="outline"
                >
                  <MessageCircle size={14} /> WhatsApp
                </Button>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10.5, fontWeight: 650, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--dash-faint)', marginBottom: 8 }}>
                Pipeline stage
              </div>
              <StageRow>
                {STAGES.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    className={active.status === stage.id ? 'active' : ''}
                    onClick={() => setStage(stage.id)}
                    disabled={saving}
                  >
                    {stage.label}
                  </button>
                ))}
              </StageRow>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 1,
                background: 'var(--dash-line)',
                border: '1px solid var(--dash-line)',
                borderRadius: 11,
                overflow: 'hidden',
                marginBottom: 18,
              }}
            >
              {[
                ['Email', active.email || '—'],
                ['Phone', active.phone || '—'],
                ['Company', active.company || '—'],
                ['City', active.city || '—'],
                ['Product interest', active.productInterest || '—'],
                ['Budget', active.budget || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ background: 'var(--dash-panel)', padding: '11px 13px' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dash-faint)' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12.5, marginTop: 3, color: 'var(--dash-ink)', wordBreak: 'break-word' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 650, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--dash-faint)', marginBottom: 6 }}>
                Requirement
              </div>
              <div
                style={{
                  background: 'var(--dash-panel-2)',
                  border: '1px solid var(--dash-line)',
                  borderRadius: 9,
                  padding: '11px 13px',
                  fontSize: 12.5,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {active.requirement || 'No requirement text was submitted.'}
              </div>
            </div>

            <FormGrid $cols={1}>
              <Field label="Internal notes" hint="Visible only in the dashboard">
                <Textarea
                  value={edit.notes}
                  onChange={(event) => setEdit((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Call outcome, quote sent, next steps…"
                  rows={4}
                />
              </Field>
              <Field label="Follow-up date">
                <Input
                  type="date"
                  value={edit.followUpDate}
                  onChange={(event) => setEdit((prev) => ({ ...prev, followUpDate: event.target.value }))}
                />
              </Field>
            </FormGrid>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--dash-line)' }}>
              <Button as="a" href="/dashboard/leads" $variant="ghost" style={{ padding: '5px 0', fontSize: 12 }}>
                Open the full leads pipeline <ArrowUpRight size={13} />
              </Button>
            </div>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={remove}
        busy={saving}
        title="Delete this enquiry?"
        message={active ? `The enquiry from ${active.name} will be removed permanently.` : ''}
        confirmLabel="Delete enquiry"
      />
    </>
  );
}
