'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  ArrowLeft,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
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
  Full,
  Input,
  LoadingBlock,
  PageHeader,
  StatusBadge,
  Table,
  TableScroll,
  Textarea,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, formatDateTime, formatMoney } from '@/components/dashboard/hooks';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Stat = styled.div`
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: 11px;
  padding: 12px 14px;
  .label {
    font-size: 10px;
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dash-faint);
  }
  .value {
    margin-top: 5px;
    font-size: 19px;
    font-weight: 650;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const Stack = styled.div`
  display: grid;
  gap: 16px;
`;

const MiniCard = styled(Link)`
  display: block;
  background: var(--dash-panel-2);
  border: 1px solid var(--dash-line);
  border-radius: 9px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: var(--dash-muted);
  transition: border-color 0.14s ease;
  &:hover { border-color: rgba(233, 166, 78, 0.32); }
  .row { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
  strong { color: var(--dash-ink); font-weight: 600; }
  .sub { margin-top: 3px; font-size: 11px; color: var(--dash-faint); }
`;

const Bubble = styled.div`
  align-self: ${(p) => (p.$out ? 'flex-end' : 'flex-start')};
  background: ${(p) => (p.$out ? 'var(--dash-accent-soft)' : 'var(--dash-panel-2)')};
  border: 1px solid var(--dash-line);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12.5px;
  max-width: 74%;
  .meta { font-size: 10.5px; color: var(--dash-faint); margin-top: 3px; }
`;

function digits(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export default function ClientDetail({ clientId }) {
  const { notify } = useToast();
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', city: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest(`/api/clients/${clientId}`);
      setClient(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  function openEdit() {
    if (!client) return;
    setForm({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      city: client.city || '',
      notes: client.notes || '',
    });
    setFormError('');
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setFormError('');
    try {
      const response = await apiRequest(`/api/clients/${clientId}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      setClient((prev) => ({ ...prev, ...response.data }));
      setEditing(false);
      notify('Customer updated.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeClient() {
    if (!client) return;
    setSaving(true);
    try {
      await apiRequest(`/api/clients/${clientId}`, { method: 'DELETE' });
      notify('Customer deleted.');
      router.push('/dashboard/clients');
    } catch (err) {
      notify(err.message, 'error');
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  }

  const orderValue = useMemo(
    () => (client?.orders || []).reduce((sum, order) => sum + Number(order.total || 0), 0),
    [client]
  );
  const openQuotes = (client?.quotes || []).filter((quote) => !['won', 'lost'].includes(quote.status)).length;
  const wonQuotes = (client?.quotes || []).filter((quote) => quote.status === 'won').length;

  if (loading) {
    return (
      <>
        <PageHeader>
          <div>
            <span className="eyebrow">Business · Customers</span>
            <h1>Customer profile</h1>
          </div>
        </PageHeader>
        <Card>
          <LoadingBlock label="Loading customer…" />
        </Card>
      </>
    );
  }

  if (error || !client) {
    return (
      <>
        <PageHeader>
          <div>
            <span className="eyebrow">Business · Customers</span>
            <h1>Customer profile</h1>
          </div>
        </PageHeader>
        <Card>
          <ErrorBlock message={error || 'Customer not found.'} onRetry={load} />
          <div style={{ marginTop: 12 }}>
            <Button as={Link} href="/dashboard/clients" $variant="outline">
              <ArrowLeft size={14} /> Back to customers
            </Button>
          </div>
        </Card>
      </>
    );
  }

  const stats = [
    { label: 'Orders', value: client._count?.orders ?? (client.orders || []).length },
    { label: 'Order value', value: formatMoney(orderValue) },
    { label: 'Quotes', value: client._count?.quotes ?? (client.quotes || []).length },
    { label: 'Open quotes', value: openQuotes },
    { label: 'Won quotes', value: wonQuotes },
    { label: 'Leads', value: client._count?.leads ?? (client.leads || []).length },
  ];

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Business · Customers</span>
          <h1>{client.name}</h1>
          <p>
            {client.company || 'Individual customer'} · customer since {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="actions">
          <Button as={Link} href="/dashboard/clients" $variant="outline">
            <ArrowLeft size={14} /> Back
          </Button>
          <Button type="button" $variant="outline" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button type="button" $variant="outline" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} /> Delete
          </Button>
          <Button type="button" onClick={openEdit}>
            <Pencil size={14} /> Edit customer
          </Button>
        </div>
      </PageHeader>

      <StatsGrid>
        {stats.map((stat) => (
          <Stat key={stat.label}>
            <div className="label">{stat.label}</div>
            <div className="value">{stat.value}</div>
          </Stat>
        ))}
      </StatsGrid>

      <Grid>
        <Stack>
          <Card>
            <h2 style={{ fontSize: 15, marginBottom: 10 }}>Contact</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={13} style={{ color: 'var(--dash-faint)' }} />
                <span>{client.phone || 'No phone on file'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={13} style={{ color: 'var(--dash-faint)' }} />
                <span>{client.email || 'No email on file'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={13} style={{ color: 'var(--dash-faint)' }} />
                <span>{client.city || 'City not set'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {client.phone && (
                <Button as="a" href={`tel:${digits(client.phone)}`} $variant="outline" style={{ padding: '5px 10px', fontSize: 11.5 }}>
                  Call
                </Button>
              )}
              {client.email && (
                <Button as="a" href={`mailto:${client.email}`} $variant="outline" style={{ padding: '5px 10px', fontSize: 11.5 }}>
                  Email
                </Button>
              )}
              {client.phone && (
                <Button
                  as="a"
                  href={`https://wa.me/${digits(client.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  $variant="outline"
                  style={{ padding: '5px 10px', fontSize: 11.5 }}
                >
                  <MessageCircle size={12} /> WhatsApp
                </Button>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 650, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dash-faint)', marginBottom: 5 }}>
                Internal notes
              </div>
              <div style={{ fontSize: 12, color: 'var(--dash-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {client.notes || 'No notes yet. Use Edit customer to add context.'}
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 11, color: 'var(--dash-faint)', lineHeight: 1.7 }}>
              Created {formatDateTime(client.createdAt)}
              <br />
              Updated {formatDateTime(client.updatedAt)}
            </div>
          </Card>

          <Card>
            <h2 style={{ fontSize: 15, marginBottom: 10 }}>Leads</h2>
            {(client.leads || []).length === 0 ? (
              <EmptyState title="No leads yet" text="Enquiries from this customer appear here." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {client.leads.map((lead) => (
                  <MiniCard key={lead.id} href="/dashboard/leads">
                    <div className="row">
                      <strong>{lead.productInterest || lead.requirement?.slice(0, 44) || 'Enquiry'}</strong>
                      <StatusBadge value={lead.status} />
                    </div>
                    <div className="sub">
                      {lead.source}
                      {lead.followUpDate ? ` · follow-up ${formatDate(lead.followUpDate)}` : ''} ·{' '}
                      {formatDateTime(lead.createdAt)}
                    </div>
                  </MiniCard>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 style={{ fontSize: 15, marginBottom: 10 }}>WhatsApp history</h2>
            {(client.whatsappMessages || []).length === 0 ? (
              <EmptyState
                title="No WhatsApp messages"
                text="Messages sync here once the WhatsApp Business Platform webhook is configured."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {client.whatsappMessages.map((message) => (
                  <Bubble key={message.id} $out={message.direction === 'outbound'}>
                    <div>{message.body}</div>
                    <div className="meta">
                      {message.direction} · {message.status} · {formatDateTime(message.createdAt)}
                    </div>
                  </Bubble>
                ))}
              </div>
            )}
          </Card>
        </Stack>

        <Stack>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <h2 style={{ fontSize: 15 }}>Orders</h2>
              <Badge $tone="neutral" style={{ marginLeft: 'auto' }}>
                {(client.orders || []).length}
              </Badge>
            </div>
            {(client.orders || []).length === 0 ? (
              <EmptyState title="No orders yet" text="Orders placed by this customer will appear here." />
            ) : (
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Placed</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link href="/dashboard/orders" style={{ color: 'var(--dash-accent)', fontWeight: 650 }}>
                            {order.number}
                          </Link>
                        </td>
                        <td className="muted">{formatDate(order.createdAt)}</td>
                        <td>{(order.items || []).reduce((sum, item) => sum + item.qty, 0)}</td>
                        <td className="strong">{formatMoney(order.total)}</td>
                        <td><StatusBadge value={order.status} /></td>
                        <td><StatusBadge value={order.paymentStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            )}
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <h2 style={{ fontSize: 15 }}>Quotations</h2>
              <Badge $tone="neutral" style={{ marginLeft: 'auto' }}>
                {(client.quotes || []).length}
              </Badge>
            </div>
            {(client.quotes || []).length === 0 ? (
              <EmptyState title="No quotes yet" text="Quote requests from this customer will appear here." />
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {client.quotes.map((quote) => (
                  <MiniCard key={quote.id} href="/dashboard/quotes">
                    <div className="row">
                      <strong>{quote.productName || 'Custom gifting'}</strong>
                      <StatusBadge value={quote.status} />
                    </div>
                    <div className="sub">
                      {quote.quantity ? `${quote.quantity} units · ` : ''}
                      {quote.amount ? formatMoney(quote.amount) : 'Amount pending'}
                      {quote.order ? ` · order ${quote.order.number}` : ''} ·{' '}
                      {formatDateTime(quote.createdAt)}
                    </div>
                  </MiniCard>
                ))}
              </div>
            )}
          </Card>
        </Stack>
      </Grid>

      <Drawer
        open={editing}
        onClose={() => setEditing(false)}
        width={520}
        title="Edit customer"
        subtitle="Contact details and internal notes"
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        {formError && <ErrorBlock message={formError} />}
        <FormGrid $cols={2}>
          <Field label="Name" required>
            <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          </Field>
          <Field label="Company">
            <Input value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} />
          </Field>
          <Field label="Phone" required>
            <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
          </Field>
          <Full>
            <Field label="Internal notes">
              <Textarea rows={4} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </Field>
          </Full>
        </FormGrid>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={removeClient}
        busy={saving}
        title="Delete this customer?"
        message={`${client.name} will be removed. Their leads, quotations and orders stay, but will no longer be linked to a customer. This cannot be undone.`}
        confirmLabel="Delete customer"
      />
    </>
  );
}
