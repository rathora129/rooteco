'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  Download,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  UserRound,
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
  buildQuery,
  formatDate,
  formatDateTime,
  formatMoney,
  getDashboardStats,
  useDebounced,
  useList,
} from '@/components/dashboard/hooks';

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const OPEN_STAGES = ['new', 'contacted', 'qualified', 'proposal'];
const SOURCES = ['website', 'contact-form', 'quote-form', 'whatsapp', 'manual', 'referral'];

const SORTS = [
  { value: '', label: 'Newest first' },
  { value: 'follow-up', label: 'Follow-up soonest' },
];

const emptyLead = {
  name: '',
  company: '',
  phone: '',
  email: '',
  city: '',
  source: 'manual',
  productInterest: '',
  budget: '',
  requirement: '',
};

function inputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function isOverdue(value) {
  if (!value) return false;
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
    color: var(--dash-ink);
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

const LeadCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  .avatar {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    background: var(--dash-accent-soft);
    color: var(--dash-accent);
    border: 1px solid rgba(233, 166, 78, 0.2);
  }
  .name {
    font-weight: 600;
    color: var(--dash-ink);
  }
  .sub {
    font-size: 11.5px;
    color: var(--dash-muted);
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

const Note = styled.p`
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--dash-ink);
  background: var(--dash-panel-2);
  border: 1px solid var(--dash-line);
  border-left: 2px solid rgba(233, 166, 78, 0.45);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
  white-space: pre-wrap;
`;

const TimelineItem = styled.div`
  border: 1px solid var(--dash-line);
  border-radius: 9px;
  padding: 10px 12px;
  background: var(--dash-panel-2);
  font-size: 12px;
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .date {
    font-weight: 600;
    color: var(--dash-ink);
  }
  .body {
    color: var(--dash-muted);
    margin-top: 3px;
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
    transition: border-color 0.15s ease;
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
  color: var(--dash-ink);
  flex-wrap: wrap;
  b {
    color: var(--dash-accent);
  }
  .spacer {
    flex: 1;
  }
`;

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function LeadsModule() {
  const { notify } = useToast();

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [dueOnly, setDueOnly] = useState(false);
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 320);

  const { data: leads, meta, loading, error, refresh } = useList('/api/leads', {
    q: debouncedQ,
    page,
    pageSize: 20,
    sort,
    filters: { status, source, due: dueOnly ? 'true' : '' },
  });

  const [counts, setCounts] = useState({ pipeline: null, due: null });
  const loadCounts = useCallback(async () => {
    const [stats, due] = await Promise.allSettled([
      getDashboardStats(),
      apiRequest('/api/leads?due=true&pageSize=1'),
    ]);
    setCounts((prev) => ({
      pipeline: stats.status === 'fulfilled' ? stats.value.data?.pipeline?.leads || [] : prev.pipeline,
      due: due.status === 'fulfilled' ? due.value.meta?.total ?? 0 : prev.due,
    }));
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const [selected, setSelected] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyLead);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [activeId, setActiveId] = useState(null);
  const [active, setActive] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [edit, setEdit] = useState(emptyLead);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [followUp, setFollowUp] = useState({ dueDate: today(), note: '' });
  const [followUpBusy, setFollowUpBusy] = useState(false);

  const loadLead = useCallback(async (id) => {
    setDetailLoading(true);
    setDetailError('');
    try {
      const response = await apiRequest(`/api/leads/${id}`);
      const lead = response.data;
      setActive(lead);
      setEdit({
        name: lead.name || '',
        company: lead.company || '',
        phone: lead.phone || '',
        email: lead.email || '',
        city: lead.city || '',
        source: lead.source || 'manual',
        productInterest: lead.productInterest || '',
        budget: lead.budget || '',
        requirement: lead.requirement || '',
        notes: lead.notes || '',
        status: lead.status || 'new',
        followUpDate: inputDate(lead.followUpDate),
      });
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function openLead(lead) {
    setActiveId(lead.id);
    setActive(lead);
    setDetailError('');
    setFollowUp({ dueDate: today(), note: '' });
    loadLead(lead.id);
  }

  function closeLead() {
    setActiveId(null);
    setActive(null);
    setDetailError('');
    setDeleteOpen(false);
  }

  async function saveLead() {
    if (!active) return;
    setSaving(true);
    setDetailError('');
    try {
      await apiRequest(`/api/leads/${active.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: edit.name,
          company: edit.company || null,
          phone: edit.phone,
          email: edit.email || null,
          city: edit.city || null,
          source: edit.source,
          productInterest: edit.productInterest || null,
          budget: edit.budget || null,
          requirement: edit.requirement || null,
          notes: edit.notes || null,
          status: edit.status,
          followUpDate: edit.followUpDate || null,
        }),
      });
      notify('Lead updated.');
      refresh();
      loadCounts();
      loadLead(active.id);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteLead() {
    if (!active) return;
    setSaving(true);
    try {
      await apiRequest(`/api/leads/${active.id}`, { method: 'DELETE' });
      notify('Lead deleted.');
      setDeleteOpen(false);
      closeLead();
      setSelected((prev) => prev.filter((id) => id !== active.id));
      refresh();
      loadCounts();
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function addFollowUp() {
    if (!active || !followUp.dueDate) return;
    setFollowUpBusy(true);
    setDetailError('');
    try {
      await apiRequest(`/api/leads/${active.id}/followups`, {
        method: 'POST',
        body: JSON.stringify({ dueDate: followUp.dueDate, note: followUp.note || null }),
      });
      setFollowUp({ dueDate: today(), note: '' });
      notify('Follow-up scheduled.');
      loadLead(active.id);
      refresh();
      loadCounts();
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setFollowUpBusy(false);
    }
  }

  async function setFollowUpStatus(followUpId, nextStatus) {
    if (!active) return;
    setFollowUpBusy(true);
    try {
      await apiRequest(`/api/leads/${active.id}/followups/${followUpId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      notify('Follow-up updated.');
      loadLead(active.id);
      refresh();
      loadCounts();
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setFollowUpBusy(false);
    }
  }

  async function convertLead() {
    if (!active) return;
    setSaving(true);
    setDetailError('');
    try {
      await apiRequest(`/api/leads/${active.id}/convert`, {
        method: 'POST',
        body: JSON.stringify({ status: 'won' }),
      });
      notify('Lead marked won and linked to a customer.');
      loadLead(active.id);
      refresh();
      loadCounts();
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function createLead() {
    if (createForm.name.trim().length < 2 || digits(createForm.phone).length < 6) {
      setCreateError('A name and a reachable phone number are required.');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      await apiRequest('/api/leads', { method: 'POST', body: JSON.stringify(createForm) });
      notify('Lead added.');
      setCreateOpen(false);
      setCreateForm(emptyLead);
      setPage(1);
      refresh();
      loadCounts();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
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
          apiRequest(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) })
        )
      );
      notify(`${selected.length} lead${selected.length === 1 ? '' : 's'} moved to ${nextStatus}.`);
      setSelected([]);
      refresh();
      loadCounts();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete() {
    setBulkBusy(true);
    try {
      await Promise.all(selected.map((id) => apiRequest(`/api/leads/${id}`, { method: 'DELETE' })));
      notify(`${selected.length} lead${selected.length === 1 ? '' : 's'} deleted.`);
      setBulkDeleteOpen(false);
      setSelected([]);
      refresh();
      loadCounts();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
    }
  }

  const pipelineCounts = counts.pipeline || [];
  const countFor = (stage) => pipelineCounts.find((row) => row.status === stage)?.count || 0;
  const activeCount = OPEN_STAGES.reduce((total, stage) => total + countFor(stage), 0);
  const openByStage = Object.fromEntries(pipelineCounts.map((row) => [row.status, row.count]));

  const exportHref = `/api/leads/export${buildQuery({
    q: debouncedQ,
    status,
    source,
    due: dueOnly ? 'true' : '',
  })}`;

  const allSelected = leads.length > 0 && leads.every((lead) => selected.includes(lead.id));

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">CRM</span>
          <h1>Leads</h1>
          <p>
            Every enquiry, quote request and WhatsApp conversation becomes a lead. Work the
            pipeline, schedule follow-ups and convert warm contacts into customers.
          </p>
        </div>
        <div className="actions">
          <Button as="a" href={exportHref} $variant="outline" download>
            <Download size={14} /> Export CSV
          </Button>
          <Button
            type="button"
            onClick={() => {
              setCreateError('');
              setCreateForm(emptyLead);
              setCreateOpen(true);
            }}
          >
            <Plus size={15} /> New lead
          </Button>
        </div>
      </PageHeader>

      <StatsGrid>
        <StatCard $tone="accent">
          <div className="label">
            <UserRound /> Active pipeline
          </div>
          <div className="value">{counts.pipeline ? activeCount : '—'}</div>
          <div className="hint">Leads in play</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <Send /> New
          </div>
          <div className="value">{counts.pipeline ? countFor('new') : '—'}</div>
          <div className="hint">Not contacted yet</div>
        </StatCard>
        <StatCard $tone="red">
          <div className="label">
            <CalendarClock /> Follow-ups due
          </div>
          <div className="value">{counts.due ?? '—'}</div>
          <div className="hint">Due today or overdue</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <Check /> Won
          </div>
          <div className="value">{counts.pipeline ? countFor('won') : '—'}</div>
          <div className="hint">Converted customers</div>
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
            placeholder="Search name, company, phone, city…"
          />
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          >
            <option value="">All stages</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage[0].toUpperCase() + stage.slice(1)}
                {openByStage[stage] !== undefined ? ` (${openByStage[stage]})` : ''}
              </option>
            ))}
          </Select>
          <Select
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          >
            <option value="">All sources</option>
            {SOURCES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            style={{ width: 170 }}
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            $variant={dueOnly ? 'primary' : 'outline'}
            onClick={() => {
              setDueOnly((prev) => !prev);
              setPage(1);
            }}
          >
            <CalendarClock size={14} /> Due only
          </Button>
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
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<UserRound size={26} />}
            title="No leads found"
            text={
              q || status || source || dueOnly
                ? 'Try a different search or clear the filters.'
                : 'Contact, quote and WhatsApp enquiries appear here automatically.'
            }
            action={
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <Plus size={15} /> New lead
              </Button>
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
                        onChange={(event) =>
                          setSelected(event.target.checked ? leads.map((lead) => lead.id) : [])
                        }
                        aria-label="Select all leads"
                      />
                    </th>
                    <th>Lead</th>
                    <th>Contact</th>
                    <th>Interest</th>
                    <th>Source</th>
                    <th>Stage</th>
                    <th>Next follow-up</th>
                    <th>Added</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const wa = digits(lead.phone);
                    return (
                      <tr key={lead.id} className={selected.includes(lead.id) ? 'selected' : undefined}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(lead.id)}
                            onChange={() => toggleSelected(lead.id)}
                            aria-label={`Select ${lead.name}`}
                          />
                        </td>
                        <td>
                          <LeadCell>
                            <span className="avatar">{initials(lead.name)}</span>
                            <span>
                              <div className="name">{lead.name}</div>
                              <div className="sub">{lead.company || lead.city || '—'}</div>
                            </span>
                          </LeadCell>
                        </td>
                        <td>
                          <div className="mono">{lead.phone}</div>
                          <div className="muted">{lead.email || '—'}</div>
                        </td>
                        <td>
                          <div>{lead.productInterest || '—'}</div>
                          <div className="muted">{lead.budget || 'Budget not set'}</div>
                        </td>
                        <td>
                          <Badge $tone="neutral">{String(lead.source || 'manual').replace(/-/g, ' ')}</Badge>
                        </td>
                        <td>
                          <StatusBadge value={lead.status} />
                        </td>
                        <td>
                          {lead.followUpDate ? (
                            <span style={{ color: isOverdue(lead.followUpDate) ? 'var(--dash-red)' : undefined }}>
                              {formatDate(lead.followUpDate)}
                              {isOverdue(lead.followUpDate) && lead.status !== 'won' && lead.status !== 'lost' && (
                                <span className="muted"> · overdue</span>
                              )}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td className="muted">{formatDate(lead.createdAt)}</td>
                        <td>
                          <div className="actions">
                            {wa ? (
                              <IconButton
                                as="a"
                                href={`https://wa.me/${wa}`}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`WhatsApp ${lead.name}`}
                              >
                                <MessageCircle size={14} />
                              </IconButton>
                            ) : null}
                            <Button
                              type="button"
                              $variant="outline"
                              onClick={() => openLead(lead)}
                              style={{ padding: '5px 11px', fontSize: 12 }}
                            >
                              Open
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableScroll>
            <Pagination meta={meta} onPage={(next) => setPage(next)} />
          </>
        )}
      </Card>

      <Drawer
        open={Boolean(activeId)}
        onClose={closeLead}
        width={600}
        title={active ? active.name : 'Lead'}
        subtitle={active ? [active.company, active.city].filter(Boolean).join(' · ') || 'Lead record' : 'Loading…'}
        footer={
          <>
            <Button type="button" $variant="danger" onClick={() => setDeleteOpen(true)} disabled={saving || detailLoading}>
              <Trash2 size={14} /> Delete
            </Button>
            <Button type="button" $variant="outline" onClick={closeLead} disabled={saving}>
              Close
            </Button>
            <Button type="button" onClick={saveLead} disabled={saving || detailLoading}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        {detailError && <ErrorBlock message={detailError} />}
        {detailLoading && !active?.followUps ? (
          <SkeletonRows rows={6} />
        ) : active ? (
          <>
            <DetailSection title="Pipeline stage">
              <StageChips>
                {STAGES.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    data-active={edit.status === stage}
                    onClick={() => setEdit((prev) => ({ ...prev, status: stage }))}
                  >
                    {stage}
                  </button>
                ))}
              </StageChips>
              {edit.status !== active.status && (
                <p style={{ fontSize: 11.5, color: 'var(--dash-accent)', marginTop: 7 }}>
                  Stage changed to “{edit.status}” — save to apply.
                </p>
              )}
            </DetailSection>

            <DetailSection title="Quick actions">
              <ActionsRow>
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
                {active.email && (
                  <a href={`mailto:${active.email}`}>
                    <Mail /> Email
                  </a>
                )}
                {active.client ? (
                  <Link href={`/dashboard/clients/${active.client.id}`}>
                    <ArrowUpRight /> Customer record
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={convertLead}
                    disabled={saving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--dash-accent-ink)',
                      background: 'var(--dash-accent)',
                      border: '1px solid var(--dash-accent)',
                      borderRadius: 7,
                      padding: '6px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    <Check size={13} /> Convert to customer
                  </button>
                )}
              </ActionsRow>
            </DetailSection>

            <DetailSection title="Lead summary">
              <DetailList>
                <DetailRow label="Stage">
                  <StatusBadge value={active.status} />
                </DetailRow>
                <DetailRow label="Source">{String(active.source || 'manual').replace(/-/g, ' ')}</DetailRow>
                <DetailRow label="Interest">{active.productInterest || '—'}</DetailRow>
                <DetailRow label="Budget">{active.budget || '—'}</DetailRow>
                <DetailRow label="Added">{formatDateTime(active.createdAt)}</DetailRow>
                <DetailRow label="Updated">{formatDateTime(active.updatedAt)}</DetailRow>
              </DetailList>
              {active.requirement && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--dash-faint)', marginBottom: 6 }}>Requirement</div>
                  <Note>{active.requirement}</Note>
                </div>
              )}
            </DetailSection>

            <DetailSection title="Contact details">
              <FormGrid $cols={2}>
                <Field label="Name" required>
                  <Input value={edit.name} onChange={(event) => setEdit((prev) => ({ ...prev, name: event.target.value }))} />
                </Field>
                <Field label="Company">
                  <Input value={edit.company} onChange={(event) => setEdit((prev) => ({ ...prev, company: event.target.value }))} />
                </Field>
                <Field label="Phone" required>
                  <Input value={edit.phone} onChange={(event) => setEdit((prev) => ({ ...prev, phone: event.target.value }))} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={edit.email} onChange={(event) => setEdit((prev) => ({ ...prev, email: event.target.value }))} />
                </Field>
                <Field label="City">
                  <Input value={edit.city} onChange={(event) => setEdit((prev) => ({ ...prev, city: event.target.value }))} />
                </Field>
                <Field label="Source">
                  <Select value={edit.source} onChange={(event) => setEdit((prev) => ({ ...prev, source: event.target.value }))}>
                    {SOURCES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Product interest">
                  <Input value={edit.productInterest} onChange={(event) => setEdit((prev) => ({ ...prev, productInterest: event.target.value }))} />
                </Field>
                <Field label="Budget">
                  <Input value={edit.budget} onChange={(event) => setEdit((prev) => ({ ...prev, budget: event.target.value }))} />
                </Field>
                <Field label="Requirement" full>
                  <Textarea value={edit.requirement} onChange={(event) => setEdit((prev) => ({ ...prev, requirement: event.target.value }))} />
                </Field>
                <Field label="Next follow-up date">
                  <Input
                    type="date"
                    value={edit.followUpDate}
                    onChange={(event) => setEdit((prev) => ({ ...prev, followUpDate: event.target.value }))}
                  />
                </Field>
                <Field label="Internal notes" hint="Never shown publicly">
                  <Textarea value={edit.notes} onChange={(event) => setEdit((prev) => ({ ...prev, notes: event.target.value }))} />
                </Field>
              </FormGrid>
            </DetailSection>

            <DetailSection title={`Follow-ups (${(active.followUps || []).length})`}>
              {(active.followUps || []).length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--dash-muted)' }}>No follow-ups scheduled yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {(active.followUps || []).map((item) => (
                    <TimelineItem key={item.id}>
                      <div className="top">
                        <span className="date">{formatDate(item.dueDate)}</span>
                        <Badge $tone={item.status === 'done' ? 'green' : item.status === 'cancelled' ? 'red' : 'gold'}>
                          {item.status}
                        </Badge>
                      </div>
                      {item.note && <div className="body">{item.note}</div>}
                      {item.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <Button
                            type="button"
                            $variant="outline"
                            onClick={() => setFollowUpStatus(item.id, 'done')}
                            disabled={followUpBusy}
                            style={{ padding: '4px 9px', fontSize: 11 }}
                          >
                            Mark done
                          </Button>
                          <Button
                            type="button"
                            $variant="ghost"
                            onClick={() => setFollowUpStatus(item.id, 'cancelled')}
                            disabled={followUpBusy}
                            style={{ padding: '4px 9px', fontSize: 11 }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </TimelineItem>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <Field label="Due date">
                  <Input
                    type="date"
                    value={followUp.dueDate}
                    onChange={(event) => setFollowUp((prev) => ({ ...prev, dueDate: event.target.value }))}
                    style={{ width: 150 }}
                  />
                </Field>
                <Field label="Note">
                  <Input
                    value={followUp.note}
                    onChange={(event) => setFollowUp((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder="Call, sample, proposal…"
                    style={{ width: 230 }}
                  />
                </Field>
                <Button type="button" $variant="outline" onClick={addFollowUp} disabled={followUpBusy || !followUp.dueDate}>
                  <Plus size={13} /> Add
                </Button>
              </div>
            </DetailSection>

            {(active.quotes || []).length > 0 && (
              <DetailSection title="Linked quotations">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {active.quotes.map((quote) => (
                    <TimelineItem key={quote.id}>
                      <div className="top">
                        <span className="date">{quote.productName || 'Custom gifting'}</span>
                        <StatusBadge value={quote.status} />
                      </div>
                      <div className="body">
                        {quote.quantity ? `${quote.quantity} units` : 'Quantity pending'}
                        {quote.amount ? ` · ${formatMoney(quote.amount)}` : ' · Amount not set'}
                        {quote.order ? ` · Order ${quote.order.number}` : ''}
                      </div>
                    </TimelineItem>
                  ))}
                </div>
              </DetailSection>
            )}
          </>
        ) : (
          <ErrorBlock message={detailError || 'Could not load this lead.'} onRetry={() => activeId && loadLead(activeId)} />
        )}
      </Drawer>

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={540}
        title="New lead"
        subtitle="Add someone who enquired outside the website."
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="button" onClick={createLead} disabled={creating}>
              {creating ? 'Saving…' : 'Create lead'}
            </Button>
          </>
        }
      >
        {createError && <ErrorBlock message={createError} />}
        <FormGrid $cols={2}>
          <Field label="Name" required>
            <Input value={createForm.name} onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))} />
          </Field>
          <Field label="Company">
            <Input value={createForm.company} onChange={(event) => setCreateForm((prev) => ({ ...prev, company: event.target.value }))} />
          </Field>
          <Field label="Phone" required>
            <Input value={createForm.phone} onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </Field>
          <Field label="Email">
            <Input type="email" value={createForm.email} onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))} />
          </Field>
          <Field label="City">
            <Input value={createForm.city} onChange={(event) => setCreateForm((prev) => ({ ...prev, city: event.target.value }))} />
          </Field>
          <Field label="Source">
            <Select value={createForm.source} onChange={(event) => setCreateForm((prev) => ({ ...prev, source: event.target.value }))}>
              {SOURCES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Product interest">
            <Input
              value={createForm.productInterest}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, productInterest: event.target.value }))}
            />
          </Field>
          <Field label="Budget">
            <Input value={createForm.budget} onChange={(event) => setCreateForm((prev) => ({ ...prev, budget: event.target.value }))} />
          </Field>
          <Field label="Requirement" full>
            <Textarea
              value={createForm.requirement}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, requirement: event.target.value }))}
              placeholder="What are they looking for, quantity, timeline…"
            />
          </Field>
        </FormGrid>
      </Drawer>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteLead}
        busy={saving}
        title="Delete this lead?"
        message={active ? `“${active.name}” will be removed from the pipeline. This cannot be undone.` : ''}
        confirmLabel="Delete lead"
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={bulkDelete}
        busy={bulkBusy}
        title={`Delete ${selected.length} lead${selected.length === 1 ? '' : 's'}?`}
        message="Selected leads and their follow-up history will be permanently deleted."
        confirmLabel="Delete selected"
      />
    </>
  );
}
