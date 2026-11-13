'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  LayoutList,
  Lock,
  Monitor,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import styled from 'styled-components';
import PageSections from '@/components/pages/PageSections';
import {
  isLockedSection,
  layoutLabel,
  managedInLabel,
  sectionLayout,
} from '@/lib/pages/layouts';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorBlock,
  Field,
  IconButton,
  ImageField,
  Input,
  PageHeader,
  SearchBox,
  Select,
  StatusBadge,
  Table,
  TableScroll,
  Textarea,
  Toggle,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDateTime } from '@/components/dashboard/hooks';

const SECTION_TYPES = [
  { type: 'text', label: 'Text block' },
  { type: 'hero', label: 'Hero banner' },
  { type: 'image', label: 'Image + text' },
  { type: 'collection', label: 'Collection spotlight' },
  { type: 'story', label: 'Story' },
  { type: 'process', label: 'Process steps' },
  { type: 'columns', label: 'Columns' },
  { type: 'quote', label: 'Quote' },
  { type: 'cta', label: 'Call to action' },
];

const TYPE_LABELS = Object.fromEntries(SECTION_TYPES.map((item) => [item.type, item.label]));
const IMAGE_TYPES = ['text', 'hero', 'image', 'story', 'collection', 'process'];
const LINK_TYPES = ['hero', 'collection', 'cta'];
const SUBHEADING_TYPES = ['hero', 'collection', 'story', 'process'];
const REVERSE_TYPES = ['image', 'story', 'collection'];

const TYPE_TONES = { hero: 'gold', cta: 'gold', collection: 'blue', process: 'blue' };

const uid = () =>
  globalThis.crypto?.randomUUID?.() || `section-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function isVisible(section) {
  return section.data?.visible !== false;
}

function normalizeSections(sections) {
  return (Array.isArray(sections) ? sections : []).map((section, index) => ({
    key: section.id || `local-${index}-${section.type}`,
    id: section.id,
    type: section.type || 'text',
    heading: section.heading || '',
    body: section.body || '',
    image: section.image || '',
    data: section.data && typeof section.data === 'object' ? section.data : {},
    order: section.order ?? index,
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

const Grip = styled.button`
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dash-faint);
  cursor: grab;
  &:hover {
    background: var(--dash-panel-3);
    color: var(--dash-ink);
  }
  &:active {
    cursor: grabbing;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }
  &:focus-visible {
    outline: 2px solid var(--dash-accent);
    outline-offset: 1px;
  }
