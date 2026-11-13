'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Inbox,
  MessageCircle,
  RefreshCw,
  Send,
  Settings2,
  Smartphone,
  Webhook,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  Field,
  Input,
  LoadingBlock,
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
  formatDateTime,
  useDebounced,
  useList,
} from '@/components/dashboard/hooks';

const GRID = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 16px;
  margin-bottom: 16px;
  align-items: start;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--dash-line-soft);
  &:last-of-type { border-bottom: 0; }
  .ic {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: ${(p) => (p.$ok ? 'var(--dash-green-soft)' : 'var(--dash-panel-2)')};
    color: ${(p) => (p.$ok ? 'var(--dash-green)' : 'var(--dash-faint)')};
    svg { width: 13px; height: 13px; }
  }
  .grow { flex: 1; min-width: 0; }
  .title { font-size: 12.5px; color: var(--dash-ink); }
  .meta { font-size: 10.5px; color: var(--dash-faint); margin-top: 2px; font-family: var(--font-mono, ui-monospace, monospace); }
`;

const Composer = styled.div`
  background: var(--dash-panel-2);
  border: 1px solid var(--dash-line);
  border-radius: 10px;
  padding: 12px 13px;
  margin-bottom: 12px;
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--dash-muted);
`;

const QUICK = [
  'Hello! Thank you for your enquiry with RootEco. How can we help with your gifting requirement?',
  'Your quotation from RootEco is ready. Please reply here if you would like any changes.',
  'Your RootEco order has been confirmed and is being prepared. We will share dispatch details shortly.',
];

export default function WhatsAppModule() {
  const { notify } = useToast();
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState('');
  const [configKey, setConfigKey] = useState(0);

  const [q, setQ] = useState('');
  const [direction, setDirection] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 300);
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
    setConfig(null);
    setConfigError('');
    apiRequest('/api/whatsapp/config')
      .then((payload) => {
        if (!active) return;
        setConfig(payload.data);
        if (payload.data.defaultMessage) {
          setForm((prev) => ({ ...prev, body: prev.body || payload.data.defaultMessage }));
        }
      })
      .catch((err) => {
        if (active) setConfigError(err.message);
      });
    return () => {
      active = false;
    };
  }, [configKey]);

  const ready = Boolean(config?.sending);
  const full = Boolean(config?.ready);

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
      setForm((prev) => ({ ...prev, body: '', to: '' }));
      notify('Message sent through the WhatsApp Business Platform.');
      setPage(1);
      refresh();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Communication</span>
          <h1>WhatsApp</h1>
          <p>
            The storefront shows a click-to-chat button with your public number. Two-way messaging
            uses the official WhatsApp Business Platform and only sends when its credentials are
            configured.
          </p>
        </div>
        <div className="actions">
          {config && (
            <Badge $tone={full ? 'green' : ready ? 'gold' : 'red'}>
              {full ? 'connected' : ready ? 'sending only' : 'setup required'}
            </Badge>
          )}
          <Button as={Link} href="/dashboard/website/settings" $variant="outline">
            <Settings2 size={14} /> WhatsApp settings
          </Button>
        </div>
      </PageHeader>

      <GRID>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Smartphone size={15} style={{ color: 'var(--dash-accent)' }} />
            <h2 style={{ fontSize: 15 }}>Platform status</h2>
            <Button
              type="button"
              $variant="ghost"
              onClick={() => setConfigKey((key) => key + 1)}
              style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: 11.5 }}
            >
              <RefreshCw size={12} /> Recheck
            </Button>
          </div>
          {configError ? (
            <ErrorBlock message={configError} onRetry={() => setConfigKey((key) => key + 1)} />
          ) : !config ? (
            <LoadingBlock label="Checking configuration…" />
          ) : (
            <>
              <CheckRow $ok={config.sending}>
                <span className="ic">
                  {config.sending ? <Check /> : <AlertTriangle />}
                </span>
                <div className="grow">
                  <div className="title">Outgoing messages</div>
                  <div className="meta">WHATSAPP_TOKEN · WHATSAPP_PHONE_NUMBER_ID</div>
                </div>
                <Badge $tone={config.sending ? 'green' : 'gold'}>
                  {config.sending ? 'configured' : 'pending'}
                </Badge>
              </CheckRow>
              <CheckRow $ok={config.webhookVerification}>
                <span className="ic">
                  {config.webhookVerification ? <Check /> : <AlertTriangle />}
                </span>
                <div className="grow">
                  <div className="title">Webhook verification</div>
                  <div className="meta">WHATSAPP_VERIFY_TOKEN</div>
                </div>
                <Badge $tone={config.webhookVerification ? 'green' : 'gold'}>
                  {config.webhookVerification ? 'configured' : 'pending'}
                </Badge>
              </CheckRow>
              <CheckRow $ok={config.incomingEvents}>
                <span className="ic">
                  {config.incomingEvents ? <Check /> : <AlertTriangle />}
                </span>
                <div className="grow">
                  <div className="title">Incoming message events</div>
                  <div className="meta">WHATSAPP_APP_SECRET</div>
                </div>
                <Badge $tone={config.incomingEvents ? 'green' : 'gold'}>
                  {config.incomingEvents ? 'configured' : 'pending'}
                </Badge>
              </CheckRow>

              <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--dash-muted)', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Webhook size={12} /> Webhook path: <code>{config.webhookPath}</code>
                </div>
                <div style={{ marginTop: 4 }}>
                  Public chat number: <strong style={{ color: 'var(--dash-ink)' }}>{config.displayNumber || 'Not set'}</strong>{' '}
                  {config.enabled ? (
                    <Badge $tone="green">button live</Badge>
                  ) : (
                    <Badge $tone="neutral">button hidden</Badge>
                  )}
                </div>
                {!config.displayNumber && (
                  <div style={{ marginTop: 6 }}>
                    Add a number in Website settings so the storefront click-to-chat button has a
                    destination.
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <MessageCircle size={15} style={{ color: 'var(--dash-accent)' }} />
            <h2 style={{ fontSize: 15 }}>Send a message</h2>
            {ready && <Badge $tone="green" style={{ marginLeft: 'auto' }}>ready</Badge>}
          </div>

          {sendError && <ErrorBlock message={sendError} />}
          {sent && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: 'var(--dash-green-soft)',
                border: '1px solid rgba(139, 189, 112, 0.25)',
                borderRadius: 9,
                padding: '9px 12px',
                fontSize: 12,
                color: 'var(--dash-green)',
                marginBottom: 12,
              }}
            >
              <CheckCircle2 size={14} /> Sent to {sent.to} · status {sent.status}
            </div>
          )}

          {!ready && config && (
            <Composer>
              Sending is disabled until WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set in the
              server environment. You can still review message history and the public click-to-chat
              configuration.
            </Composer>
          )}

          <Field label="To (phone with country code)" required hint="Use the customer’s WhatsApp number, e.g. +91 98765 43210">
            <Input
              value={form.to}
              onChange={(event) => setForm((prev) => ({ ...prev, to: event.target.value }))}
              placeholder="+91 98765 43210"
              inputMode="tel"
            />
          </Field>

          <div style={{ margin: '12px 0 6px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {QUICK.map((template, index) => (
              <button
                key={template}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, body: template }))}
                style={{
                  border: '1px solid var(--dash-line)',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: 10.5,
                  color: 'var(--dash-muted)',
                  background: 'transparent',
                }}
              >
                Template {index + 1}
              </button>
            ))}
          </div>

          <Field label="Message" required hint={`${form.body.length} / 4096 characters`}>
            <Textarea
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value.slice(0, 4096) }))}
              placeholder="Hello! Following up on your gifting requirement…"
              rows={6}
            />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button
              type="button"
              onClick={sendMessage}
              disabled={sending || !ready || !form.to.trim() || !form.body.trim()}
            >
              <Send size={14} /> {sending ? 'Sending…' : 'Send message'}
            </Button>
          </div>
        </Card>
      </GRID>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Inbox size={15} style={{ color: 'var(--dash-accent)' }} />
          <h2 style={{ fontSize: 15 }}>Message history</h2>
          <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--dash-faint)' }}>
            {meta?.total ?? 0} messages
          </span>
        </div>
        <Toolbar>
          <SearchBox
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="Search message, number or customer…"
          />
          <Select
            value={direction}
            onChange={(event) => {
              setDirection(event.target.value);
              setPage(1);
            }}
            style={{ width: 150 }}
          >
            <option value="">All messages</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </Select>
        </Toolbar>

        {error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonRows rows={6} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={26} />}
            title="No WhatsApp messages yet"
            text="Incoming and outgoing messages appear here once the webhook and Cloud API credentials are configured."
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
                        <div className="strong" style={{ fontSize: 12.5 }}>
                          {message.client?.name || 'Unknown contact'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--dash-faint)' }}>
                          {message.direction === 'outbound' ? message.to : message.from}
                        </div>
                      </td>
                      <td style={{ maxWidth: 420, fontSize: 12 }}>{message.body}</td>
                      <td>
                        <Badge $tone={message.status === 'failed' ? 'red' : message.status === 'sent' ? 'green' : 'neutral'}>
                          {message.status}
                        </Badge>
                      </td>
                      <td className="muted" style={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(message.createdAt)}
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
    </>
  );
}
