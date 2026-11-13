'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { keyframes } from 'styled-components';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ImagePlus,
  Inbox,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { apiRequest } from '@/components/dashboard/hooks';

const focusRing = '0 0 0 3px rgba(233, 166, 78, 0.16)';

export const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 26px;
  .eyebrow {
    display: block;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--dash-accent);
    margin-bottom: 8px;
  }
  h1 {
    font-size: clamp(24px, 2.4vw, 30px);
    font-weight: 650;
    color: var(--dash-ink);
    letter-spacing: -0.03em;
    line-height: 1.15;
    margin-bottom: 6px;
  }
  p {
    font-size: 13.5px;
    color: var(--dash-muted);
    max-width: 680px;
    line-height: 1.55;
  }
  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
`;

export const Card = styled.section`
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: var(--dash-radius);
  padding: ${(p) => p.$pad || '20px'};
  ${(p) => (p.$sticky ? 'position: sticky; top: 92px;' : '')}
  ${(p) => (p.$flush ? 'padding: 0; overflow: hidden;' : '')}
`;

export const Panel = Card;

export const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
  h2,
  h3 {
    font-size: 14.5px;
    font-weight: 650;
    color: var(--dash-ink);
    letter-spacing: -0.01em;
  }
  .sub {
    font-size: 12px;
    color: var(--dash-muted);
    margin-top: 2px;
  }
  a,
  .link {
    font-size: 12px;
    font-weight: 600;
    color: var(--dash-accent);
  }
`;

const buttonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 9px 14px;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  svg { width: 15px; height: 15px; flex-shrink: 0; }
`;

export const Button = styled.button`
  ${buttonBase}
  background: ${(p) =>
    p.$variant === 'secondary' || p.$variant === 'outline' || p.$variant === 'ghost' || p.$variant === 'danger'
      ? p.$variant === 'secondary'
        ? 'var(--dash-panel-2)'
        : 'transparent'
      : 'var(--dash-accent)'};
  color: ${(p) =>
    p.$variant === 'danger'
      ? 'var(--dash-red)'
      : p.$variant === 'ghost'
        ? 'var(--dash-muted)'
        : p.$variant === 'secondary' || p.$variant === 'outline'
          ? 'var(--dash-ink)'
          : 'var(--dash-accent-ink)'};
  border-color: ${(p) =>
    p.$variant === 'danger'
      ? 'rgba(224, 130, 114, 0.28)'
      : p.$variant === 'secondary'
        ? 'var(--dash-line)'
        : p.$variant === 'outline'
          ? 'var(--dash-line)'
          : 'transparent'};
  &:hover:not(:disabled) {
    background: ${(p) =>
      p.$variant === 'danger'
        ? 'var(--dash-red-soft)'
        : p.$variant === 'secondary'
          ? 'var(--dash-hover)'
          : p.$variant === 'outline'
            ? 'rgba(255, 255, 255, 0.035)'
            : p.$variant === 'ghost'
              ? 'var(--dash-panel-2)'
              : '#f2b763'};
    border-color: ${(p) =>
      p.$variant === 'outline' || p.$variant === 'secondary'
        ? 'rgba(233, 166, 78, 0.42)'
        : p.$variant === 'danger'
          ? 'rgba(224, 130, 114, 0.5)'
          : undefined};
  }
  &:focus-visible { outline: none; box-shadow: ${focusRing}; }
`;

export const ButtonLink = styled.a`
  ${buttonBase}
  background: var(--dash-accent);
  color: var(--dash-accent-ink);
`;

export const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
  border: 1px solid transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  &:hover:not(:disabled) {
    background: var(--dash-panel-2);
    color: var(--dash-ink);
    border-color: var(--dash-line);
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  svg { width: 15px; height: 15px; }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${(p) => (p.$cols ? `repeat(${p.$cols}, minmax(0, 1fr))` : 'minmax(0, 1fr) minmax(0, 1fr)')};
  gap: 16px;
  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Full = styled.div`
  grid-column: 1 / -1;
`;

const FieldWrap = styled.div`
  display:block;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--dash-ink);
  .label {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 7px;
    letter-spacing: 0.01em;
  }
  .req { color: var(--dash-accent); }
  .hint {
    margin-left: auto;
    font-size: 10.5px;
    font-weight: 500;
    color: var(--dash-faint);
  }
