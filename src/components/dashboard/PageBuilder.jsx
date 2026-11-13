'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Monitor,
  Plus,
  Save as SaveIcon,
  Smartphone,
  Tablet,
  Trash2,
  X,
} from 'lucide-react';
import styled from 'styled-components';
import {
  Badge,
  Button,
  Card,
  ErrorBlock,
  Field,
  ImageField,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

const SECTION_LIBRARY = [
  { type: 'text', label: 'Text block', hint: 'Heading, paragraphs and an optional image.' },
  { type: 'hero', label: 'Hero banner', hint: 'Large opening statement with a button.' },
  { type: 'image', label: 'Image + text', hint: 'Side-by-side image and copy.' },
  { type: 'collection', label: 'Collection spotlight', hint: 'Promote a category or collection.' },
  { type: 'story', label: 'Story', hint: 'Narrative block with optional image.' },
  { type: 'process', label: 'Process steps', hint: 'Numbered list of steps.' },
  { type: 'columns', label: 'Columns', hint: 'Two to four content cards.' },
  { type: 'quote', label: 'Quote', hint: 'Pull quote with attribution.' },
  { type: 'cta', label: 'Call to action', hint: 'Bold banner with a button.' },
];

const TYPE_LABELS = Object.fromEntries(SECTION_LIBRARY.map((item) => [item.type, item.label]));

const uid = () =>
  globalThis.crypto?.randomUUID?.() || `section-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function normalizeSections(sections) {
  return (Array.isArray(sections) ? sections : []).map((section) => ({
    localKey: section.id || uid(),
    id: section.id,
    type: section.type || 'text',
    heading: section.heading || '',
    body: section.body || '',
    image: section.image || '',
    data: section.data && typeof section.data === 'object' ? section.data : {},
  }));
}

function serializeSections(sections) {
  return sections.map((section) => ({
    type: section.type || 'text',
    heading: section.heading || null,
    body: section.body || null,
    image: section.image || null,
    data: Object.keys(section.data || {}).length ? section.data : null,
  }));
}

function isVisible(section) {
  return section.data?.visible !== false;
}

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
  @media (max-width: 1080px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  @media (min-width: 1081px) {
    position: sticky;
    top: 88px;
  }
`;

const SectionCard = styled.div`
  background: var(--re-white);
  border: 1px solid ${(p) => (p.$hidden ? 'rgba(240, 162, 59, 0.28)' : theme.colors.line)};
  border-radius: 12px;
  overflow: hidden;
  opacity: ${(p) => (p.$hidden ? 0.68 : 1)};
  transition: border-color 0.16s ease, opacity 0.16s ease, box-shadow 0.16s ease;
  ${(p) => p.$dragging && `box-shadow: 0 0 0 2px rgba(240, 162, 59, 0.45);`}
  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 12px;
  }
  .grip {
    display: grid;
    place-items: center;
    color: ${theme.colors.muted};
    cursor: grab;
    padding: 2px;
    border-radius: 6px;
    &:active {
      cursor: grabbing;
    }
    &:hover {
      background: rgba(255, 255, 255, 0.06);
      color: ${theme.colors.ink};
    }
  }
  .num {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(240, 162, 59, 0.14);
    color: ${theme.colors.accent};
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .meta {
    min-width: 0;
    flex: 1;
    strong {
      display: block;
      font-size: 13.5px;
      color: ${theme.colors.ink};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    span {
      display: block;
      font-size: 11px;
      color: ${theme.colors.muted};
      margin-top: 1px;
    }
  }
  .tools {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }
  .body {
    border-top: 1px solid ${theme.colors.line};
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }
  .visible-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: ${theme.colors.ink};
  }
`;

const LibraryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  button {
    text-align: left;
    border: 1px solid ${theme.colors.line};
    background: rgba(255, 255, 255, 0.035);
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    color: ${theme.colors.ink};
    font-size: 12px;
    font-weight: 600;
    line-height: 1.3;
    transition: border-color 0.15s ease, background 0.15s ease;
    span {
      display: block;
      margin-top: 3px;
      font-size: 10.5px;
      font-weight: 400;
      color: ${theme.colors.muted};
    }
    &:hover {
      border-color: rgba(240, 162, 59, 0.55);
      background: rgba(240, 162, 59, 0.08);
    }
  }
`;

const PreviewOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: rgba(4, 8, 6, 0.9);
  .bar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: ${theme.colors.ink};
  }
  .title {
    font-size: 13px;
    font-weight: 600;
    margin-right: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .stage {
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    padding: 14px;
    iframe {
      border: 0;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
      height: calc(100vh - 120px);
      max-width: 100%;
    }
  }
`;

const DEVICES = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 820 },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: 390 },
];

