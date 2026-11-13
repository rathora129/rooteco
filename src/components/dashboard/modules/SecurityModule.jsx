'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Check,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  ErrorBlock,
  Field,
  FormGrid,
  Input,
  LoadingBlock,
  PageHeader,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDateTime } from '@/components/dashboard/hooks';

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Strength = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  .bar {
    height: 4px;
    flex: 1;
    border-radius: 99px;
    background: var(--dash-panel-3);
  }
  .bar.on-1 { background: var(--dash-red); }
  .bar.on-2 { background: var(--dash-accent); }
  .bar.on-3 { background: #c8c56f; }
  .bar.on-4 { background: var(--dash-green); }
`;

const SessionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--dash-line-soft);
  &:last-child { border-bottom: 0; }
  .ic {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: var(--dash-panel-2);
    border: 1px solid var(--dash-line);
    color: var(--dash-muted);
    flex-shrink: 0;
    svg { width: 15px; height: 15px; }
  }
  .grow { flex: 1; min-width: 0; }
  .title { font-size: 12.5px; color: var(--dash-ink); display: flex; align-items: center; gap: 7px; }
  .meta { font-size: 11px; color: var(--dash-faint); margin-top: 2px; }
`;

function scorePassword(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^a-zA-Z0-9]/.test(value)) score += 1;
  return Math.min(4, score);
}

const LABELS = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];

