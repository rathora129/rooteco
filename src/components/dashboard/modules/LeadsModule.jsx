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
import {
  apiRequest,
  buildQuery,
  formatDate,
  formatDateTime,
  useDebounced,
  useList,
} from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

const PIPELINE = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const SOURCES = ['website', 'contact-form', 'quote-form', 'whatsapp', 'manual'];

const emptyLead = {
  name: '',
  company: '',
  phone: '',
  email: '',
  city: '',
  source: 'manual',
  productInterest: '',
  requirement: '',
  budget: '',
};

function inputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function LeadsModule() {
  const { notify } = useToast();
  const [tab, setTab] = useState('leads');

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [dueOnly, setDueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 320);
  const {
    data: leads,
    meta,
    loading,
    error,
    refresh,
  } = useList('/api/leads', {
    q: debouncedQ,
    page,
    pageSize: 20,
    filters: { status, source, due: dueOnly ? 'true' : '' },
  });

  const [clientQ, setClientQ] = useState('');
  const [clientPage, setClientPage] = useState(1);
  const debouncedClientQ = useDebounced(clientQ, 320);
  const {
    data: clients,
    meta: clientMeta,
    loading: clientsLoading,
    error: clientsError,
    refresh: refreshClients,
  } = useList('/api/clients', { q: debouncedClientQ, page: clientPage, pageSize: 20 });

  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', company: '', email: '', phone: '', city: '', notes: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [active, setActive] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [edit, setEdit] = useState({ status: 'new', notes: '', followUpDate: '' });
  const [saving, setSaving] = useState(false);
  const [followUp, setFollowUp] = useState({ dueDate: today(), note: '' });

  async function openLead(lead) {
    setActive(lead);
    setDetailLoading(true);
    setDetailError('');
    setEdit({
      status: lead.status || 'new',
      notes: lead.notes || '',
      followUpDate: inputDate(lead.followUpDate),
    });
    setFollowUp({ dueDate: today(), note: '' });
    try {
      const response = await apiRequest(`/api/leads/${lead.id}`);
      setActive(response.data);
      setEdit({
        status: response.data.status || 'new',
        notes: response.data.notes || '',
        followUpDate: inputDate(response.data.followUpDate),
      });
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveLead() {
    if (!active) return;
    setSaving(true);
    setDetailError('');
    try {
      const response = await apiRequest(`/api/leads/${active.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: edit.status,
          notes: edit.notes || null,
          followUpDate: edit.followUpDate || null,
        }),
      });
      setActive((prev) => ({ ...prev, ...response.data }));
      notify('Lead updated.');
      refresh();
      refreshClients();
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function addFollowUp() {
    if (!active || !followUp.dueDate) return;
    setSaving(true);
    setDetailError('');
    try {
      await apiRequest(`/api/leads/${active.id}/followups`, {
        method: 'POST',
        body: JSON.stringify({ dueDate: followUp.dueDate, note: followUp.note || null }),
      });
      const response = await apiRequest(`/api/leads/${active.id}`);
      setActive(response.data);
      setEdit((prev) => ({ ...prev, followUpDate: inputDate(response.data.followUpDate) }));
      setFollowUp({ dueDate: today(), note: '' });
      notify('Follow-up scheduled.');
      refresh();
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function setFollowUpStatus(followUpId, nextStatus) {
    if (!active) return;
    try {
      await apiRequest(`/api/leads/${active.id}/followups/${followUpId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      const response = await apiRequest(`/api/leads/${active.id}`);
      setActive(response.data);
      notify('Follow-up updated.');
    } catch (err) {
      setDetailError(err.message);
    }
  }

  async function convertLead() {
    if (!active) return;
    setSaving(true);
    setDetailError('');
    try {
      await apiRequest(`/api/leads/${active.id}/convert`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await apiRequest(`/api/leads/${active.id}`);
      setActive(response.data);
      notify('Lead converted to a client.');
      refresh();
      refreshClients();
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function createLead() {
    setCreating(true);
    setCreateError('');
    try {
      await apiRequest('/api/leads', { method: 'POST', body: JSON.stringify(leadForm) });
      notify('Lead added.');
      setCreateLeadOpen(false);
      setLeadForm(emptyLead);
      setPage(1);
      refresh();
      refreshClients();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function createClient() {
    setCreating(true);
    setCreateError('');
    try {
      await apiRequest('/api/clients', { method: 'POST', body: JSON.stringify(clientForm) });
      notify('Client added.');
      setCreateClientOpen(false);
      setClientForm({ name: '', company: '', email: '', phone: '', city: '', notes: '' });
      setClientPage(1);
      refreshClients();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  const exportHref = `/api/leads/export${buildQuery({
    q: debouncedQ,
    status,
    due: dueOnly ? 'true' : '',
  })}`;

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">CRM</span>
          <h1>Leads &amp; clients</h1>
          <p>
            Every contact, quote and WhatsApp enquiry becomes a lead. Work the pipeline, schedule
            follow-ups and keep the full client history in one place.
          </p>
        </div>
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Button
          type="button"
          $variant={tab === 'leads' ? 'primary' : 'outline'}
          onClick={() => setTab('leads')}
        >
          Leads
        </Button>
        <Button
          type="button"
          $variant={tab === 'clients' ? 'primary' : 'outline'}
          onClick={() => setTab('clients')}
        >
          Clients
        </Button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {tab === 'leads' ? (
            <>
              <Button as="a" href={exportHref} $variant="outline" download>
                Export CSV
              </Button>
              <Button type="button" onClick={() => { setCreateError(''); setCreateLeadOpen(true); }}>
                Add lead
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => { setCreateError(''); setCreateClientOpen(true); }}>
              Add client
            </Button>
          )}
        </div>
      </div>

      {tab === 'leads' ? (
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
              style={{ width: 'auto' }}
            >
              <option value="">All stages</option>
              {PIPELINE.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </Select>
            <Select
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setPage(1);
              }}
              style={{ width: 'auto' }}
            >
              <option value="">All sources</option>
              {SOURCES.map((option) => (
                <option key={option} value={option}>
                  {option}
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
              Follow-up due
            </Button>
          </Toolbar>

          {error && <ErrorBlock message={error} onRetry={refresh} />}
          {loading ? (
            <LoadingBlock label="Loading leads…" />
          ) : leads.length === 0 ? (
            <EmptyState
              title="No leads found"
              text="Contact, quote and WhatsApp enquiries will appear here automatically."
            />
          ) : (
            <>
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Contact</th>
                      <th>Source</th>
                      <th>Interest</th>
                      <th>Stage</th>
                      <th>Follow-up</th>
                      <th>Created</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="strong">{lead.name}</div>
                          <div className="muted">{lead.company || lead.city || '—'}</div>
                        </td>
                        <td>
                          <div>{lead.phone}</div>
                          <div className="muted">{lead.email || '—'}</div>
                        </td>
                        <td><Badge $tone="cream">{lead.source}</Badge></td>
                        <td>
                          <div>{lead.productInterest || '—'}</div>
                          <div className="muted">{lead.budget || ''}</div>
                        </td>
                        <td><StatusBadge value={lead.status} /></td>
                        <td className="muted">{lead.followUpDate ? formatDate(lead.followUpDate) : '—'}</td>
                        <td className="muted">{formatDateTime(lead.createdAt)}</td>
                        <td>
                          <div className="actions">
                            <Button
                              type="button"
                              $variant="outline"
                              onClick={() => openLead(lead)}
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
      ) : (
        <Card>
          <Toolbar>
            <SearchBox
              value={clientQ}
              onChange={(value) => {
                setClientQ(value);
                setClientPage(1);
              }}
              placeholder="Search clients by name, company, email…"
            />
          </Toolbar>

          {clientsError && <ErrorBlock message={clientsError} onRetry={refreshClients} />}
          {clientsLoading ? (
            <LoadingBlock label="Loading clients…" />
          ) : clients.length === 0 ? (
            <EmptyState
              title="No clients yet"
              text="Clients are created automatically from leads, quotes and orders."
            />
          ) : (
            <>
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Contact</th>
                      <th>City</th>
                      <th>Leads</th>
                      <th>Quotes</th>
                      <th>Orders</th>
                      <th>WhatsApp</th>
                      <th>Updated</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id}>
                        <td>
                          <div className="strong">{client.name}</div>
                          <div className="muted">{client.company || '—'}</div>
                        </td>
                        <td>
                          <div>{client.phone}</div>
                          <div className="muted">{client.email || '—'}</div>
                        </td>
                        <td className="muted">{client.city || '—'}</td>
                        <td>{client._count?.leads ?? 0}</td>
                        <td>{client._count?.quotes ?? 0}</td>
                        <td>{client._count?.orders ?? 0}</td>
                        <td>{client._count?.whatsappMessages ?? 0}</td>
                        <td className="muted">{formatDate(client.updatedAt)}</td>
                        <td>
                          <div className="actions">
                            <Button
                              as={Link}
                              href={`/dashboard/clients/${client.id}`}
                              $variant="outline"
                              style={{ padding: '6px 12px' }}
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
              <Pagination meta={clientMeta} onPage={(next) => setClientPage(next)} />
            </>
          )}
        </Card>
      )}

      <Modal
        open={createLeadOpen}
        onClose={() => setCreateLeadOpen(false)}
        title="Add lead"
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setCreateLeadOpen(false)}>Cancel</Button>
            <Button type="button" onClick={createLead} disabled={creating}>
              {creating ? 'Saving…' : 'Add lead'}
            </Button>
          </>
        }
      >
        {createError && <ErrorBlock message={createError} />}
        <FormGrid $cols={2}>
          <Field label="Name" required>
            <Input value={leadForm.name} onChange={(event) => setLeadForm((prev) => ({ ...prev, name: event.target.value }))} />
          </Field>
          <Field label="Company">
            <Input value={leadForm.company} onChange={(event) => setLeadForm((prev) => ({ ...prev, company: event.target.value }))} />
          </Field>
          <Field label="Phone" required>
            <Input value={leadForm.phone} onChange={(event) => setLeadForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </Field>
          <Field label="Email">
            <Input type="email" value={leadForm.email} onChange={(event) => setLeadForm((prev) => ({ ...prev, email: event.target.value }))} />
          </Field>
          <Field label="City">
            <Input value={leadForm.city} onChange={(event) => setLeadForm((prev) => ({ ...prev, city: event.target.value }))} />
          </Field>
          <Field label="Source">
            <Select value={leadForm.source} onChange={(event) => setLeadForm((prev) => ({ ...prev, source: event.target.value }))}>
              {SOURCES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </Field>
          <Field label="Product interest">
            <Input value={leadForm.productInterest} onChange={(event) => setLeadForm((prev) => ({ ...prev, productInterest: event.target.value }))} />
          </Field>
          <Field label="Budget">
            <Input value={leadForm.budget} onChange={(event) => setLeadForm((prev) => ({ ...prev, budget: event.target.value }))} />
          </Field>
          <Full>
            <Field label="Requirement">
              <Textarea value={leadForm.requirement} onChange={(event) => setLeadForm((prev) => ({ ...prev, requirement: event.target.value }))} />
            </Field>
          </Full>
        </FormGrid>
      </Modal>

      <Modal
        open={createClientOpen}
        onClose={() => setCreateClientOpen(false)}
        title="Add client"
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setCreateClientOpen(false)}>Cancel</Button>
            <Button type="button" onClick={createClient} disabled={creating}>
              {creating ? 'Saving…' : 'Add client'}
            </Button>
          </>
        }
      >
        {createError && <ErrorBlock message={createError} />}
        <FormGrid $cols={2}>
          <Field label="Name" required>
            <Input value={clientForm.name} onChange={(event) => setClientForm((prev) => ({ ...prev, name: event.target.value }))} />
          </Field>
          <Field label="Company">
            <Input value={clientForm.company} onChange={(event) => setClientForm((prev) => ({ ...prev, company: event.target.value }))} />
          </Field>
          <Field label="Phone" required>
            <Input value={clientForm.phone} onChange={(event) => setClientForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </Field>
          <Field label="Email">
            <Input type="email" value={clientForm.email} onChange={(event) => setClientForm((prev) => ({ ...prev, email: event.target.value }))} />
          </Field>
          <Field label="City">
            <Input value={clientForm.city} onChange={(event) => setClientForm((prev) => ({ ...prev, city: event.target.value }))} />
          </Field>
          <Full>
            <Field label="Notes">
              <Textarea value={clientForm.notes} onChange={(event) => setClientForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </Field>
          </Full>
        </FormGrid>
      </Modal>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active ? `${active.name}${active.company ? ` — ${active.company}` : ''}` : 'Lead'}
        wide
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setActive(null)}>Close</Button>
            <Button type="button" onClick={saveLead} disabled={saving || detailLoading}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        {detailError && <ErrorBlock message={detailError} />}
        {detailLoading ? (
          <LoadingBlock label="Loading lead…" />
        ) : (
          active && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 20 }}>
              <div>
                <div
                  style={{
                    background: '#fff',
                    border: `1px solid ${theme.colors.line}`,
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 12.5,
                    lineHeight: 1.7,
                  }}
                >
                  <div><strong>{active.phone}</strong></div>
                  <div>{active.email || 'No email'}</div>
                  <div>{active.city || '—'}</div>
                  <div style={{ marginTop: 8 }}>
                    <Badge $tone="cream">Source: {active.source}</Badge>{' '}
                    <StatusBadge value={active.status} />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    Interest: <strong>{active.productInterest || '—'}</strong>
                  </div>
                  {active.budget && <div>Budget: {active.budget}</div>}
                  {active.requirement && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{ color: theme.colors.muted }}>Requirement</span>
                      <div style={{ fontStyle: 'italic' }}>{active.requirement}</div>
                    </div>
                  )}
                  <div style={{ marginTop: 10 }}>
                    {active.client ? (
                      <Link
                        href={`/dashboard/clients/${active.client.id}`}
                        style={{ color: theme.colors.forest, fontWeight: 600 }}
                      >
                        View client record →
                      </Link>
                    ) : (
                      <Button type="button" $variant="outline" onClick={convertLead} disabled={saving}>
                        Convert to client
                      </Button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: 15, color: theme.colors.forest, margin: '18px 0 8px' }}>
                  Follow-ups
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(active.followUps || []).length === 0 && (
                    <div style={{ fontSize: 12.5, color: theme.colors.muted }}>No follow-ups yet.</div>
                  )}
                  {(active.followUps || []).map((item) => (
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <strong>{formatDate(item.dueDate)}</strong>
                        <Badge
                          $tone={item.status === 'done' ? 'green' : item.status === 'cancelled' ? 'red' : 'gold'}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      {item.note && <div style={{ color: theme.colors.muted, marginTop: 4 }}>{item.note}</div>}
                      {item.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <Button
                            type="button"
                            $variant="outline"
                            onClick={() => setFollowUpStatus(item.id, 'done')}
                            style={{ padding: '4px 10px', fontSize: 11.5 }}
                          >
                            Mark done
                          </Button>
                          <Button
                            type="button"
                            $variant="ghost"
                            onClick={() => setFollowUpStatus(item.id, 'cancelled')}
                            style={{ padding: '4px 10px', fontSize: 11.5 }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, background: '#fff', border: `1px solid ${theme.colors.line}`, borderRadius: 10, padding: 12 }}>
                  <h4 style={{ fontSize: 12.5, marginBottom: 8 }}>Schedule follow-up</h4>
                  <FormGrid $cols={1}>
                    <Field label="Due date" required>
                      <Input
                        type="date"
                        value={followUp.dueDate}
                        onChange={(event) => setFollowUp((prev) => ({ ...prev, dueDate: event.target.value }))}
                      />
                    </Field>
                    <Field label="Note">
                      <Input
                        value={followUp.note}
                        onChange={(event) => setFollowUp((prev) => ({ ...prev, note: event.target.value }))}
                        placeholder="Call, sample dispatch, proposal…"
                      />
                    </Field>
                  </FormGrid>
                  <Button
                    type="button"
                    onClick={addFollowUp}
                    disabled={saving || !followUp.dueDate}
                    style={{ marginTop: 10 }}
                  >
                    Add follow-up
                  </Button>
                </div>

                {(active.quotes || []).length > 0 && (
                  <>
                    <h3 style={{ fontSize: 15, color: theme.colors.forest, margin: '18px 0 8px' }}>Quotes</h3>
                    {active.quotes.map((quote) => (
                      <div
                        key={quote.id}
                        style={{
                          background: '#fff',
                          border: `1px solid ${theme.colors.line}`,
                          borderRadius: 10,
                          padding: 10,
                          fontSize: 12.5,
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{quote.productName || 'Custom gifting'}</strong>
                          <StatusBadge value={quote.status} />
                        </div>
                        <div className="muted" style={{ color: theme.colors.muted }}>
                          {quote.quantity ? `${quote.quantity} units · ` : ''}
                          {quote.amount ? `₹${Number(quote.amount).toLocaleString('en-IN')}` : 'Amount pending'}
                          {quote.order ? ` · Order ${quote.order.number}` : ''}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: 15, color: theme.colors.forest, marginBottom: 10 }}>Pipeline</h3>
                <FormGrid $cols={1}>
                  <Field label="Stage">
                    <Select value={edit.status} onChange={(event) => setEdit((prev) => ({ ...prev, status: event.target.value }))}>
                      {PIPELINE.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Next follow-up date">
                    <Input
                      type="date"
                      value={edit.followUpDate}
                      onChange={(event) => setEdit((prev) => ({ ...prev, followUpDate: event.target.value }))}
                    />
                  </Field>
                  <Field label="Notes" hint="Internal, never shown publicly">
                    <Textarea
                      value={edit.notes}
                      onChange={(event) => setEdit((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Call summary, requirements, next steps"
                    />
                  </Field>
                </FormGrid>
                <div style={{ marginTop: 12, fontSize: 11.5, color: theme.colors.muted, lineHeight: 1.7 }}>
                  Created {formatDateTime(active.createdAt)}
                  <br />
                  Last updated {formatDateTime(active.updatedAt)}
                </div>
              </div>
            </div>
          )
        )}
      </Modal>
    </>
  );
}