function SectionFields({ section, index, update, updateData }) {
  const data = section.data || {};
  const type = section.type;
  const wantsImage = ['text', 'hero', 'image', 'story', 'collection', 'process'].includes(type);
  const wantsLink = ['cta', 'hero', 'collection'].includes(type);
  const wantsSubheading = ['hero', 'collection', 'story', 'process'].includes(type);
  const wantsReverse = ['image', 'story', 'collection'].includes(type);

  return (
    <>
      <div className="row">
        <Field label="Section type">
          <Select value={type} onChange={(event) => update(index, { type: event.target.value })}>
            {SECTION_LIBRARY.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Visibility">
          <label className="visible-toggle">
            <input
              type="checkbox"
              checked={isVisible(section)}
              onChange={(event) => updateData(index, { visible: event.target.checked })}
            />
            {isVisible(section) ? 'Shown on the page' : 'Hidden from the page'}
          </label>
        </Field>
      </div>

      <Field label="Heading">
        <Input
          value={section.heading}
          onChange={(event) => update(index, { heading: event.target.value })}
          placeholder="Section heading"
          maxLength={300}
        />
      </Field>

      {wantsSubheading && (
        <Field label="Subheading / eyebrow">
          <Input
            value={data.subheading || ''}
            onChange={(event) => updateData(index, { subheading: event.target.value })}
            placeholder="Short supporting line"
          />
        </Field>
      )}

      <Field label={type === 'quote' ? 'Quote text' : 'Body copy'} hint="Blank lines create paragraphs. Lines starting with - become a list.">
        <Textarea
          value={section.body}
          onChange={(event) => update(index, { body: event.target.value })}
          placeholder="Write the section copy…"
        />
      </Field>

      {wantsImage && (
        <>
          <ImageField
            label="Image"
            value={section.image}
            onChange={(url) => update(index, { image: url })}
            hint="Choose from the media library or paste an image URL."
          />
          <Field label="Image alt text">
            <Input
              value={data.imageAlt || ''}
              onChange={(event) => updateData(index, { imageAlt: event.target.value })}
              placeholder="Describe the image for accessibility"
            />
          </Field>
        </>
      )}

      {wantsReverse && (
        <label className="visible-toggle">
          <input
            type="checkbox"
            checked={Boolean(data.reverse)}
            onChange={(event) => updateData(index, { reverse: event.target.checked })}
          />
          Place the image on the left
        </label>
      )}

      {type === 'quote' && (
        <Field label="Attribution">
          <Input
            value={data.cite || ''}
            onChange={(event) => updateData(index, { cite: event.target.value })}
            placeholder="Name, role or company"
          />
        </Field>
      )}

      {wantsLink && (
        <div className="row">
          <Field label="Button label">
            <Input
              value={data.label || ''}
              onChange={(event) => updateData(index, { label: event.target.value })}
              placeholder="Get a quote"
            />
          </Field>
          <Field label="Button link" hint="Use /path or a full https:// URL.">
            <Input
              value={data.href || ''}
              onChange={(event) => updateData(index, { href: event.target.value })}
              placeholder="/collections/welcome-kits"
            />
          </Field>
        </div>
      )}

      {type === 'collection' && (
        <div className="row">
          <Field label="Category slug (optional)">
            <Input
              value={data.categorySlug || ''}
              onChange={(event) => updateData(index, { categorySlug: event.target.value })}
              placeholder="tech-gadgets"
            />
          </Field>
          <Field label="Collection slug (optional)">
            <Input
              value={data.collectionSlug || ''}
              onChange={(event) => updateData(index, { collectionSlug: event.target.value })}
              placeholder="new-joinee-kits"
            />
          </Field>
        </div>
      )}

      {type === 'process' && (
        <Field label="Steps" hint="One step per line.">
          <Textarea
            value={(Array.isArray(data.steps) ? data.steps : []).join('\n')}
            onChange={(event) =>
              updateData(index, {
                steps: event.target.value
                  .split('\n')
                  .map((step) => step.trim())
                  .filter(Boolean),
              })
            }
            placeholder={'Share the brief\nApprove samples\nProduction and QC\nDelivery'}
          />
        </Field>
      )}

      {type === 'columns' && (
        <Field label="Cards" hint="Add two to four cards of content.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(Array.isArray(data.items) ? data.items : []).map((item, itemIndex) => (
              <div
                key={itemIndex}
                style={{
                  border: '1px solid var(--re-line)',
                  borderRadius: 10,
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <Input
                  value={item.heading || ''}
                  onChange={(event) => {
                    const items = [...(data.items || [])];
                    items[itemIndex] = { ...items[itemIndex], heading: event.target.value };
                    updateData(index, { items });
                  }}
                  placeholder="Card heading"
                />
                <Textarea
                  value={item.body || ''}
                  onChange={(event) => {
                    const items = [...(data.items || [])];
                    items[itemIndex] = { ...items[itemIndex], body: event.target.value };
                    updateData(index, { items });
                  }}
                  placeholder="Card copy"
                />
                <Button
                  type="button"
                  $variant="ghost"
                  style={{ alignSelf: 'flex-start', padding: '5px 10px', fontSize: 12 }}
                  onClick={() => updateData(index, { items: (data.items || []).filter((_, i) => i !== itemIndex) })}
                >
                  Remove card
                </Button>
              </div>
            ))}
            <Button
              type="button"
              $variant="outline"
              style={{ alignSelf: 'flex-start' }}
              onClick={() => updateData(index, { items: [...(data.items || []), { heading: '', body: '' }] })}
            >
              <Plus size={14} /> Add card
            </Button>
          </div>
        </Field>
      )}

      <div className="row">
        <Field label="Alignment">
          <Select value={data.align || 'left'} onChange={(event) => updateData(index, { align: event.target.value })}>
            <option value="left">Left</option>
            <option value="center">Centered</option>
          </Select>
        </Field>
        <Field label="Background">
          <Select
            value={data.background || 'none'}
            onChange={(event) => updateData(index, { background: event.target.value })}
          >
            <option value="none">None</option>
            <option value="cream">Cream</option>
            <option value="white">White</option>
            <option value="forest">Forest</option>
          </Select>
        </Field>
        <Field label="Spacing">
          <Select
            value={data.spacing || 'regular'}
            onChange={(event) => updateData(index, { spacing: event.target.value })}
          >
            <option value="compact">Compact</option>
            <option value="regular">Regular</option>
            <option value="roomy">Roomy</option>
          </Select>
        </Field>
      </div>
    </>
  );
}

