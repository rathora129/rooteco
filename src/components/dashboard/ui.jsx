'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import theme from '@/styles/theme';
import { apiRequest } from '@/components/dashboard/hooks';

export const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  .eyebrow {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${theme.colors.green};
    margin-bottom: 6px;
  }
  h1 {
    font-size: clamp(26px, 3vw, 34px);
    color: ${theme.colors.forest};
    letter-spacing: -0.02em;
    margin-bottom: 5px;
  }
  p {
    font-size: 13.5px;
    color: ${theme.colors.muted};
    max-width: 640px;
  }
  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

export const Card = styled.section`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: ${(p) => p.$pad || '22px'};
  box-shadow: 0 1px 0 rgba(11, 61, 46, 0.03);
  ${(p) => (p.$sticky ? 'position: sticky; top: 88px;' : '')}
`;

const buttonStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: ${theme.radius.pill};
  font-size: 13px;
  font-weight: 600;
  padding: 10px 18px;
  border: 1.5px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
  svg { width: 15px; height: 15px; }
`;

export const Button = styled.button`
  ${buttonStyles}
  background: ${(p) =>
    p.$variant === 'outline' || p.$variant === 'ghost'
      ? 'transparent'
      : p.$variant === 'danger'
        ? '#8f2a1c'
        : theme.colors.forest};
  color: ${(p) =>
    p.$variant === 'outline' || p.$variant === 'ghost'
      ? p.$variant === 'ghost'
        ? theme.colors.muted
        : theme.colors.forest
      : '#fff'};
  border-color: ${(p) =>
    p.$variant === 'outline'
      ? theme.colors.line
      : p.$variant === 'ghost'
        ? 'transparent'
        : p.$variant === 'danger'
          ? '#8f2a1c'
          : theme.colors.forest};
  &:hover:not(:disabled) {
    background: ${(p) =>
      p.$variant === 'outline' || p.$variant === 'ghost'
        ? theme.colors.cream
        : p.$variant === 'danger'
          ? '#7a2418'
          : '#0f4d3a'};
    transform: translateY(-1px);
  }
`;

export const ButtonLink = styled.a`
  ${buttonStyles}
  background: ${theme.colors.forest};
  color: #fff;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${(p) => (p.$cols ? `repeat(${p.$cols}, 1fr)` : '1fr 1fr')};
  gap: 16px;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Full = styled.div`
  grid-column: 1 / -1;
`;

const FieldWrap = styled.div`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.ink};
  .label {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 6px;
    .req {
      color: ${theme.colors.sale};
    }
    .hint {
      margin-left: auto;
      font-size: 11px;
      font-weight: 400;
      color: ${theme.colors.muted};
    }
  }
`;

const controlStyles = `
  width: 100%;
  border: 1.5px solid ${theme.colors.line};
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  font-size: 13.5px;
  color: ${theme.colors.ink};
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  &::placeholder { color: #9aa59d; }
  &:focus { border-color: ${theme.colors.forest}; box-shadow: 0 0 0 3px rgba(11, 61, 46, 0.08); }
  &:disabled { background: ${theme.colors.cream}; }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Select = styled.select`
  ${controlStyles}
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C6B62' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 34px;
`;

export const Textarea = styled.textarea`
  ${controlStyles}
  min-height: ${(p) => (p.$tall ? '220px' : '92px')};
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
  gap: 9px;
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.ink};
  cursor: pointer;
  input {
    width: 16px;
    height: 16px;
    accent-color: ${theme.colors.forest};
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  .search {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 340px;
    svg {
      position: absolute;
      left: 11px;
      top: 50%;
      transform: translateY(-50%);
      width: 15px;
      height: 15px;
      color: ${theme.colors.muted};
    }
    input {
      padding-left: 34px;
    }
  }
  .spacer {
    flex: 1;
  }
`;

export const TableScroll = styled.div`
  overflow-x: auto;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  background: #fff;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th {
    text-align: left;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
    background: ${theme.colors.cream};
    padding: 11px 14px;
    white-space: nowrap;
    border-bottom: 1px solid ${theme.colors.line};
  }
  td {
    padding: 12px 14px;
    border-bottom: 1px solid #f0ebdf;
    vertical-align: middle;
    color: ${theme.colors.ink};
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  tbody tr:hover {
    background: #fcfaf4;
  }
  .actions {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }
  .muted {
    color: ${theme.colors.muted};
    font-size: 12px;
  }
  .strong {
    font-weight: 600;
  }
`;

const badgeTones = {
  neutral: ['#efe9dc', '#5C6B62'],
  green: ['#e4efdc', '#3f6a28'],
  gold: ['#f6edcf', '#8a6d12'],
  red: ['#f9e7e3', '#9b3222'],
  blue: ['#e2ecf5', '#2c5878'],
  dark: ['#0B3D2E', '#F6F1E7'],
};

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: ${theme.radius.pill};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
  background: ${(p) => (badgeTones[p.$tone] || badgeTones.neutral)[0]};
  color: ${(p) => (badgeTones[p.$tone] || badgeTones.neutral)[1]};
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
  in: 'green',
  low: 'gold',
  out: 'red',
  sent: 'blue',
  received: 'green',
  read: 'green',
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
  width: 16px;
  height: 16px;
  border: 2px solid rgba(11, 61, 46, 0.2);
  border-top-color: ${theme.colors.forest};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '34px 10px', color: theme.colors.muted, fontSize: 13 }}>
      <Spinner /> {label}
    </div>
  );
}

export function EmptyState({ icon = null, title = 'Nothing here yet', text = '', action = null }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '46px 20px',
        color: theme.colors.muted,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: theme.colors.green }}>
        {icon || <ImageIcon size={28} />}
      </div>
      <h3 style={{ fontSize: 20, color: theme.colors.forest, marginBottom: 4 }}>{title}</h3>
      {text && <p style={{ fontSize: 13, maxWidth: 380, margin: '0 auto' }}>{text}</p>}
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
        gap: 10,
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid rgba(176, 58, 46, 0.3)',
        background: 'rgba(176, 58, 46, 0.07)',
        color: theme.colors.sale,
        fontSize: 13,
        marginBottom: 14,
      }}
    >
      <AlertTriangle size={16} /> {message}
      {onRetry && (
        <Button type="button" $variant="ghost" onClick={onRetry} style={{ marginLeft: 'auto', padding: '4px 10px' }}>
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
        marginTop: 16,
        fontSize: 12.5,
        color: theme.colors.muted,
        flexWrap: 'wrap',
      }}
    >
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} records
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <Button
          type="button"
          $variant="outline"
          disabled={!meta.hasPrev}
          onClick={() => onPage(meta.page - 1)}
          style={{ padding: '6px 12px' }}
        >
          <ChevronLeft size={14} /> Prev
        </Button>
        <Button
          type="button"
          $variant="outline"
          disabled={!meta.hasNext}
          onClick={() => onPage(meta.page + 1)}
          style={{ padding: '6px 12px' }}
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(11, 32, 24, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 18px;
  overflow-y: auto;
`;

export const ModalCard = styled.div`
  width: 100%;
  max-width: ${(p) => (p.$wide ? '1000px' : '680px')};
  background: ${theme.colors.cream};
  border-radius: 18px;
  box-shadow: ${theme.shadow.lift};
  overflow: hidden;
  margin: auto 0;
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 22px;
    background: #fff;
    border-bottom: 1px solid ${theme.colors.line};
    h2 {
      font-size: 22px;
      color: ${theme.colors.forest};
    }
    .close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: ${theme.colors.muted};
      &:hover {
        background: ${theme.colors.cream};
        color: ${theme.colors.forest};
      }
    }
  }
  .body {
    padding: 22px;
    max-height: calc(100dvh - 190px);
    overflow-y: auto;
  }
  .foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 22px;
    background: #fff;
    border-top: 1px solid ${theme.colors.line};
    flex-wrap: wrap;
  }
`;

export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <ModalOverlay onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <ModalCard $wide={wide}>
        <div className="head">
          <h2>{title}</h2>
          <button type="button" className="close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="body">{children}</div>
        {footer && <div className="foot">{footer}</div>}
      </ModalCard>
    </ModalOverlay>
  );
}

const toastIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ToastWrap = styled.div`
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 120;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 360px;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 14px;
  border-radius: 10px;
  background: ${(p) => (p.$tone === 'error' ? '#8f2a1c' : theme.colors.forest)};
  color: #fff;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: ${theme.shadow.card};
  animation: ${toastIn} 0.2s ease;
  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
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
            {toast.tone === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
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
  const fileRef = useRef(null);

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
    if (open) load();
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
      if (payload.data?.url) onSelect(payload.data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Media library"
      wide
      footer={
        <>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
          <Button type="button" $variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Spinner /> : <Upload size={15} />} Upload new
          </Button>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      {error && <ErrorBlock message={error} onRetry={load} />}
      {loading ? (
        <LoadingBlock label="Loading media…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ImagePlus size={28} />}
          title="No media yet"
          text="Upload an image to start building your library."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 10,
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item.url);
                if (!multiple) onClose();
              }}
              style={{
                border: `1px solid ${theme.colors.line}`,
                borderRadius: 10,
                overflow: 'hidden',
                background: '#fff',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  display: 'block',
                  aspectRatio: '1 / 1',
                  background: `#fff url(${item.url}) center / cover no-repeat`,
                }}
              />
              <span
                style={{
                  display: 'block',
                  padding: '6px 8px',
                  fontSize: 11,
                  color: theme.colors.muted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.filename || item.alt || 'Image'}
              </span>
            </button>
          ))}
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
            width: 76,
            height: 76,
            borderRadius: 10,
            border: `1px solid ${theme.colors.line}`,
            background: value ? `#fff url(${value}) center / cover no-repeat` : theme.colors.cream,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: theme.colors.muted,
            overflow: 'hidden',
          }}
        >
          {!value && <ImageIcon size={22} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Input
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://… or /images/…"
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
            <Button
              type="button"
              $variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ padding: '5px 10px', fontSize: 11.5 }}
            >
              {uploading ? <Spinner /> : <Upload size={13} />} Upload
            </Button>
            <Button
              type="button"
              $variant="ghost"
              onClick={() => setPickerOpen(true)}
              style={{ padding: '5px 10px', fontSize: 11.5 }}
            >
              <ImagePlus size={13} /> Library
            </Button>
            {value && (
              <Button
                type="button"
                $variant="ghost"
                onClick={() => onChange('')}
                style={{ padding: '5px 10px', fontSize: 11.5 }}
              >
                <Trash2 size={13} /> Clear
              </Button>
            )}
          </div>
          {error && <span style={{ display: 'block', marginTop: 5, fontSize: 11, color: theme.colors.sale }}>{error}</span>}
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
              width: 84,
              height: 84,
              borderRadius: 10,
              border: `1px solid ${theme.colors.line}`,
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
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(11, 32, 24, 0.72)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
          <Button
            type="button"
            $variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ padding: '7px 12px' }}
          >
            {uploading ? <Spinner /> : <Plus size={14} />} Upload
          </Button>
          <Button
            type="button"
            $variant="ghost"
            onClick={() => setPickerOpen(true)}
            style={{ padding: '7px 12px' }}
          >
            <ImagePlus size={14} /> Library
          </Button>
        </div>
      </div>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange([...list, url])}
      />
    </Field>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search">
      <Search />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}