`;

const controlStyles = `
  width: 100%;
  border: 1px solid var(--dash-line);
  border-radius: 9px;
  background: var(--dash-panel-2);
  padding: 9px 11px;
  font-size: 13px;
  color: var(--dash-ink);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  &::placeholder { color: var(--dash-faint); }
  &:focus { border-color: rgba(233, 166, 78, 0.55); background: var(--dash-panel-3); box-shadow: ${focusRing}; }
  &:disabled { opacity: 0.55; }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Select = styled.select`
  ${controlStyles}
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23919B94' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  padding-right: 32px;
`;

export const Textarea = styled.textarea`
  ${controlStyles}
  min-height: ${(p) => (p.$tall ? '200px' : '88px')};
  resize: vertical;
  line-height: 1.6;
`;

export function Field({ label, required, hint, children, full }) {
  const content = (
    <FieldWrap>
      <span className="label">
        {label}
        {required && <span className="req">*</span>}
        {hint && <span className="hint">{hint}</span>}
      </span>
      {children}
    </FieldWrap>
  );
  return full ? <Full>{content}</Full> : content;
}

export const CheckRow = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--dash-ink);
  cursor: pointer;
  input {
    width: 15px;
    height: 15px;
    accent-color: var(--dash-accent);
  }
`;

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        fontSize: 12.5,
        color: 'var(--dash-ink)',
      }}
    >
      <span
        style={{
          width: 34,
          height: 19,
          borderRadius: 999,
          background: checked ? 'var(--dash-accent)' : 'var(--dash-panel-3)',
          border: `1px solid ${checked ? 'var(--dash-accent)' : 'var(--dash-line)'}`,
          position: 'relative',
          transition: 'background 0.16s ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 17 : 2,
            width: 13,
            height: 13,
            borderRadius: '50%',
            background: checked ? 'var(--dash-accent-ink)' : 'var(--dash-muted)',
            transition: 'left 0.16s ease',
          }}
        />
      </span>
      <span>
        {label}
        {hint && <span style={{ display: 'block', fontSize: 11, color: 'var(--dash-faint)' }}>{hint}</span>}
      </span>
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} hidden />
    </label>
  );
}

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  .spacer { flex: 1; }
  .search { position: relative; flex: 1; min-width: 190px; max-width: 320px; }
  .search svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    color: var(--dash-faint);
    pointer-events: none;
  }
  .search input { padding-left: 32px; }
`;

