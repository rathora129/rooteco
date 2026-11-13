/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  Check,
  Copy,
  ImagePlus,
  Link2,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
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
  IconButton,
  Input,
  PageHeader,
  Pagination,
  SearchBox,
  SkeletonRows,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, useDebounced, useList } from '@/components/dashboard/hooks';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
`;

const Tile = styled.div`
  background: var(--dash-panel-2);
  border: 1px solid var(--dash-line);
  border-radius: 11px;
  overflow: hidden;
  transition: border-color 0.14s ease, transform 0.14s ease;
  &:hover { border-color: rgba(233, 166, 78, 0.32); }
  .thumb {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    background: var(--dash-bg);
    border-bottom: 1px solid var(--dash-line);
    cursor: zoom-in;
    padding: 0;
    border-top: 0;
    border-left: 0;
    border-right: 0;
    overflow: hidden;
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.2s ease;
    }
    &:hover img { transform: scale(1.03); }
  }
  .meta {
    padding: 8px 11px;
    .name {
      font-size: 12px;
      font-weight: 600;
      color: var(--dash-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub {
      font-size: 10.5px;
      color: var(--dash-faint);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .actions {
    display: flex;
    gap: 2px;
    padding: 0 6px 6px;
    .spacer { flex: 1; }
  }
`;

const DropZone = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px dashed ${(p) => (p.$over ? 'var(--dash-accent)' : 'var(--dash-line)')};
  background: ${(p) => (p.$over ? 'var(--dash-accent-soft)' : 'var(--dash-panel)')};
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.14s ease, background 0.14s ease;
  .ic {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    background: var(--dash-panel-2);
    border: 1px solid var(--dash-line);
    color: var(--dash-accent);
    flex-shrink: 0;
    svg { width: 16px; height: 16px; }
  }
  .txt { flex: 1; min-width: 0; }
  .title { font-size: 12.5px; color: var(--dash-ink); }
  .hint { font-size: 11px; color: var(--dash-faint); margin-top: 1px; }
`;

function prettySize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Cloudinary can serve a resized derivative; other providers fall back to the original file.
function thumbUrl(url, width = 480) {
  if (!url) return url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

export default function MediaModule() {
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounced(q, 300);
  const { data, meta, loading, error, refresh } = useList('/api/media', {
    q: debouncedQ,
    page,
    pageSize: 24,
  });

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ alt: '', filename: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [urlOpen, setUrlOpen] = useState(false);
  const [urlForm, setUrlForm] = useState({ url: '', alt: '', filename: '' });
  const [urlError, setUrlError] = useState('');

  const uploadCount = uploading ? `${uploading.done}/${uploading.total}` : '';

  async function uploadFiles(files) {
    const images = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
    if (!images.length) return;

    setUploading({ done: 0, total: images.length });
    let failures = 0;
    for (const file of images) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await apiRequest('/api/media', { method: 'POST', body: formData });
      } catch {
        failures += 1;
      }
      setUploading((prev) => ({ done: (prev?.done || 0) + 1, total: images.length }));
    }

    setUploading(null);
    if (failures === 0) {
      notify(images.length === 1 ? 'Image uploaded.' : `${images.length} images uploaded.`);
    } else {
      notify(
        failures === images.length
          ? 'Upload failed. Check the storage configuration and try again.'
          : `${images.length - failures} uploaded, ${failures} failed.`,
        'error'
      );
    }
    setPage(1);
    refresh();
  }

  function onDrop(event) {
    event.preventDefault();
    setDragOver(false);
    uploadFiles(event.dataTransfer.files);
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
      notify('Image details saved.');
      setActive(null);
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    setSaving(true);
    try {
      await apiRequest(`/api/media/${item.id}`, { method: 'DELETE' });
      notify('Image deleted.');
      setConfirmDelete(null);
      if (active?.id === item.id) setActive(null);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
      setConfirmDelete(null);
    } finally {
      setSaving(false);
    }
  }

  async function addExternal() {
    if (!urlForm.url.trim()) {
      setUrlError('Paste an image URL or a path starting with /.');
      return;
    }
    setSaving(true);
    setUrlError('');
    try {
      await apiRequest('/api/media', {
        method: 'POST',
        body: JSON.stringify({
          url: urlForm.url.trim(),
          alt: urlForm.alt.trim() || undefined,
          filename: urlForm.filename.trim() || undefined,
        }),
      });
      notify('Image added to the library.');
      setUrlOpen(false);
      setUrlForm({ url: '', alt: '', filename: '' });
      setPage(1);
      refresh();
    } catch (err) {
      setUrlError(err.message);
    } finally {
      setSaving(false);
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

  const providerSummary = useMemo(() => {
    const providers = new Set(data.map((item) => item.provider).filter(Boolean));
    return providers.size ? [...providers].join(' · ') : 'storage ready';
  }, [data]);

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Website Studio</span>
          <h1>Media library</h1>
          <p>
            Upload images for products, banners, pages and the journal. Cloudinary or Supabase
            Storage is used when configured; local storage is development-only.
          </p>
        </div>
        <div className="actions">
          <Button type="button" $variant="outline" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button type="button" $variant="outline" onClick={() => { setUrlError(''); setUrlOpen(true); }}>
            <Link2 size={14} /> Add by URL
          </Button>
          <Button type="button" onClick={() => fileRef.current?.click()} disabled={Boolean(uploading)}>
            <Upload size={15} /> {uploading ? `Uploading ${uploadCount}` : 'Upload images'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              uploadFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
      </PageHeader>

      <DropZone
        $over={dragOver}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileRef.current?.click();
          }
        }}
      >
        <span className="ic">{uploading ? <RefreshCw /> : <ImagePlus />}</span>
        <div className="txt">
          <div className="title">
            {dragOver ? 'Drop to upload' : uploading ? `Uploading ${uploadCount}…` : 'Drag images here or click to browse'}
          </div>
          <div className="hint">
            JPG, PNG, WebP or AVIF · {meta?.total ?? 0} assets · {providerSummary}
          </div>
        </div>
        <Badge $tone="neutral">multiple supported</Badge>
      </DropZone>

      <Card>
        <Toolbar>
          <SearchBox
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(1);
            }}
            placeholder="Search by filename, alt text or URL…"
          />
          <div className="spacer" />
          <span style={{ fontSize: 11.5, color: 'var(--dash-faint)' }}>
            {meta?.total ?? 0} matching
          </span>
        </Toolbar>

        {error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonRows rows={4} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={<ImagePlus size={26} />}
            title={q ? 'No media matches' : 'No media yet'}
            text={
              q
                ? 'Try a different filename, alt text or URL.'
                : 'Upload product photos, banner artwork and editorial images to use across the site.'
            }
            action={
              <Button type="button" onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> Upload images
              </Button>
            }
          />
        ) : (
          <>
            <Grid>
              {data.map((item) => (
                <Tile key={item.id}>
                  <button
                    type="button"
                    className="thumb"
                    onClick={() => openPreview(item)}
                    aria-label={`Preview ${item.filename || 'image'}`}
                  >
                    <img
                      src={thumbUrl(item.url)}
                      alt={item.alt || item.filename || ''}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                  <div className="meta">
                    <div className="name" title={item.filename || item.url}>
                      {item.filename || 'Untitled image'}
                    </div>
                    <div className="sub">
                      {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
                      {prettySize(item.size)} · {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <div className="actions">
                    <IconButton type="button" onClick={() => openPreview(item)} aria-label="Edit image details">
                      <Pencil size={13} />
                    </IconButton>
                    <IconButton type="button" onClick={() => copy(item.url)} aria-label="Copy image URL">
                      <Copy size={13} />
                    </IconButton>
                    <div className="spacer" />
                    <IconButton
                      type="button"
                      onClick={() => setConfirmDelete(item)}
                      aria-label="Delete image"
                      style={{ color: 'var(--dash-red)' }}
                    >
                      <Trash2 size={13} />
                    </IconButton>
                  </div>
                </Tile>
              ))}
            </Grid>
            <Pagination meta={meta} onPage={setPage} />
          </>
        )}
      </Card>

      <Drawer
        open={Boolean(active)}
        onClose={() => setActive(null)}
        width={620}
        title="Image details"
        subtitle={active?.filename || 'Media asset'}
        footer={
          <>
            <Button
              type="button"
              $variant="ghost"
              onClick={() => active && setConfirmDelete(active)}
              style={{ color: 'var(--dash-red)', marginRight: 'auto' }}
            >
              <Trash2 size={14} /> Delete
            </Button>
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
                borderRadius: 11,
                border: '1px solid var(--dash-line)',
                background: `var(--dash-bg) url(${active.url}) center / contain no-repeat`,
                height: 280,
                marginBottom: 18,
              }}
            />
            <FormGrid $cols={2}>
              <Field label="Filename">
                <Input
                  value={form.filename}
                  onChange={(event) => setForm((prev) => ({ ...prev, filename: event.target.value }))}
                />
              </Field>
              <Field label="Alt text" hint="Describe the image for screen readers">
                <Input
                  value={form.alt}
                  onChange={(event) => setForm((prev) => ({ ...prev, alt: event.target.value }))}
                />
              </Field>
              <Field label="Image URL" full>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input value={active.url} readOnly onFocus={(event) => event.target.select()} />
                  <IconButton type="button" onClick={() => copy(active.url)} aria-label="Copy image URL">
                    <Copy size={14} />
                  </IconButton>
                </div>
              </Field>
              <Field label="Storage">
                <Input value={active.provider || 'external'} readOnly />
              </Field>
              <Field label="Dimensions">
                <Input
                  value={active.width && active.height ? `${active.width} × ${active.height}` : '—'}
                  readOnly
                />
              </Field>
              <Field label="File size">
                <Input value={prettySize(active.size)} readOnly />
              </Field>
              <Field label="Uploaded">
                <Input value={formatDate(active.createdAt)} readOnly />
              </Field>
            </FormGrid>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                marginTop: 14,
                fontSize: 11.5,
                color: 'var(--dash-faint)',
              }}
            >
              <Check size={13} /> Copy the URL to reuse this image in products, banners and page
              sections.
            </div>
          </>
        )}
      </Drawer>

      <Drawer
        open={urlOpen}
        onClose={() => setUrlOpen(false)}
        width={480}
        title="Add image by URL"
        subtitle="Reference an existing Cloudinary or external image"
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setUrlOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={addExternal} disabled={saving}>
              {saving ? 'Adding…' : 'Add image'}
            </Button>
          </>
        }
      >
        {urlError && <ErrorBlock message={urlError} />}
        <FormGrid $cols={1}>
          <Field label="Image URL" required hint="https://… or a path starting with /">
            <Input
              value={urlForm.url}
              onChange={(event) => setUrlForm((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="https://res.cloudinary.com/…"
            />
          </Field>
          <Field label="Filename">
            <Input
              value={urlForm.filename}
              onChange={(event) => setUrlForm((prev) => ({ ...prev, filename: event.target.value }))}
              placeholder="Defaults to the file name"
            />
          </Field>
          <Field label="Alt text">
            <Input
              value={urlForm.alt}
              onChange={(event) => setUrlForm((prev) => ({ ...prev, alt: event.target.value }))}
            />
          </Field>
        </FormGrid>
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && remove(confirmDelete)}
        busy={saving}
        title="Delete this image?"
        message={
          confirmDelete
            ? `${confirmDelete.filename || 'This image'} will be removed from the library. Check products, banners and pages that use it first.`
            : ''
        }
        confirmLabel="Delete image"
      />
    </>
  );
}