export default function SecurityModule() {
  const { notify } = useToast();
  const [account, setAccount] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [sessionsError, setSessionsError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [revoking, setRevoking] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [changedAt, setChangedAt] = useState(null);

  useEffect(() => {
    let active = true;
    apiRequest('/api/auth/session')
      .then((payload) => {
        if (active) setAccount(payload.data.user);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setSessions(null);
    setSessionsError('');
    apiRequest('/api/auth/sessions')
      .then((payload) => {
        if (active) setSessions(payload.data);
      })
      .catch((err) => {
        if (active) setSessionsError(err.message);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const strength = scorePassword(form.newPassword);

  const otherSessions = useMemo(
    () => (sessions || []).filter((session) => !session.current).length,
    [sessions]
  );

  async function changePassword() {
    if (!form.currentPassword) {
      setFormError('Enter your current password.');
      return;
    }
    if (form.newPassword.length < 8) {
      setFormError('Use a new password of at least 8 characters.');
      return;
    }
    if (!(/[a-zA-Z]/.test(form.newPassword) && /\d/.test(form.newPassword))) {
      setFormError('Include at least one letter and one number.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setFormError('The new passwords do not match.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await apiRequest('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangedAt(new Date());
      notify('Password changed. Other devices have been signed out.');
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function revokeOthers() {
    setRevoking(true);
    try {
      const response = await apiRequest('/api/auth/sessions', { method: 'DELETE' });
      notify(
        response.data.revoked === 1
          ? 'Signed out 1 other session.'
          : `Signed out ${response.data.revoked} other sessions.`
      );
      setConfirmRevoke(false);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      notify(err.message, 'error');
      setConfirmRevoke(false);
    } finally {
      setRevoking(false);
    }
  }

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">System</span>
          <h1>Account security</h1>
          <p>
            Change the owner password and review the sessions that can access this dashboard.
            Passwords are stored as salted scrypt hashes.
          </p>
        </div>
      </PageHeader>

      <Layout>
        <div style={{ display: 'grid', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--dash-accent-soft)',
                  color: 'var(--dash-accent)',
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {(account?.name || account?.email || 'O').trim().slice(0, 1).toUpperCase()}
              </span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 650 }}>{account?.name || 'Owner'}</div>
                <div style={{ fontSize: 12, color: 'var(--dash-muted)' }}>{account?.email || '—'}</div>
              </div>
              <Badge $tone="green" style={{ marginLeft: 'auto' }}>
                signed in
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11.5, color: 'var(--dash-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Lock size={12} /> httpOnly session cookie
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>7-day session lifetime</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>login rate limited</span>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <KeyRound size={15} style={{ color: 'var(--dash-accent)' }} />
              <h2 style={{ fontSize: 15 }}>Change password</h2>
            </div>
            <p style={{ fontSize: 12, color: 'var(--dash-muted)', marginBottom: 14 }}>
              Changing the password signs out every other device immediately.
            </p>
            {formError && <ErrorBlock message={formError} />}
            {changedAt && !formError && (
              <div style={{ fontSize: 12, color: 'var(--dash-green)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={13} /> Updated at{' '}
                {changedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            <FormGrid $cols={1}>
              <Field label="Current password" required>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                />
              </Field>
              <Field label="New password" required hint="At least 8 characters with a letter and a number">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                />
              </Field>
              {form.newPassword && (
                <div style={{ marginTop: -6 }}>
                  <Strength>
                    {[1, 2, 3, 4].map((step) => (
                      <span key={step} className={`bar${step <= strength ? ` on-${strength}` : ''}`} />
                    ))}
                  </Strength>
                  <div style={{ fontSize: 11, color: 'var(--dash-faint)', marginTop: 5 }}>
                    {LABELS[strength]}
                  </div>
                </div>
              )}
              <Field label="Confirm new password" required>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                />
              </Field>
            </FormGrid>
            <Button type="button" onClick={changePassword} disabled={saving} style={{ marginTop: 14 }}>
              {saving ? 'Updating…' : 'Update password'}
            </Button>
          </Card>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Laptop size={15} style={{ color: 'var(--dash-accent)' }} />
              <h2 style={{ fontSize: 15 }}>Active sessions</h2>
              <Button
                type="button"
                $variant="ghost"
                onClick={() => setRefreshKey((key) => key + 1)}
                style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: 11.5 }}
              >
                <RefreshCw size={12} /> Refresh
              </Button>
            </div>
            {sessionsError ? (
              <ErrorBlock message={sessionsError} onRetry={() => setRefreshKey((key) => key + 1)} />
            ) : !sessions ? (
              <LoadingBlock label="Loading sessions…" />
            ) : (
              <>
                {sessions.map((session) => (
                  <SessionRow key={session.id}>
                    <span className="ic">
                      {session.current ? <ShieldCheck /> : <Laptop />}
                    </span>
                    <div className="grow">
                      <div className="title">
                        {session.current ? 'This device' : 'Dashboard session'}
                        {session.current && <Badge $tone="green">current</Badge>}
                      </div>
                      <div className="meta">
                        Signed in {formatDateTime(session.createdAt)} · expires {formatDateTime(session.expiresAt)}
                      </div>
                    </div>
                  </SessionRow>
                ))}
                {otherSessions > 0 ? (
                  <Button
                    type="button"
                    $variant="outline"
                    onClick={() => setConfirmRevoke(true)}
                    disabled={revoking}
                    style={{ marginTop: 12, width: '100%' }}
                  >
                    <LogOut size={14} /> Sign out {otherSessions} other session{otherSessions === 1 ? '' : 's'}
                  </Button>
                ) : (
                  <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--dash-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={13} /> No other sessions are signed in.
                  </div>
                )}
              </>
            )}
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ShieldAlert size={15} style={{ color: 'var(--dash-accent)' }} />
              <h2 style={{ fontSize: 15 }}>Good practice</h2>
            </div>
            <ul style={{ margin: 0, paddingLeft: 17, fontSize: 12, lineHeight: 1.9, color: 'var(--dash-muted)' }}>
              <li>Use a unique password that is not reused on other sites.</li>
              <li>Sign out other sessions after changing the password.</li>
              <li>Dashboard credentials are never stored in the browser.</li>
              <li>Sign-in attempts are rate limited per network address.</li>
            </ul>
          </Card>
        </div>
      </Layout>

      <ConfirmDialog
        open={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        onConfirm={revokeOthers}
        busy={revoking}
        title="Sign out other sessions?"
        message="Every other browser signed in to this dashboard will need to log in again. This device stays signed in."
        confirmLabel="Sign out others"
      />
    </>
  );
}