export function SearchBox({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search">
      <Search />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

export const TableScroll = styled.div`
  overflow-x: auto;
  border: 1px solid var(--dash-line-soft);
  border-radius: 10px;
  background: var(--dash-panel);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12.8px;
  th {
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--dash-faint);
    background: var(--dash-panel-2);
    padding: 10px 14px;
    white-space: nowrap;
    border-bottom: 1px solid var(--dash-line);
    position: sticky;
    top: 0;
    z-index: 2;
  }
  th.sortable { cursor: pointer; user-select: none; }
  th.sortable:hover { color: var(--dash-ink); }
  td {
    padding: 11px 14px;
    border-bottom: 1px solid var(--dash-line-soft);
    vertical-align: middle;
    color: var(--dash-ink);
  }
  tbody tr { transition: background 0.12s ease; }
  tbody tr:hover { background: rgba(255, 255, 255, 0.022); }
  tbody tr.selected { background: rgba(233, 166, 78, 0.06); }
  tbody tr:last-child td { border-bottom: 0; }
  .actions { display: flex; gap: 4px; justify-content: flex-end; align-items: center; }
  .muted { color: var(--dash-muted); font-size: 11.5px; }
  .strong { font-weight: 600; }
  .mono { font-variant-numeric: tabular-nums; }
  input[type='checkbox'] { accent-color: var(--dash-accent); width: 14px; height: 14px; }
`;

const badgeTones = {
  neutral: ['var(--dash-panel-3)', 'var(--dash-muted)'],
  green: ['var(--dash-green-soft)', 'var(--dash-green)'],
  gold: ['var(--dash-accent-soft)', '#f1bd79'],
  red: ['var(--dash-red-soft)', 'var(--dash-red)'],
  blue: ['var(--dash-blue-soft)', 'var(--dash-blue)'],
  dark: ['var(--dash-accent)', 'var(--dash-accent-ink)'],
};

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.02em;
  white-space: nowrap;
  text-transform: capitalize;
  background: ${(p) => (badgeTones[p.$tone] || badgeTones.neutral)[0]};
  color: ${(p) => (badgeTones[p.$tone] || badgeTones.neutral)[1]};
  border: 1px solid ${(p) =>
    p.$tone === 'green'
      ? 'rgba(139, 189, 112, 0.22)'
      : p.$tone === 'red'
        ? 'rgba(224, 130, 114, 0.22)'
        : p.$tone === 'blue'
          ? 'rgba(130, 172, 214, 0.22)'
          : p.$tone === 'gold'
            ? 'rgba(233, 166, 78, 0.22)'
            : 'var(--dash-line)'};
`;

const STATUS_TONES = {
  new: 'gold',
  contacted: 'blue',
  qualified: 'blue',
  proposal: 'gold',
  quoted: 'gold',
  won: 'green',
  lost: 'red',
  pending: 'gold',
  confirmed: 'blue',
  processing: 'blue',
  packed: 'blue',
  shipped: 'green',
  delivered: 'green',
  cancelled: 'red',
  paid: 'green',
  authorized: 'blue',
  failed: 'red',
  refunded: 'neutral',
  published: 'green',
  draft: 'neutral',
  scheduled: 'blue',
  active: 'green',
  inactive: 'neutral',
  archived: 'neutral',
  in: 'green',
  low: 'gold',
  out: 'red',
  sent: 'blue',
  received: 'green',
  read: 'green',
  subscriber: 'blue',
  unsubscribed: 'neutral',
};

export function StatusBadge({ value }) {
  const label = String(value || '—').replace(/-/g, ' ');
  return <Badge $tone={STATUS_TONES[value] || 'neutral'}>{label}</Badge>;
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Spinner = styled.span`
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-top-color: var(--dash-accent);
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
`;

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '36px 8px', color: 'var(--dash-muted)', fontSize: 12.5 }}>
      <Spinner /> {label}
    </div>
  );
}

export const pulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
`;

export const SkeletonBar = styled.span`
  display: block;
  height: 10px;
  border-radius: 5px;
  background: var(--dash-panel-3);
  animation: ${pulse} 1.3s ease-in-out infinite;
  width: ${(p) => p.$w || '100%'};
`;

export function SkeletonRows({ rows = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '10px 2px' }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <SkeletonBar $w="34px" style={{ height: 34, borderRadius: 8 }} />
          <SkeletonBar $w={`${58 - index * 4}%`} />
          <SkeletonBar $w="14%" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = null, title = 'Nothing here yet', text = '', action = null }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--dash-muted)' }}>
      <div
        style={{
          width: 42,
          height: 42,
          margin: '0 auto 12px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: 12,
          background: 'var(--dash-panel-2)',
          border: '1px solid var(--dash-line)',
          color: 'var(--dash-accent)',
        }}
      >
        {icon || <Inbox size={19} />}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 650, color: 'var(--dash-ink)', marginBottom: 4 }}>{title}</h3>
      {text && <p style={{ fontSize: 12.5, maxWidth: 380, margin: '0 auto', lineHeight: 1.55 }}>{text}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 12px',
        borderRadius: 9,
        border: '1px solid rgba(224, 130, 114, 0.26)',
        background: 'var(--dash-red-soft)',
        color: 'var(--dash-red)',
        fontSize: 12.5,
        marginBottom: 14,
      }}
    >
      <AlertTriangle size={15} /> <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <Button type="button" $variant="ghost" onClick={onRetry} style={{ padding: '3px 9px', fontSize: 11.5, color: 'var(--dash-red)' }}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 14,
        fontSize: 11.5,
        color: 'var(--dash-muted)',
        flexWrap: 'wrap',
      }}
    >
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} records
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <Button type="button" $variant="outline" disabled={!meta.hasPrev} onClick={() => onPage(meta.page - 1)} style={{ padding: '6px 10px' }}>
          <ChevronLeft size={13} /> Prev
        </Button>
        <Button type="button" $variant="outline" disabled={!meta.hasNext} onClick={() => onPage(meta.page + 1)} style={{ padding: '6px 10px' }}>
          Next <ChevronRight size={13} />
        </Button>
      </div>
    </div>
  );
}

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(3, 5, 4, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 42px 18px;
  overflow-y: auto;
`;

export const ModalCard = styled.div`
  width: 100%;
  max-width: ${(p) => (p.$wide ? '960px' : '620px')};
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: 16px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  margin: auto 0;
  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 20px;
    border-bottom: 1px solid var(--dash-line);
    h2 { font-size: 16px; font-weight: 650; color: var(--dash-ink); }
    p { font-size: 12px; color: var(--dash-muted); margin-top: 3px; }
  }
  .body {
    padding: 20px;
    max-height: calc(100dvh - 210px);
    overflow-y: auto;
  }
  .foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 14px 20px;
    background: var(--dash-panel-2);
    border-top: 1px solid var(--dash-line);
    flex-wrap: wrap;
  }
