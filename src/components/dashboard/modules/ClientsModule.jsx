'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  Building2,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Users,
} from 'lucide-react';
import {
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
  SkeletonRows,
  Table,
  TableScroll,
  Textarea,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, getDashboardStats, useDebounced, useList } from '@/components/dashboard/hooks';

const emptyClient = { name: '', company: '', email: '', phone: '', city: '', notes: '' };

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  @media (max-width: 640px) {
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
    color: var(--dash-accent);
  }
`;

const CustomerCell = styled.div`
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
    background: var(--dash-panel-3);
    color: var(--dash-muted);
    border: 1px solid var(--dash-line);
  }
  .name {
    font-weight: 600;
  }
  .sub {
    font-size: 11.5px;
    color: var(--dash-muted);
  }
`;

const CountPills = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  span {
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 5px;
    border: 1px solid var(--dash-line);
    background: var(--dash-panel-2);
    color: var(--dash-muted);
    font-variant-numeric: tabular-nums;
  }
  span.hot {
    color: var(--dash-accent);
    border-color: rgba(233, 166, 78, 0.28);
    background: var(--dash-accent-soft);
  }
`;

export default function ClientsModule() {
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 320);

  const { data: clients, meta, loading, error, refresh } = useList('/api/clients', {
    q: debouncedQ,
    page,
    pageSize: 20,
  });

  const [summary, setSummary] = useState(null);
  const loadSummary = useCallback(async () => {
    try {
      const payload = await getDashboardStats();
      setSummary(payload.data?.counts);
    } catch {
      setSummary(null);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyClient);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyClient);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  function openEdit(client) {
    setEditing(client);
    setEditForm({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      city: client.city || '',
      notes: client.notes || '',
    });
    setEditError('');
  }

  async function createClient() {
    if (createForm.name.trim().length < 2 || digits(createForm.phone).length < 6) {
      setCreateError('A name and a reachable phone number are required.');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      await apiRequest('/api/clients', { method: 'POST', body: JSON.stringify(createForm) });
      notify('Customer added.');
      setCreateOpen(false);
      setCreateForm(emptyClient);
      setPage(1);
      refresh();
      loadSummary();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function saveClient() {
    if (!editing) return;
    setSaving(true);
    setEditError('');
    try {
      await apiRequest(`/api/clients/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...editForm,
          company: editForm.company || null,
          email: editForm.email || null,
          city: editForm.city || null,
          notes: editForm.notes || null,
        }),
      });
      notify('Customer updated.');
      setEditing(null);
      refresh();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteClient() {
    if (!editing) return;
    setSaving(true);
    try {
      await apiRequest(`/api/clients/${editing.id}`, { method: 'DELETE' });
      notify('Customer deleted.');
      setDeleteOpen(false);
      setEditing(null);
      refresh();
      loadSummary();
    } catch (err) {
      setEditError(err.message);
      setDeleteOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Business management</span>
          <h1>Customers</h1>
          <p>
            A single record for every person you do business with — created automatically from
            leads, quotations, orders and WhatsApp conversations.
          </p>
        </div>
        <div className="actions">
          <Button
            type="button"
            onClick={() => {
              setCreateError('');
              setCreateForm(emptyClient);
              setCreateOpen(true);
            }}
          >
            <Plus size={15} /> Add customer
          </Button>
        </div>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <div className="label">
            <Users /> Customers
          </div>
          <div className="value">{meta?.total ?? summary?.clients ?? '—'}</div>
          <div className="hint">Unique customer records</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <ShoppingBag /> Orders
          </div>
          <div className="value">{summary?.orders ?? '—'}</div>
          <div className="hint">Orders placed in total</div>
        </StatCard>
        <StatCard>
          <div className="label">
            <Building2 /> Active leads
          </div>
          <div className="value">{summary?.activeLeads ?? '—'}</div>
          <div className="hint">Contacts still in the pipeline</div>
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
            placeholder="Search name, company, email, phone…"
          />
          <div className="spacer" />
          <IconButton type="button" onClick={refresh} aria-label="Refresh">
            <RefreshCw size={15} />
          </IconButton>
        </Toolbar>

        {error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonRows rows={6} />
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<Users size={26} />}
            title={q ? 'No matching customers' : 'No customers yet'}
            text={
              q
                ? 'Try a different search term.'
                : 'Customers are created automatically from leads, quotes and orders — or add one manually.'
            }
            action={
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <Plus size={15} /> Add customer
              </Button>
            }
          />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>City</th>
                    <th>Activity</th>
                    <th>Since</th>
                    <th>Last updated</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const wa = digits(client.phone);
                    const counts = client._count || {};
                    return (
                      <tr key={client.id}>
                        <td>
                          <CustomerCell>
                            <span className="avatar">{initials(client.name)}</span>
                            <span>
                              <div className="name">{client.name}</div>
                              <div className="sub">{client.company || '—'}</div>
                            </span>
                          </CustomerCell>
                        </td>
                        <td>
                          <div className="mono">{client.phone}</div>
                          <div className="muted">{client.email || '—'}</div>
                        </td>
                        <td className="muted">{client.city || '—'}</td>
                        <td>
                          <CountPills>
                            <span className={counts.orders ? 'hot' : undefined}>{counts.orders || 0} orders</span>
                            <span>{counts.quotes || 0} quotes</span>
                            <span>{counts.leads || 0} leads</span>
                          </CountPills>
                        </td>
                        <td className="muted">{formatDate(client.createdAt)}</td>
                        <td className="muted">{formatDate(client.updatedAt)}</td>
                        <td>
                          <div className="actions">
                            {wa ? (
                              <IconButton
                                as="a"
                                href={`https://wa.me/${wa}`}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`WhatsApp ${client.name}`}
                              >
                                <MessageCircle size={14} />
                              </IconButton>
                            ) : null}
                            <Button
                              as={Link}
                              href={`/dashboard/clients/${client.id}`}
                              $variant="outline"
                              style={{ padding: '5px 11px', fontSize: 12 }}
                            >
                              View
                            </Button>
                            <Button
                              type="button"
                              $variant="ghost"
                              onClick={() => openEdit(client)}
                              style={{ padding: '5px 9px', fontSize: 12 }}
                            >
                              Edit
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
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={520}
        title="Add customer"
        subtitle="Create a record manually — phone and email must be unique."
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="button" onClick={createClient} disabled={creating}>
              {creating ? 'Saving…' : 'Add customer'}
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
          <Field label="Notes" full>
            <Textarea value={createForm.notes} onChange={(event) => setCreateForm((prev) => ({ ...prev, notes: event.target.value }))} />
          </Field>
        </FormGrid>
      </Drawer>

      <Drawer
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        width={520}
        title={editing ? editing.name : 'Customer'}
        subtitle={editing?.company || 'Customer record'}
        footer={
          <>
            <Button type="button" $variant="danger" onClick={() => setDeleteOpen(true)} disabled={saving}>
              <Trash2 size={14} /> Delete
            </Button>
            <Button type="button" $variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={saveClient} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        {editError && <ErrorBlock message={editError} />}
        <FormGrid $cols={2}>
          <Field label="Name" required>
            <Input value={editForm.name} onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))} />
          </Field>
          <Field label="Company">
            <Input value={editForm.company} onChange={(event) => setEditForm((prev) => ({ ...prev, company: event.target.value }))} />
          </Field>
          <Field label="Phone" required>
            <Input value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </Field>
          <Field label="Email">
            <Input type="email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} />
          </Field>
          <Field label="City">
            <Input value={editForm.city} onChange={(event) => setEditForm((prev) => ({ ...prev, city: event.target.value }))} />
          </Field>
          <Field label="Notes" full>
            <Textarea value={editForm.notes} onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))} />
          </Field>
        </FormGrid>
        {editing && (
          <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
            {digits(editing.phone) && (
              <>
                <Button as="a" href={`tel:${digits(editing.phone)}`} $variant="outline" style={{ padding: '6px 11px', fontSize: 12 }}>
                  <Phone size={13} /> Call
                </Button>
                <Button
                  as="a"
                  href={`https://wa.me/${digits(editing.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  $variant="outline"
                  style={{ padding: '6px 11px', fontSize: 12 }}
                >
                  <MessageCircle size={13} /> WhatsApp
                </Button>
              </>
            )}
            {editing.email && (
              <Button as="a" href={`mailto:${editing.email}`} $variant="outline" style={{ padding: '6px 11px', fontSize: 12 }}>
                <Mail size={13} /> Email
              </Button>
            )}
            <Button as={Link} href={`/dashboard/clients/${editing.id}`} $variant="ghost" style={{ padding: '6px 11px', fontSize: 12 }}>
              Open full profile →
            </Button>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteClient}
        busy={saving}
        title="Delete this customer?"
        message={
          editing
            ? `“${editing.name}” will be deleted. Existing orders and quotes stay, but lose their link to this customer.`
            : ''
        }
        confirmLabel="Delete customer"
      />
    </>
  );
}