export default function PageBuilder({ initialPage }) {
  const router = useRouter();
  const { notify } = useToast();
  const [meta, setMeta] = useState({
    title: initialPage.title || '',
    slug: initialPage.slug || '',
    content: initialPage.content || '',
    seoTitle: initialPage.seoTitle || '',
    seoDescription: initialPage.seoDescription || '',
  });
  const [status, setStatus] = useState(initialPage.status || 'draft');
  const [sections, setSections] = useState(() => normalizeSections(initialPage.sections));
  const [expanded, setExpanded] = useState(() => new Set());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [device, setDevice] = useState('desktop');

  const live = status === 'published';
  const previewSrc = useMemo(
    () => `/preview/${meta.slug || 'page'}?id=${encodeURIComponent(initialPage.id)}`,
    [meta.slug, initialPage.id]
  );

  const markDirty = () => setDirty(true);

  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  useEffect(() => {
    if (!previewOpen) return undefined;
    const handler = (event) => {
      if (event.key === 'Escape') setPreviewOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewOpen]);

  function setMetaField(name, value) {
    setMeta((prev) => ({ ...prev, [name]: value }));
    markDirty();
  }

  function update(index, patch) {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, ...(typeof patch === 'function' ? patch(section) : patch) } : section))
    );
    markDirty();
  }

  function updateData(index, patch) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === index ? { ...section, data: { ...(section.data || {}), ...patch } } : section
      )
    );
    markDirty();
  }

  function addSection(type) {
    const section = { localKey: uid(), type, heading: '', body: '', image: '', data: {} };
    setSections((prev) => [...prev, section]);
    setExpanded((prev) => new Set(prev).add(section.localKey));
    markDirty();
  }

  function duplicateSection(index) {
    const source = sections[index];
    if (!source) return;
    const copy = {
      ...source,
      id: undefined,
      localKey: uid(),
      data: JSON.parse(JSON.stringify(source.data || {})),
    };
    setSections((prev) => [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]);
    setExpanded((prev) => new Set(prev).add(copy.localKey));
    markDirty();
    notify('Section duplicated.');
  }

  function deleteSection(index) {
    const section = sections[index];
    const label = section.heading || TYPE_LABELS[section.type] || 'section';
    if (!window.confirm(`Delete “${label}”? This cannot be undone after saving.`)) return;
    setSections((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  }

  function moveSection(index, target) {
    if (target < 0 || target >= sections.length || target === index) return;
    setSections((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    markDirty();
  }

  function onDragOver(event, index) {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    moveSection(dragIndex, index);
    setDragIndex(index);
  }

  function toggleExpanded(localKey) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(localKey)) next.delete(localKey);
      else next.add(localKey);
      return next;
    });
  }

  function gotoBack() {
    if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
    router.push('/dashboard/pages');
  }

  function pagePayload(nextStatus, forPreview = false) {
    return {
      id: initialPage.id,
      title: meta.title,
      slug: meta.slug,
      content: meta.content,
      seoTitle: meta.seoTitle,
      seoDescription: meta.seoDescription,
      status: nextStatus || status,
      sections: serializeSections(sections).map((section, index) => ({
        ...section,
        id: sections[index]?.id || sections[index]?.localKey,
      })),
    };
  }

  async function persist(nextStatus) {
    if (!meta.title.trim()) {
      setError('A page title is required.');
      return;
    }
    if ((nextStatus || status) === 'published' && live && dirty) {
      if (!window.confirm('This page is live. Saving will update the public website immediately. Continue?')) {
        return;
      }
    }
    setSaving(true);
    setError('');
    try {
      const payload = pagePayload(nextStatus);
      delete payload.id;
      const response = await apiRequest(`/api/content/pages/${initialPage.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...payload,
          sections: sections.map((section) => ({
            type: section.type || 'text',
            heading: section.heading || null,
            body: section.body || null,
            image: section.image || null,
            data: Object.keys(section.data || {}).length ? section.data : null,
          })),
        }),
      });
      const saved = response.data;
      setMeta({
        title: saved.title || '',
        slug: saved.slug || '',
        content: saved.content || '',
        seoTitle: saved.seoTitle || '',
        seoDescription: saved.seoDescription || '',
      });
      setStatus(saved.status || status);
      setSections(normalizeSections(saved.sections));
      setExpanded(new Set());
      setDirty(false);
      setSavedAt(new Date());
      notify(saved.status === 'published' ? 'Page published. The live site is up to date.' : 'Draft saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function openPreview() {
    try {
      window.localStorage.setItem(
        `rooteco:page-preview:${initialPage.id}`,
        JSON.stringify({ at: Date.now(), page: pagePayload(status, true) })
      );
    } catch {
      // Preview still falls back to the last saved version if storage is unavailable.
    }
    setPreviewKey((key) => key + 1);
    setPreviewOpen(true);
  }

  const deviceConfig = DEVICES.find((item) => item.id === device) || DEVICES[0];

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Content · Page builder</span>
          <h1>{meta.title || 'Untitled page'}</h1>
          <p>
            /{meta.slug || 'slug'} · <StatusBadge value={status} />
            {savedAt ? ` · Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </p>
        </div>
        <div className="actions">
          <Button type="button" $variant="outline" onClick={gotoBack}>
            <ArrowLeft size={15} /> Back
          </Button>
          <Button type="button" $variant="outline" onClick={openPreview}>
            <Eye size={15} /> Preview
          </Button>
          {live && (
            <Button
              type="button"
              $variant="outline"
              disabled={saving}
              onClick={() => {
                if (!window.confirm('Move this page to draft? The public URL will show a 404 until you publish again.')) return;
                persist('draft');
              }}
            >
              Move to draft
            </Button>
          )}
          <Button type="button" $variant="outline" disabled={saving} onClick={() => persist()}>
            <SaveIcon size={15} /> {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" disabled={saving} onClick={() => persist('published')}>
            {saving ? 'Saving…' : live ? 'Publish changes' : 'Publish page'}
          </Button>
        </div>
      </PageHeader>

      {error && <ErrorBlock message={error} />}

      {live ? (
        <div
          style={{
            border: '1px solid rgba(240, 162, 59, 0.35)',
            background: 'rgba(240, 162, 59, 0.08)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12.5,
            color: theme.colors.ink,
            marginBottom: 14,
          }}
        >
          This page is <strong>live</strong>. Saving updates the public website immediately. Use <strong>Move to draft</strong> first
          if you want to stage changes without affecting customers.
        </div>
      ) : (
        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'rgba(255, 255, 255, 0.035)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12.5,
            color: theme.colors.muted,
            marginBottom: 14,
          }}
        >
          This page is a <strong>draft</strong>. Changes stay off the public site until you publish.
        </div>
      )}

      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '26px 10px' }}>
                <h2 style={{ fontSize: 18, color: theme.colors.ink, marginBottom: 6 }}>Start building this page</h2>
                <p style={{ fontSize: 13, color: theme.colors.muted }}>
                  Add a section from the library, then drag sections to set the order customers see.
                </p>
              </div>
            </Card>
          ) : (
            sections.map((section, index) => {
              const open = expanded.has(section.localKey);
              const visible = isVisible(section);
              return (
                <SectionCard
                  key={section.localKey}
                  $hidden={!visible}
                  $dragging={dragIndex === index}
                  onDragOver={(event) => onDragOver(event, index)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragIndex(null);
                  }}
                >
                  <div className="head">
                    <span
                      className="grip"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', String(index));
                        setDragIndex(index);
                      }}
                      onDragEnd={() => setDragIndex(null)}
                      title="Drag to reorder"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical size={16} />
                    </span>
                    <span className="num">{index + 1}</span>
                    <div className="meta">
                      <strong>{section.heading || TYPE_LABELS[section.type] || 'Section'}</strong>
                      <span>
                        {TYPE_LABELS[section.type] || 'Section'} · {visible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                    <div className="tools">
                      <Button
                        type="button"
                        $variant="ghost"
                        style={{ padding: 5 }}
                        onClick={() => updateData(index, { visible: !visible })}
                        title={visible ? 'Hide section' : 'Show section'}
                        aria-label={visible ? 'Hide section' : 'Show section'}
                      >
                        {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </Button>
                      <Button
                        type="button"
                        $variant="ghost"
                        style={{ padding: 5 }}
                        onClick={() => moveSection(index, index - 1)}
                        disabled={index === 0}
                        title="Move up"
                        aria-label="Move up"
                      >
                        <ArrowUp size={14} />
                      </Button>
                      <Button
                        type="button"
                        $variant="ghost"
                        style={{ padding: 5 }}
                        onClick={() => moveSection(index, index + 1)}
                        disabled={index === sections.length - 1}
                        title="Move down"
                        aria-label="Move down"
                      >
                        <ArrowDown size={14} />
                      </Button>
                      <Button
                        type="button"
                        $variant="ghost"
                        style={{ padding: 5 }}
                        onClick={() => duplicateSection(index)}
                        title="Duplicate section"
                        aria-label="Duplicate section"
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        type="button"
                        $variant="ghost"
                        style={{ padding: 5, color: theme.colors.sale }}
                        onClick={() => deleteSection(index)}
                        title="Delete section"
                        aria-label="Delete section"
                      >
                        <Trash2 size={14} />
                      </Button>
                      <Button
                        type="button"
                        $variant="ghost"
                        style={{ padding: 5 }}
                        onClick={() => toggleExpanded(section.localKey)}
                        title={open ? 'Collapse' : 'Edit section'}
                        aria-label={open ? 'Collapse' : 'Edit section'}
                      >
                        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </Button>
                    </div>
                  </div>
                  {open && (
                    <div className="body">
                      <SectionFields section={section} index={index} update={update} updateData={updateData} />
                    </div>
                  )}
                </SectionCard>
              );
            })
          )}
        </div>

        <Side>
          <Card $pad="16px">
            <h2 style={{ fontSize: 15, color: theme.colors.ink, marginBottom: 4 }}>Section library</h2>
            <p style={{ fontSize: 11.5, color: theme.colors.muted, marginBottom: 10 }}>
              Click to add a section at the end. Drag the handle to reorder.
            </p>
            <LibraryGrid>
              {SECTION_LIBRARY.map((item) => (
                <button key={item.type} type="button" onClick={() => addSection(item.type)}>
                  {item.label}
                  <span>{item.hint}</span>
                </button>
              ))}
            </LibraryGrid>
          </Card>

          <Card $pad="16px">
            <h2 style={{ fontSize: 15, color: theme.colors.ink, marginBottom: 10 }}>Page settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="Page title" required>
                <Input value={meta.title} onChange={(event) => setMetaField('title', event.target.value)} />
              </Field>
              <Field label="Slug" hint="Public URL: /pages/your-slug">
                <Input value={meta.slug} onChange={(event) => setMetaField('slug', event.target.value)} />
              </Field>
              <Field label="SEO title">
                <Input value={meta.seoTitle} onChange={(event) => setMetaField('seoTitle', event.target.value)} />
              </Field>
              <Field label="SEO description">
                <Textarea
                  value={meta.seoDescription}
                  onChange={(event) => setMetaField('seoDescription', event.target.value)}
                />
              </Field>
              <Field label="Main content" hint="Rendered above the sections.">
                <Textarea value={meta.content} onChange={(event) => setMetaField('content', event.target.value)} />
              </Field>
              <Button type="button" $variant="outline" onClick={openPreview}>
                <Eye size={15} /> Preview desktop, tablet and mobile
              </Button>
              {dirty && (
                <span style={{ fontSize: 11.5, color: theme.colors.accent }}>
                  Unsaved changes — save or publish to keep them.
                </span>
              )}
            </div>
          </Card>
        </Side>
      </Layout>

      {previewOpen && (
        <PreviewOverlay>
          <div className="bar">
            <div className="title">
              <span>Preview · {meta.title || 'Untitled page'}</span>
              <Badge $tone="gold">Draft</Badge>
            </div>
            {DEVICES.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  type="button"
                  $variant={device === item.id ? undefined : 'outline'}
                  style={{ padding: '7px 12px', fontSize: 12 }}
                  onClick={() => setDevice(item.id)}
                >
                  <Icon size={14} /> {item.label}
                </Button>
              );
            })}
            <a
              href={previewSrc}
              target="_blank"
              rel="noreferrer"
              style={{ color: theme.colors.ink, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
            >
              <ExternalLink size={14} /> Open in tab
            </a>
            <Button type="button" $variant="ghost" style={{ padding: 6 }} onClick={() => setPreviewOpen(false)} aria-label="Close preview">
              <X size={18} />
            </Button>
          </div>
          <div className="stage">
            <iframe
              key={`${previewKey}-${device}`}
              src={previewSrc}
              title="Page preview"
              style={{ width: deviceConfig.width }}
            />
          </div>
        </PreviewOverlay>
      )}
    </>
  );
}
