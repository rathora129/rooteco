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
  Input,
  LoadingBlock,
  PageHeader,
  Pagination,
  SearchBox,
  Select,
  Table,
  TableScroll,
  Textarea,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDateTime, useDebounced, useList } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

function ConfigState({ label, configured }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        padding: '7px 0',
        borderBottom: `1px solid ${theme.colors.line}`,
        fontSize: 12.5,
      }}
    >
      <span>{label}</span>
      <Badge $tone={configured ? 'green' : 'gold'}>{configured ? 'Configured' : 'Pending'}</Badge>
    </div>
  );
}

export default function WhatsAppModule() {
  const { notify } = useToast();
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState('');
  const [q, setQ] = useState('');
  const [direction, setDirection] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 320);
  const { data, meta, loading, error, refresh } = useList('/api/whatsapp/messages', {
    q: debouncedQ,
    page,
    pageSize: 20,
    filters: { direction },
  });

  const [form, setForm] = useState({ to: '', body: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sent, setSent] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest('/api/whatsapp/config')
      .then((payload) => {
        if (active) setConfig(payload.data);
      })
      .catch((err) => {
        if (active) setConfigError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  async function sendMessage() {
    setSending(true);
    setSendError('');
    setSent(null);
    try {
      const response = await apiRequest('/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSent(response.data);
      setForm((prev) => ({ ...prev, body: '' }));
      notify('Message sent through the WhatsApp Business Platform.');
      setPage(1);
      refresh();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  const ready = Boolean(config?.sending);

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Sales &amp; CRM</span>
          <h1>WhatsApp</h1>
          <p>
            The storefront uses a click-to-chat button with your configured number. Two-way
            messaging uses the official WhatsApp Business Platform and only sends when its credentials
            are configured.
          </p>
        </div>
        <Button as={Link} href="/dashboard/settings" $variant="outline">WhatsApp settings</Button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 18, alignItems: 'start', marginBottom: 18 }}>
        <Card>
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 8 }}>Platform status</h2>
          {configError && <ErrorBlock message={configError} />}
          {!config && !configError ? (
            <LoadingBlock label="Checking configuration…" />
          ) : (
            config && (
              <>
                <ConfigState label="Outgoing messages (Cloud API)" configured={config.sending} />
                <ConfigState label="Webhook verification" configured={config.webhookVerification} />
                <ConfigState label="Incoming message events" configured={config.incomingEvents} />
                <div style={{ marginTop: 10, fontSize: 11.5, color: theme.colors.muted, lineHeight: 1.7 }}>
                  Webhook URL: <code>{config.webhookPath}</code>
                  <br />
                  Public chat number: <strong>{config.displayNumber || 'Not set'}</strong>
                  <br />
                  {config.ready
                    ? 'All Cloud API credentials are present. Message history below reflects real events.'
                    : 'Add WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN and WHATSAPP_APP_SECRET in the Vercel environment to enable two-way messaging. No conversations are simulated.'}
                </div>
              </>
            )
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 8 }}>Send a message</h2>
          {sendError && <ErrorBlock message={sendError} />}
          {sent && (
            <div style={{ marginBottom: 12, fontSize: 12.5, color: theme.colors.forest }}>
              Sent to {sent.to} · status {sent.status}
            </div>
          )}
          {!ready && config && (
            <div
              style={{
                background: theme.colors.cream,
                border: `1px solid ${theme.colors.line}`,
                borderRadius: 10,
                padding: 10,
                fontSize: 12,
                color: theme.colors.muted,
                marginBottom: 12,
                lineHeight: 1.6,
              }}
            >
              Sending is disabled until the WhatsApp Business Platform credentials are added. You can
              still review message history and the public click-to-chat configuration.
            </div>
          )}
          <FormGrid $cols={1}>
            <Field label="To (phone with country code)" required>
              <Input
                value={form.to}
                onChange={(event) => setForm((prev) => ({ ...prev, to: event.target.value }))}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Message" required>
              <Textarea
                value={form.body}
                onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                placeholder="Hello! Following up on your gifting requirement…"
              />
            </Field>
          </FormGrid>
          <Button
            type="button"
            onClick={sendMessage}
            disabled={sending || !ready || !form.to || !form.body}
            style={{ marginTop: 12 }}
          >
            {sending ? 'Sending…' : 'Send message'}
          </Button>
        </Card>
      </div>

      <Card>
        <Toolbar>
          <SearchBox
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="Search message, number or client…"
          />
          <Select
            value={direction}
            onChange={(event) => {
              setDirection(event.target.value);
              setPage(1);
            }}
            style={{ width: 'auto' }}
          >
            <option value="">All messages</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </Select>
        </Toolbar>

        {error && <ErrorBlock message={error} onRetry={refresh} />}
        {loading ? (
          <LoadingBlock label="Loading messages…" />
        ) : data.length === 0 ? (
          <EmptyState
            title="No WhatsApp messages yet"
            text="Incoming and outgoing messages will appear here once the webhook and Cloud API credentials are configured."
          />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th>Direction</th>
                    <th>Contact</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((message) => (
                    <tr key={message.id}>
                      <td>
                        <Badge $tone={message.direction === 'outbound' ? 'blue' : 'green'}>
                          {message.direction}
                        </Badge>
                      </td>
                      <td>
                        <div className="strong">{message.client?.name || 'Unknown contact'}</div>
                        <div className="muted">
                          {message.direction === 'outbound' ? message.to : message.from}
                        </div>
                      </td>
                      <td style={{ maxWidth: 380 }}>{message.body}</td>
                      <td><Badge $tone={message.status === 'failed' ? 'red' : 'neutral'}>{message.status}</Badge></td>
                      <td className="muted">{formatDateTime(message.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <Pagination meta={meta} onPage={(next) => setPage(next)} />
          </>
        )}
      </Card>
    </>
  );
}