`;

export function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <ModalOverlay onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <ModalCard $wide={wide} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className="head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton type="button" onClick={onClose} aria-label="Close">
            <X size={17} />
          </IconButton>
        </div>
        <div className="body">{children}</div>
        {footer && <div className="foot">{footer}</div>}
      </ModalCard>
    </ModalOverlay>
  );
}

const slideIn = keyframes`
  from { transform: translateX(26px); opacity: 0.4; }
  to { transform: translateX(0); opacity: 1; }
`;

const DrawerPanel = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 105;
  width: min(${(p) => p.$width || 520}px, 100vw);
  background: var(--dash-panel);
  border-left: 1px solid var(--dash-line);
  box-shadow: -24px 0 70px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.2s ease;
  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px;
    border-bottom: 1px solid var(--dash-line);
    flex-shrink: 0;
    h2 { font-size: 16px; font-weight: 650; color: var(--dash-ink); }
    p { font-size: 12px; color: var(--dash-muted); margin-top: 3px; }
  }
  .body { flex: 1; overflow-y: auto; padding: 20px; }
  .foot {
    padding: 14px 20px;
    border-top: 1px solid var(--dash-line);
    background: var(--dash-panel-2);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
`;

export function Drawer({ open, onClose, title, subtitle, children, footer, width }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 104, background: 'rgba(3, 5, 4, 0.62)', backdropFilter: 'blur(3px)' }}
      />
      <DrawerPanel $width={width} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className="head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton type="button" onClick={onClose} aria-label="Close">
            <X size={17} />
          </IconButton>
        </div>
        <div className="body">{children}</div>
        {footer && <div className="foot">{footer}</div>}
      </DrawerPanel>
    </>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  busy = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button type="button" $variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" $variant={tone === 'danger' ? 'danger' : undefined} onClick={onConfirm} disabled={busy}>
            {busy ? <Spinner /> : null} {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 13, color: 'var(--dash-muted)', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--dash-line)',
        marginBottom: 18,
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 13px 11px',
              fontSize: 12.5,
              fontWeight: active ? 650 : 500,
              color: active ? 'var(--dash-ink)' : 'var(--dash-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <Badge $tone={active ? 'gold' : 'neutral'}>{tab.count}</Badge>
            )}
            {active && (
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  right: 8,
                  bottom: -1,
                  height: 2,
                  borderRadius: 2,
                  background: 'var(--dash-accent)',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

const toastIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const ToastWrap = styled.div`
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 130;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.$tone === 'error' ? 'rgba(224, 130, 114, 0.4)' : 'var(--dash-line)')};
  background: ${(p) => (p.$tone === 'error' ? '#2a1714' : 'var(--dash-panel-3)')};
  color: ${(p) => (p.$tone === 'error' ? '#f0a294' : 'var(--dash-ink)')};
  font-size: 12.5px;
  line-height: 1.5;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  animation: ${toastIn} 0.18s ease;
  svg { flex-shrink: 0; margin-top: 1px; }
`;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const notify = useCallback((message, tone = 'success') => {
    counter.current += 1;
    const id = counter.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastWrap>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} $tone={toast.tone}>
            {toast.tone === 'error' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span>{toast.message}</span>
          </ToastItem>
        ))}
      </ToastWrap>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context || { notify: () => {} };
}