`;

const Hint = styled.p`
  margin: 0 0 12px;
  font-size: 11.5px;
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  gap: 6px;
`;

export default function SectionsManager({ initialPage }) {
  const { notify } = useToast();
  const [page, setPage] = useState(initialPage);
  const [sections, setSections] = useState(() => normalizeSections(initialPage.sections));
  const sectionsRef = useRef(sections);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const dragIndexRef = useRef(null);
  const dragSnapshot = useRef(null);
  const dragging = useRef(false);
  const [save, setSave] = useState({ state: 'idle', message: '' });
  const [canRetry, setCanRetry] = useState(false);
  const saveSeq = useRef(0);
  const failedSave = useRef(null);
  const [editor, setEditor] = useState(null);
  const [formError, setFormError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [previewSection, setPreviewSection] = useState(null);
  const [reloading, setReloading] = useState(false);

  const locked = Boolean(q.trim() || typeFilter || visibilityFilter);
  const busy = save.state === 'saving';

  const setSectionList = useCallback((next) => {
    sectionsRef.current = next;
    setSections(next);
  }, []);

  const persist = useCallback(
    async (next, { previous = null, success = '' } = {}) => {
      const seq = saveSeq.current + 1;
      saveSeq.current = seq;
      setSave({ state: 'saving', message: '' });
      try {
        const response = await apiRequest(`/api/content/pages/${initialPage.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sections: serializeSections(next) }),
        });
        if (seq !== saveSeq.current) return true;
        const saved = response.data;
        setSectionList(normalizeSections(saved.sections));
        setPage((prev) => ({ ...prev, ...saved }));
        failedSave.current = null;
        setCanRetry(false);
        setSave({
          state: 'saved',
          message: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        if (success) notify(success);
        return true;
      } catch (err) {
        if (seq !== saveSeq.current) return false;
        if (previous) setSectionList(previous);
        failedSave.current = previous ? { next, previous, success } : null;
        setCanRetry(Boolean(previous));
        setSave({ state: 'error', message: err.message });
        notify(previous ? 'Could not save the new order. The previous order was restored.' : err.message, 'error');
        return false;
      }
    },
    [initialPage.id, notify, setSectionList]
  );

  function retrySave() {
    if (!failedSave.current) return;
    const { next, previous, success } = failedSave.current;
    persist(next, { previous, success });
  }

  function setDrag(index) {
    dragIndexRef.current = index;
    setDragIndex(index);
  }

  function reorder(targetIndex) {
    const from = dragIndexRef.current;
    if (from === null || from === targetIndex) return;
    const current = sectionsRef.current;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const next = [...current];
    const [item] = next.splice(from, 1);
    next.splice(targetIndex, 0, item);
    setSectionList(next);
    setDrag(targetIndex);
  }

  function startDrag(event, index) {
    if (locked) return;
    dragSnapshot.current = sectionsRef.current;
    dragging.current = true;
    setDrag(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }

  function onDragOver(event, index) {
    if (!dragging.current) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    reorder(index);
  }

  function finishDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    setDrag(null);
    const before = dragSnapshot.current;
    dragSnapshot.current = null;
    if (!before) return;
    const next = sectionsRef.current;
    const changed =
      before.length !== next.length || before.some((section, index) => section.key !== next[index]?.key);
    if (!changed) return;
    persist(next, { previous: before, success: 'New section order saved and live pages updated.' });
  }

  function nudge(index, delta) {
    if (locked || busy) return;
    const current = sectionsRef.current;
    const target = index + delta;
    if (target < 0 || target >= current.length) return;
    const next = [...current];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setSectionList(next);
    persist(next, { previous: current, success: 'New section order saved and live pages updated.' });
  }

  function duplicateSection(index) {
    if (busy) return;
    const current = sectionsRef.current;
    const source = current[index];
    if (!source) return;
    const copy = {
      ...source,
      key: uid(),
      id: undefined,
      heading: source.heading ? `${source.heading} (copy)` : '',
      data: JSON.parse(JSON.stringify(source.data || {})),
    };
    const next = [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    setSectionList(next);
    persist(next, { previous: current, success: 'Section duplicated.' });
  }

  function openCreate() {
    setFormError('');
    setEditor({
      mode: 'create',
      index: null,
      draft: {
        key: uid(),
        type: 'text',
        heading: '',
        body: '',
        image: '',
        data: {},
      },
    });
  }

  function openEdit(section, index) {
    if (isLockedSection(section)) {
      const owner = managedInLabel(section);
      notify(
        owner
          ? `This block is managed in the ${owner}. Edit it there to update the live page.`
          : 'This block is supplied by the page route and cannot be edited here.',
        'error',
      );
      return;
    }
    setFormError('');
    const data = JSON.parse(JSON.stringify(section.data || {}));
    setEditor({
      mode: 'edit',
      index,
      draft: {
        ...section,
        data,
        dataJson: data.layout ? JSON.stringify(data, null, 2) : '',
      },
    });
  }

  function updateDraft(patch) {
    setEditor((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev));
  }

  function updateDraftData(patch) {
    setEditor((prev) => {
      if (!prev) return prev;
      const data = { ...(prev.draft.data || {}), ...patch };
      return {
        ...prev,
        draft: {
          ...prev.draft,
          data,
          dataJson: data.layout ? JSON.stringify(data, null, 2) : prev.draft.dataJson,
        },
      };
    });
  }

  async function submitEditor(event) {
    event.preventDefault();
    if (!editor) return;
    const draft = editor.draft;
    if (!draft.heading.trim() && !draft.body.trim()) {
      setFormError('Add a heading or some body copy so the section is identifiable.');
      return;
    }
    setFormError('');
    let data;
    try {
      data =
        draft.dataJson && draft.dataJson.trim()
          ? JSON.parse(draft.dataJson)
          : JSON.parse(JSON.stringify(draft.data || {}));
    } catch {
      setFormError('Advanced data must be valid JSON. Check commas, quotes and brackets.');
      return;
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      setFormError('Advanced data must be a JSON object.');
      return;
    }
    if (Array.isArray(data.steps)) {
      data.steps = data.steps.map((step) => String(step).trim()).filter(Boolean);
    }
    if (isVisible(draft)) delete data.visible;
    else data.visible = false;
    data.updatedAt = new Date().toISOString();
    const nextSection = {
      ...draft,
      heading: draft.heading.trim(),
      body: draft.body.trim(),
      image: draft.image.trim(),
      data,
    };
    const before = sectionsRef.current;
    const next =
      editor.mode === 'create'
        ? [...before, nextSection]
        : before.map((section, index) => (index === editor.index ? nextSection : section));
    const ok = await persist(next, {
      previous: before,
      success: editor.mode === 'create' ? 'Section added.' : 'Section updated and live page refreshed.',
    });
    if (ok) setEditor(null);
  }

  async function confirmDelete() {
    if (!confirm) return;
    const before = sectionsRef.current;
    const next = before.filter((section) => section.key !== confirm.section.key);
    const ok = await persist(next, { previous: before, success: 'Section deleted.' });
    if (ok) setConfirm(null);
  }

  function toggleVisibility(section) {
    if (busy) return;
    const before = sectionsRef.current;
    const next = before.map((item) => {
      if (item.key !== section.key) return item;
      const data = { ...(item.data || {}) };
      if (isVisible(item)) data.visible = false;
      else delete data.visible;
      data.updatedAt = new Date().toISOString();
      return { ...item, data };
    });
    const willShow = !isVisible(section);
    persist(next, {
      previous: before,
      success: willShow ? 'Section is visible on the page again.' : 'Section hidden from the page.',
    });
  }

  async function reload() {
    if (busy) return;
    setReloading(true);
    try {
      const response = await apiRequest(`/api/content/pages/${initialPage.id}`);
      const fresh = response.data;
      setPage((prev) => ({ ...prev, ...fresh }));
      setSectionList(normalizeSections(fresh.sections));
      setSave({ state: 'idle', message: '' });
      setCanRetry(false);
      failedSave.current = null;
      notify('Sections reloaded from the server.');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setReloading(false);
    }
  }

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => {
        if (typeFilter && section.type !== typeFilter) return false;
        if (visibilityFilter === 'visible' && !isVisible(section)) return false;
        if (visibilityFilter === 'hidden' && isVisible(section)) return false;
        if (!needle) return true;
        const haystack = [
          section.heading,
          section.body,
          section.type,
          TYPE_LABELS[section.type],
          section.data?.subheading,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      });
  }, [sections, q, typeFilter, visibilityFilter]);

  const hiddenCount = sections.filter((section) => !isVisible(section)).length;
  const draft = editor?.draft;
  const draftData = draft?.data || {};
  const draftVisible = draft ? isVisible(draft) : true;
  const publicPath = page.path || `/pages/${page.slug}`;
  const liveUrl = publicPath;
  const builtIn = Boolean(page.registry);
  const previewHref = builtIn ? publicPath : `/preview/${page.slug}?id=${page.id}`;
  const previewSectionPayload = previewSection
    ? { ...previewSection, id: 'section-preview', data: { ...(previewSection.data || {}), visible: true } }
    : null;
  const previewLayout = previewSection ? sectionLayout(previewSection) : null;
  const saveTone =
    save.state === 'saving' ? 'gold' : save.state === 'saved' ? 'green' : save.state === 'error' ? 'red' : 'neutral';

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Content · Page sections</span>
          <h1>{page.title}</h1>
          <p>
            {publicPath} · <StatusBadge value={page.status} /> · {sections.length}{' '}
            {sections.length === 1 ? 'section' : 'sections'}
            {hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ''}
          </p>
        </div>
        <div className="actions">
          <Badge $tone={saveTone}>
            {save.state === 'saving' && 'Saving…'}
            {save.state === 'saved' && <><Check size={12} /> Saved {save.message}</>}
            {save.state === 'error' && <><TriangleAlert size={12} /> Not saved</>}
            {save.state === 'idle' && 'All changes saved'}
          </Badge>
          <Button as={Link} href="/dashboard/pages" $variant="outline">
            <ArrowLeft size={14} /> Pages
          </Button>
          <Button as={Link} href={`/dashboard/pages/${page.id}`} $variant="outline">
            <LayoutList size={14} /> Builder
          </Button>
          <Button as={Link} href={previewHref} target="_blank" $variant="outline">
            <Monitor size={14} /> Preview page
          </Button>
          {page.status === 'published' && (
            <Button as="a" href={liveUrl} target="_blank" rel="noreferrer" $variant="outline">
              <ExternalLink size={14} /> View live
            </Button>
          )}
          <Button type="button" onClick={openCreate}>
            <Plus size={14} /> Add New Section
          </Button>
        </div>
      </PageHeader>

      {page.registry && (
        <div
          style={{
            border: '1px solid var(--dash-line)',
            background: 'var(--dash-panel-2)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12.5,
            color: 'var(--dash-muted)',
            marginBottom: 14,
          }}
        >
          This is a <strong style={{ color: 'var(--dash-ink)' }}>built-in storefront route</strong>
          {page.registryPath ? ` at ${page.registryPath}` : ''}. The sections below are the page&apos;s
          actual content blocks and render in this order on the live site. Blocks marked{' '}
          <strong style={{ color: 'var(--dash-ink)' }}>managed</strong> come from another module.
        </div>
      )}

      {page.status !== 'published' && (
        <div
          style={{
            border: '1px solid var(--dash-line)',
            background: 'var(--dash-panel-2)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12.5,
            color: 'var(--dash-muted)',
            marginBottom: 14,
          }}
        >
          This page is a <strong style={{ color: 'var(--dash-ink)' }}>draft</strong>. Section order and visibility are
          saved, but customers will not see them until the page is published in the builder.
        </div>
      )}

      {save.state === 'error' && (
        <ErrorBlock message={`Order not saved: ${save.message}`} onRetry={canRetry ? retrySave : null} />
      )}

      <Card $pad="16px">
        <Toolbar>
          <SearchBox value={q} onChange={setQ} placeholder="Search sections by heading, type or copy…" />
          <Select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            style={{ width: 'auto', minWidth: 160 }}
            aria-label="Filter by section type"
          >
            <option value="">All section types</option>
            {SECTION_TYPES.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select
            value={visibilityFilter}
            onChange={(event) => setVisibilityFilter(event.target.value)}
            style={{ width: 'auto', minWidth: 140 }}
            aria-label="Filter by visibility"
          >
            <option value="">All visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </Select>
          <div className="spacer" />
          <Button type="button" $variant="outline" onClick={reload} disabled={busy || reloading}>
            <RefreshCw size={14} /> {reloading ? 'Reloading…' : 'Refresh'}
          </Button>
        </Toolbar>

        {locked && sections.length > 0 && (
          <Hint>
            <GripVertical size={13} /> Clear the search and filters to drag sections into a new order.
          </Hint>
        )}

        {sections.length === 0 ? (
          <EmptyState
            icon={<LayoutList size={19} />}
            title="No sections on this page yet"
            text="Add a section to start composing this page. Order and visibility are saved instantly."
            action={<Button type="button" onClick={openCreate}><Plus size={14} /> Add New Section</Button>}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<LayoutList size={19} />}
            title="No sections match these filters"
            text="Try a different search term, section type or visibility."
            action={
              <Button
                type="button"
                $variant="outline"
                onClick={() => {
                  setQ('');
                  setTypeFilter('');
                  setVisibilityFilter('');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: 36 }} aria-label="Drag handle" />
                  <th>Section</th>
                  <th>Heading</th>
                  <th style={{ width: 70 }}>Order</th>
                  <th>Visibility</th>
                  <th>Last updated</th>
                  <th style={{ width: 148, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ section, index }) => {
                  const visible = isVisible(section);
                  const sectionLocked = isLockedSection(section);
                  const owner = managedInLabel(section);
                  const blockLabel = layoutLabel(section);
                  const stamp = section.data?.updatedAt || page.updatedAt;
                  const stampSource = section.data?.updatedAt ? 'section' : 'page';
                  return (
                    <tr
                      key={section.key}
                      style={
                        dragIndex === index
                          ? { background: 'rgba(233, 166, 78, 0.08)', opacity: 0.75 }
                          : undefined
                      }
                      onDragOver={(event) => onDragOver(event, index)}
                      onDrop={(event) => {
                        event.preventDefault();
                        finishDrag();
                      }}
                    >
                      <td>
                        <Grip
                          type="button"
                          draggable={!locked && !busy}
                          disabled={locked || busy}
                          onDragStart={(event) => startDrag(event, index)}
                          onDragEnd={finishDrag}
                          onKeyDown={(event) => {
                            if (event.key === 'ArrowUp') {
                              event.preventDefault();
                              nudge(index, -1);
                            }
                            if (event.key === 'ArrowDown') {
                              event.preventDefault();
                              nudge(index, 1);
                            }
                          }}
                          title={locked ? 'Clear filters to reorder' : 'Drag to reorder · arrow keys also move this section'}
                          aria-label={`Reorder ${section.heading || TYPE_LABELS[section.type] || 'section'}`}
                        >
                          <GripVertical size={15} />
                        </Grip>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <Badge $tone={TYPE_TONES[section.type] || 'neutral'}>
                            {TYPE_LABELS[section.type] || section.type}
                          </Badge>
                          {sectionLocked && <Lock size={11} style={{ color: 'var(--dash-faint)' }} />}
                        </div>
                        {blockLabel && (
                          <div style={{ fontSize: 10.5, color: 'var(--dash-faint)', marginTop: 4 }}>
                            {blockLabel}
                            {sectionLocked && owner ? ` · ${owner}` : ''}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ maxWidth: 360 }}>
                          <div
                            style={{
                              fontSize: 12.8,
                              fontWeight: 600,
                              color: 'var(--dash-ink)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {section.heading || 'Untitled section'}
                          </div>
                          {section.body && (
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--dash-faint)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {section.body}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="mono">{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Badge $tone={visible ? 'green' : 'red'}>{visible ? 'Visible' : 'Hidden'}</Badge>
                          <IconButton
                            type="button"
                            onClick={() => toggleVisibility(section)}
                            disabled={busy || sectionLocked}
                            aria-label={visible ? 'Hide section' : 'Show section'}
                            title={
                              sectionLocked
                                ? owner
                                  ? `Visibility managed in the ${owner}`
                                  : 'Visibility managed by the page route'
                                : visible
                                  ? 'Hide section'
                                  : 'Show section'
                            }
                            style={{ width: 24, height: 24 }}
                          >
                            {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                          </IconButton>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>{formatDateTime(stamp)}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--dash-faint)' }}>
                          {stampSource === 'section' ? 'section edit' : 'page save'}
                        </div>
                      </td>
                      <td>
                        <div className="actions">
                          <IconButton
                            type="button"
                            onClick={() => setPreviewSection(section)}
                            aria-label="Preview section"
                            title="Preview section"
                          >
                            <Monitor size={14} />
                          </IconButton>
                          <IconButton
                            type="button"
                            onClick={() => duplicateSection(index)}
                            disabled={busy || sectionLocked}
                            aria-label="Duplicate section"
                            title={sectionLocked ? 'Managed block — duplicate disabled' : 'Duplicate section'}
                          >
                            <Copy size={14} />
                          </IconButton>
                          <IconButton
                            type="button"
                            onClick={() => openEdit(section, index)}
                            disabled={busy || sectionLocked}
                            aria-label="Edit section"
                            title={
                              sectionLocked
                                ? owner
                                  ? `Managed in the ${owner}`
                                  : 'Managed by the page route'
                                : 'Edit section'
                            }
                          >
                            <Pencil size={14} />
                          </IconButton>
                          <IconButton
                            type="button"
                            onClick={() => setConfirm({ section })}
                            disabled={busy || sectionLocked}
                            aria-label="Delete section"
                            title={sectionLocked ? 'Managed block — delete disabled' : 'Delete section'}
                            style={{ color: 'var(--dash-red)' }}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableScroll>
        )}

        {sections.length > 0 && (
          <Hint style={{ marginTop: 12, marginBottom: 0 }}>
            Drag the handle to change the order customers see. Changes save automatically; arrow keys move a focused
            handle. Hidden sections stay saved but are skipped on the live page.
          </Hint>
        )}
      </Card>

      <Drawer
        open={Boolean(editor)}
        onClose={() => {
          if (!busy) setEditor(null);
        }}
        title={editor?.mode === 'create' ? 'Add section' : 'Edit section'}
        subtitle={
          editor?.mode === 'create'
            ? 'New sections are appended to the end and saved immediately.'
            : 'Changes are written to the page as soon as you save.'
        }
        width={520}
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setEditor(null)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" form="section-form" disabled={busy}>
              {busy ? 'Saving…' : editor?.mode === 'create' ? 'Add section' : 'Save section'}
            </Button>
          </>
        }
      >
        {draft && (
          <form
            id="section-form"
            onSubmit={submitEditor}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {formError && <ErrorBlock message={formError} />}
            <Field label="Section type" required>
              <Select value={draft.type} onChange={(event) => updateDraft({ type: event.target.value })}>
                {SECTION_TYPES.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
            {draft.data?.layout && (
              <div
                style={{
                  border: '1px solid var(--dash-line)',
                  background: 'var(--dash-panel-2)',
                  borderRadius: 8,
                  padding: '9px 11px',
                  fontSize: 11.5,
                  lineHeight: 1.6,
                  color: 'var(--dash-muted)',
                }}
              >
                Built-in <strong style={{ color: 'var(--dash-ink)' }}>{layoutLabel(draft) || draft.data.layout}</strong>{' '}
                block. Heading, copy, image and block data below control how this section renders on the public page.
              </div>
            )}
            <Field label="Heading" required>
              <Input
                value={draft.heading}
                onChange={(event) => updateDraft({ heading: event.target.value })}
                placeholder="Corporate gifting, made effortless"
                maxLength={300}
              />
            </Field>
            <Field
              label={draft.type === 'quote' ? 'Quote text' : 'Body copy'}
              hint="Blank lines create paragraphs. Lines starting with - become a list."
            >
              <Textarea
                value={draft.body}
                onChange={(event) => updateDraft({ body: event.target.value })}
                rows={5}
                placeholder="Write the copy customers will read on this page…"
              />
            </Field>
            <Toggle
              checked={draftVisible}
              onChange={(next) => updateDraftData({ visible: next ? undefined : false })}
              label="Show on the page"
              hint={draftVisible ? 'Customers see this section.' : 'Saved but skipped on the storefront.'}
            />
            {IMAGE_TYPES.includes(draft.type) && (
              <>
                <ImageField
                  label="Section image"
                  value={draft.image}
                  onChange={(url) => updateDraft({ image: url })}
                  hint="Choose from the media library or paste an image URL."
                />
                <Field label="Image alt text">
                  <Input
                    value={draftData.imageAlt || ''}
                    onChange={(event) => updateDraftData({ imageAlt: event.target.value })}
                    placeholder="Describe the image for accessibility"
                  />
                </Field>
              </>
            )}
            {SUBHEADING_TYPES.includes(draft.type) && (
              <Field label="Subheading / eyebrow">
                <Input
                  value={draftData.subheading || ''}
                  onChange={(event) => updateDraftData({ subheading: event.target.value })}
                  placeholder="Diwali 2026 corporate hampers"
                />
              </Field>
            )}
            {LINK_TYPES.includes(draft.type) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Button label">
                  <Input
                    value={draftData.label || ''}
                    onChange={(event) => updateDraftData({ label: event.target.value })}
                    placeholder="Request a quote"
                  />
                </Field>
                <Field label="Button link" hint="Use /path or a full https:// URL.">
                  <Input
                    value={draftData.href || ''}
                    onChange={(event) => updateDraftData({ href: event.target.value })}
                    placeholder="/get-a-quote"
                  />
                </Field>
              </div>
            )}
            {(draft.type === 'collection') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Category slug (optional)">
                  <Input
                    value={draftData.categorySlug || ''}
                    onChange={(event) => updateDraftData({ categorySlug: event.target.value })}
                    placeholder="tech-gadgets"
                  />
                </Field>
                <Field label="Collection slug (optional)">
                  <Input
                    value={draftData.collectionSlug || ''}
                    onChange={(event) => updateDraftData({ collectionSlug: event.target.value })}
                    placeholder="new-joinee-kits"
                  />
                </Field>
              </div>
            )}
            {draft.type === 'quote' && (
              <Field label="Attribution">
                <Input
                  value={draftData.cite || ''}
                  onChange={(event) => updateDraftData({ cite: event.target.value })}
                  placeholder="Priya Nair, People Lead, Northwind"
                />
              </Field>
            )}
            {draft.type === 'process' && (
              <Field label="Steps" hint="One step per line.">
                <Textarea
                  value={(Array.isArray(draftData.steps) ? draftData.steps : []).join('\n')}
                  onChange={(event) => updateDraftData({ steps: event.target.value.split('\n') })}
                  rows={4}
                  placeholder={'Share the brief\nApprove samples\nProduction and QC\nDelivery'}
                />
              </Field>
            )}
            {draft.data?.layout && (
              <Field
                label="Advanced block data (JSON)"
                hint="Items, steps, product source and display options for this built-in block. Must be a valid JSON object."
              >
                <Textarea
                  value={draft.dataJson || ''}
                  onChange={(event) => updateDraft({ dataJson: event.target.value })}
                  rows={8}
                  spellCheck={false}
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}
                />
              </Field>
            )}
            {REVERSE_TYPES.includes(draft.type) && (
              <Toggle
                checked={Boolean(draftData.reverse)}
                onChange={(next) => updateDraftData({ reverse: next })}
                label="Place the image on the left"
                hint="Useful for alternating rows of content."
              />
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <Field label="Alignment">
                <Select value={draftData.align || 'left'} onChange={(event) => updateDraftData({ align: event.target.value })}>
                  <option value="left">Left</option>
                  <option value="center">Centered</option>
                </Select>
              </Field>
              <Field label="Background">
                <Select
                  value={draftData.background || 'none'}
                  onChange={(event) => updateDraftData({ background: event.target.value })}
                >
                  <option value="none">None</option>
                  <option value="cream">Cream</option>
                  <option value="white">White</option>
                  <option value="forest">Forest</option>
                </Select>
              </Field>
              <Field label="Spacing">
                <Select
                  value={draftData.spacing || 'regular'}
                  onChange={(event) => updateDraftData({ spacing: event.target.value })}
                >
                  <option value="compact">Compact</option>
                  <option value="regular">Regular</option>
                  <option value="roomy">Roomy</option>
                </Select>
              </Field>
            </div>
            {draft.type === 'columns' && (
              <Hint style={{ marginBottom: 0 }}>
                <Pencil size={13} /> Column cards are edited in the{' '}
                <Link href={`/dashboard/pages/${page.id}`} style={{ color: 'var(--dash-accent)' }}>
                  page builder
                </Link>
                . Everything else here is saved.
              </Hint>
            )}
          </form>
        )}
      </Drawer>

      <Drawer
        open={Boolean(previewSectionPayload)}
        onClose={() => setPreviewSection(null)}
        title={previewSection?.heading || 'Section preview'}
        subtitle={`${TYPE_LABELS[previewSection?.type] || previewSection?.type || 'Section'} · rendered the way visitors see it`}
        width={760}
        footer={
          <Button type="button" onClick={() => setPreviewSection(null)}>
            Close preview
          </Button>
        }
      >
        {previewSectionPayload && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--dash-line)',
              padding: 18,
            }}
          >
            {previewLayout ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Badge $tone="gold">{layoutLabel(previewSection) || previewLayout}</Badge>
                <h3 style={{ margin: 0, fontSize: 21, color: 'var(--dash-ink)' }}>
                  {previewSection.heading || 'Untitled block'}
                </h3>
                {previewSection.body && (
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--dash-muted)' }}>
                    {previewSection.body}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--dash-faint)' }}>
                  This block renders with the built-in “{layoutLabel(previewSection) || previewLayout}”
                  design on the public page. Section changes save automatically, so open the live page
                  to see the real layout.
                </p>
                <div>
                  <Button as="a" href={publicPath} target="_blank" rel="noreferrer" $variant="outline">
                    <ExternalLink size={14} /> Open live page
                  </Button>
                </div>
              </div>
            ) : (
              <PageSections sections={[previewSectionPayload]} />
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => {
          if (!busy) setConfirm(null);
        }}
        onConfirm={confirmDelete}
        busy={busy}
        title="Delete this section?"
        confirmLabel="Delete section"
        message={
          confirm
            ? `“${confirm.section.heading || TYPE_LABELS[confirm.section.type] || 'Section'}” will be removed from this page and the live site. The other sections keep their order.`
            : ''
        }
      />
    </>
  );
}
