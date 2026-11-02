/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState } from 'react';
import styled from 'styled-components';
import { Copy, ImagePlus, Pencil, Trash2, Upload } from 'lucide-react';
import theme from '@/styles/theme';
import {
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  Field,
  FormGrid,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Pagination,
  SearchBox,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, useDebounced, useList } from '@/components/dashboard/hooks';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
`;

const Tile = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: 12px;
  overflow: hidden;
  .thumb {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    background: ${theme.colors.cream} center / cover no-repeat;
    border-bottom: 1px solid ${theme.colors.line};
    cursor: zoom-in;
  }
  .meta {
    padding: 9px 11px;
    .name {
      font-size: 12px;
      font-weight: 600;
      color: ${theme.colors.ink};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub {
      font-size: 10.5px;
      color: ${theme.colors.muted};
      margin-top: 2px;
    }
  }
  .actions {
    display: flex;
    gap: 2px;
    padding: 0 6px 7px;
    button {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border-radius: 7px;
      color: ${theme.colors.muted};
      &:hover {
        background: ${theme.colors.cream};
        color: ${theme.colors.forest};
      }
    }
  }
`;

function prettySize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaModule() {
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 300);
  const { data, meta, loading, error, refresh } = useList('/api/media', { q: debouncedQ, page, pageSize: 24 });

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ alt: '', filename: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function upload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await apiRequest('/api/media', { method: 'POST', body: formData });
      }
      notify(files.length === 1 ? 'Image uploaded.' : `${files.length} images uploaded.`);
      setPage(1);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function openPreview(item) {
    setActive(item);
    setForm({ alt: item.alt || '', filename: item.filename || '' });
    setFormError('');
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    setFormError('');
    try {
      await apiRequest(`/api/media/${active.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      notify('Media details saved.');
      setActive(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete ${item.filename || 'this image'}? This cannot be undone.`)) return;
    try {
      await apiRequest(`/api/media/${item.id}`, { method: 'DELETE' });
      notify('Image deleted.');
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function copy(url) {
    try {
      await navigator.clipboard.writeText(url);
      notify('URL copied.');
    } catch {
      notify('Could not copy the URL.', 'error');
    }
  }

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Content</span>
          <h1>Media library</h1>
          <p>
            Upload and manage images used across products, banners, blogs and pages. Cloudinary or
            Supabase Storage is used when configured; local storage is development-only.
          </p>
        </div>
        <div className="actions">
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={upload} />
          <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : <><Upload size={15} /> Upload images</>}
          </Button>
        </div>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchBox value={q} onChange={(value) => { setQ(value); setPage(1); }} placeholder="Search by filename or alt text…" />
        </Toolbar>
        {error && <ErrorBlock message={error} onRetry={refresh} />}
        {loading ? (
          <LoadingBlock label="Loading media…" />
        ) : data.length === 0 ? (
          <EmptyState
            icon={<ImagePlus size={28} />}
            title="No media yet"
            text="Upload product photos, banner artwork and editorial images to use across the site."
          />
        ) : (
          <>
            <Grid>
              {data.map((item) => (
                <Tile key={item.id}>
                  <button
                    type="button"
                    className="thumb"
                    style={{ backgroundImage: `url(${item.url})`, border: 0, padding: 0 }}
                    onClick={() => openPreview(item)}
                    aria-label={`Preview ${item.filename || 'image'}`}
                  />
                  <div className="meta">
                    <div className="name" title={item.filename || item.url}>
                      {item.filename || 'Untitled image'}
                    </div>
                    <div className="sub">
                      {item.mime || 'image'} · {prettySize(item.size)} · {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <div className="actions">
                    <button type="button" onClick={() => openPreview(item)} title="Edit metadata">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => copy(item.url)} title="Copy URL">
                      <Copy size={14} />
                    </button>
                    <button type="button" onClick={() => remove(item)} title="Delete" style={{ color: theme.colors.sale }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Tile>
              ))}
            </Grid>
            <Pagination meta={meta} onPage={(next) => setPage(next)} />
          </>
        )}
      </Card>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title="Image details"
        wide
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setActive(null)}>
              Close
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save details'}
            </Button>
          </>
        }
      >
        {active && (
          <>
            {formError && <ErrorBlock message={formError} />}
            <div
              style={{
                borderRadius: 14,
                border: `1px solid ${theme.colors.line}`,
                background: `#fff url(${active.url}) center / contain no-repeat`,
                height: 300,
                marginBottom: 18,
              }}
            />
            <FormGrid>
              <Field label="Filename">
                <Input value={form.filename} onChange={(event) => setForm((prev) => ({ ...prev, filename: event.target.value }))} />
              </Field>
              <Field label="Alt text">
                <Input value={form.alt} onChange={(event) => setForm((prev) => ({ ...prev, alt: event.target.value }))} />
              </Field>
              <Field label="Image URL" full>
                <Input value={active.url} readOnly onFocus={(event) => event.target.select()} />
              </Field>
              <Field label="Storage">
                <Input value={active.provider || 'external'} readOnly />
              </Field>
              <Field label="Dimensions">
                <Input value={active.width && active.height ? `${active.width} × ${active.height}` : '—'} readOnly />
              </Field>
            </FormGrid>
          </>
        )}
      </Modal>
    </>
  );
}