export function MediaPicker({ open, onClose, onSelect, multiple = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState('');
  const fileRef = useRef(null);
  const selectedRef = useRef([]);
  const [selected, setSelected] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiRequest('/api/media?pageSize=60');
      setItems(payload.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      load();
      setSelected([]);
      selectedRef.current = [];
      setQ('');
    }
  }, [open, load]);

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const payload = await apiRequest('/api/media', { method: 'POST', body: form });
      await load();
      if (payload.data?.url) {
        if (multiple) {
          selectedRef.current = [...selectedRef.current, payload.data.url];
          setSelected(selectedRef.current);
        } else {
          onSelect(payload.data.url);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const visible = items.filter((item) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return `${item.filename || ''} ${item.alt || ''}`.toLowerCase().includes(needle);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Media library"
      subtitle={multiple ? 'Select one or more images.' : 'Choose an image or upload a new one.'}
      wide
      footer={
        <>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
          <Button type="button" $variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Spinner /> : <Upload size={14} />} Upload new
          </Button>
          {multiple ? (
            <Button
              type="button"
              onClick={() => {
                selected.forEach((url) => onSelect(url));
                onClose();
              }}
            >
              Add {selected.length || ''} selected
            </Button>
          ) : (
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          )}
        </>
      }
    >
      {error && <ErrorBlock message={error} onRetry={load} />}
      <div style={{ marginBottom: 12 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Filter media…" />
      </div>
      {loading ? (
        <LoadingBlock label="Loading media…" />
      ) : visible.length === 0 ? (
        <EmptyState icon={<ImagePlus size={19} />} title="No media found" text="Upload an image to start building your library." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {visible.map((item) => {
            const isSelected = selected.includes(item.url);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (!multiple) {
                    onSelect(item.url);
                    onClose();
                    return;
                  }
                  const next = isSelected
                    ? selected.filter((url) => url !== item.url)
                    : [...selected, item.url];
                  selectedRef.current = next;
                  setSelected(next);
                }}
                style={{
                  border: `1px solid ${isSelected ? 'var(--dash-accent)' : 'var(--dash-line)'}`,
                  borderRadius: 9,
                  overflow: 'hidden',
                  background: 'var(--dash-panel-2)',
                  textAlign: 'left',
                  padding: 0,
                }}
              >
                <span style={{ display: 'block', aspectRatio: '1 / 1', background: `#fff url(${item.url}) center / cover no-repeat` }} />
                <span
                  style={{
                    display: 'block',
                    padding: '6px 8px',
                    fontSize: 10.5,
                    color: isSelected ? 'var(--dash-accent)' : 'var(--dash-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.filename || item.alt || 'Image'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export function ImageField({ label = 'Image', value, onChange, hint }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const payload = await apiRequest('/api/media', { method: 'POST', body: form });
      onChange(payload.data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 9,
            border: '1px solid var(--dash-line)',
            background: value ? `#fff url(${value}) center / cover no-repeat` : 'var(--dash-panel-2)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: 'var(--dash-faint)',
            overflow: 'hidden',
          }}
        >
          {!value && <ImageIcon size={20} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="https://… or /images/…" />
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
            <Button type="button" $variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '5px 9px', fontSize: 11 }}>
              {uploading ? <Spinner /> : <Upload size={12} />} Upload
            </Button>
            <Button type="button" $variant="ghost" onClick={() => setPickerOpen(true)} style={{ padding: '5px 9px', fontSize: 11 }}>
              <ImagePlus size={12} /> Library
            </Button>
            {value && (
              <Button type="button" $variant="ghost" onClick={() => onChange('')} style={{ padding: '5px 9px', fontSize: 11 }}>
                <Trash2 size={12} /> Clear
              </Button>
            )}
          </div>
          {error && <span style={{ display: 'block', marginTop: 5, fontSize: 10.5, color: 'var(--dash-red)' }}>{error}</span>}
        </div>
      </div>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} />
    </Field>
  );
}

export function ImageListField({ label = 'Images', value = [], onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const list = Array.isArray(value) ? value : [];

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const payload = await apiRequest('/api/media', { method: 'POST', body: form });
      onChange([...list, payload.data.url]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Field label={label} hint={`${list.length} image${list.length === 1 ? '' : 's'}`} full>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {list.map((url, index) => (
          <div
            key={`${url}-${index}`}
            style={{
              position: 'relative',
              width: 78,
              height: 78,
              borderRadius: 9,
              border: '1px solid var(--dash-line)',
              background: `#fff url(${url}) center / cover no-repeat`,
            }}
          >
            <button
              type="button"
              onClick={() => onChange(list.filter((_, i) => i !== index))}
              aria-label="Remove image"
              style={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'rgba(8, 10, 9, 0.78)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
          <Button type="button" $variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '7px 10px', fontSize: 11 }}>
            {uploading ? <Spinner /> : <Plus size={13} />} Upload
          </Button>
          <Button type="button" $variant="ghost" onClick={() => setPickerOpen(true)} style={{ padding: '7px 10px', fontSize: 11 }}>
            <ImagePlus size={13} /> Library
          </Button>
        </div>
      </div>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => (Array.isArray(url) ? onChange([...list, ...url]) : onChange([...list, url]))}
        multiple
      />
    </Field>
  );
}

export { Loader2 };
