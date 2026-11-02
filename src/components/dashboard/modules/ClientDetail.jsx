'use client';

import { useEffect, useState } from 'react';
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
  StatusBadge,
  Table,
  TableScroll,
  Textarea,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, formatDateTime, formatMoney } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

export default function ClientDetail({ clientId }) {
  const { notify } = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', city: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

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
      notify('Client updated.');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader>
          <div>
            <span className="eyebrow">CRM</span>
            <h1>Client</h1>
          </div>
        </PageHeader>
        <Card>
          <LoadingBlock label="Loading client…" />
        </Card>
      </>
    );
  }

  if (error || !client) {
    return (
      <>
        <PageHeader>
          <div>
            <span className="eyebrow">CRM</span>
            <h1>Client</h1>
          </div>
        </PageHeader>
        <Card>
          <ErrorBlock message={error || 'Client not found.'} onRetry={load} />
          <div style={{ marginTop: 12 }}>
            <Button as={Link} href="/dashboard/leads" $variant="outline">Back to leads</Button>
          </div>
        </Card>
      </>
    );
  }

  const orderValue = (client.orders || []).reduce((sum, order) => sum + Number(order.total || 0), 0);
  const openQuotes = (client.quotes || []).filter((quote) => !['won', 'lost'].includes(quote.status)).length;
  const wonQuotes = (client.quotes || []).filter((quote) => quote.status === 'won').length;

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
          <span className="eyebrow">CRM · Client</span>
          <h1>{client.name}</h1>
          <p>{client.company || 'Individual client'} · Client since {formatDate(client.createdAt)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button as={Link} href="/dashboard/leads" $variant="outline">Back to leads</Button>
          <Button type="button" onClick={openEdit}>Edit client</Button>
        </div>
      </PageHeader>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 18,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#fff',
              border: `1px solid ${theme.colors.line}`,
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.colors.muted }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors.forest, marginTop: 4 }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 18, alignItems: 'start' }}>
        <Card>
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Contact</h2>
          <div style={{ fontSize: 13, lineHeight: 1.9 }}>
            <div><strong>{client.phone}</strong></div>
            <div>{client.email || 'No email on file'}</div>
            <div>{client.city || 'City not set'}</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.colors.muted, marginBottom: 6 }}>
              Notes
            </div>
            <div style={{ fontSize: 12.5, color: theme.colors.muted, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {client.notes || 'No internal notes yet.'}
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 11.5, color: theme.colors.muted }}>
            Created {formatDateTime(client.createdAt)}<br />
            Updated {formatDateTime(client.updatedAt)}
          </div>
        </Card>

        <Card>
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Orders</h2>
          {(client.orders || []).length === 0 ? (
            <EmptyState title="No orders yet" text="Orders placed by this client will appear here." />
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
                        <Link href="/dashboard/orders" style={{ color: theme.colors.forest, fontWeight: 700 }}>
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
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Quotes</h2>
          {(client.quotes || []).length === 0 ? (
            <EmptyState title="No quotes yet" text="Quote requests from this client will appear here." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {client.quotes.map((quote) => (
                <div
                  key={quote.id}
                  style={{
                    background: '#fff',
                    border: `1px solid ${theme.colors.line}`,
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <strong>{quote.productName || 'Custom gifting'}</strong>
                    <StatusBadge value={quote.status} />
                  </div>
                  <div style={{ color: theme.colors.muted, marginTop: 2 }}>
                    {quote.quantity ? `${quote.quantity} units · ` : ''}
                    {quote.amount ? formatMoney(quote.amount) : 'Amount pending'}
                    {quote.order ? ` · Order ${quote.order.number}` : ''}
                  </div>
                  <div style={{ color: theme.colors.muted, fontSize: 11 }}>
                    {formatDateTime(quote.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Leads</h2>
          {(client.leads || []).length === 0 ? (
            <EmptyState title="No leads yet" text="Enquiries from this client will appear here." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {client.leads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    background: '#fff',
                    border: `1px solid ${theme.colors.line}`,
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <strong>{lead.productInterest || lead.requirement?.slice(0, 60) || 'Enquiry'}</strong>
                    <StatusBadge value={lead.status} />
                  </div>
                  <div style={{ color: theme.colors.muted, marginTop: 2 }}>
                    <Badge $tone="neutral">{lead.source}</Badge>
                    {lead.followUpDate ? ` · Follow-up ${formatDate(lead.followUpDate)}` : ''}
                  </div>
                  <div style={{ color: theme.colors.muted, fontSize: 11 }}>{formatDateTime(lead.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>WhatsApp history</h2>
          {(client.whatsappMessages || []).length === 0 ? (
            <EmptyState
              title="No WhatsApp messages"
              text="Messages sync here once the WhatsApp Business Platform webhook is configured."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {client.whatsappMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    alignSelf: message.direction === 'outgoing' ? 'flex-end' : 'flex-start',
                    background: message.direction === 'outgoing' ? '#e4efdc' : '#fff',
                    border: `1px solid ${theme.colors.line}`,
                    borderRadius: 10,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    maxWidth: '70%',
                  }}
                >
                  <div>{message.body}</div>
                  <div style={{ fontSize: 10.5, color: theme.colors.muted, marginTop: 3 }}>
                    {message.direction} · {message.status} · {formatDateTime(message.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit client"
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
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
              <Textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </Field>
          </Full>
        </FormGrid>
      </Modal>
    </>
  );
}
