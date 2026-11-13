'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ExternalLink,
  FileText,
  Layers,
  LayoutList,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
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
  Select,
  SkeletonRows,
  Table,
  TableScroll,
  Textarea,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { DetailList, DetailRow, DetailSection } from '@/components/dashboard/Workspace';
import { apiRequest, formatDate, useList } from '@/components/dashboard/hooks';
import { slugify } from '@/lib/utils';
import {
  PAGE_GROUPS,
  PUBLIC_PAGES,
  REGISTRY_BY_SLUG,
  TEMPLATE_LABELS,
  TEMPLATE_OPTIONS,
  deriveTemplate,
  starterSections,
} from '@/lib/pages/registry';

const PAGE_SIZE = 12;

const SYSTEM_KINDS = new Set(['catalogue', 'conversion', 'commerce', 'legal', 'template']);

const TEMPLATE_TONES = {
  landing: 'gold',
  campaign: 'blue',
  editorial: 'neutral',
  blank: 'red',
  system: 'neutral',
  template: 'blue',
};

const STATUS_FILTERS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live route only' },
];

const TEMPLATE_FILTERS = [
  ...TEMPLATE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
  { value: 'system', label: 'System' },
  { value: 'template', label: 'Template' },
];

const GROUP_LABELS = {
  Storefront: 'Storefront page',
  Catalogue: 'Catalogue page',
  Conversion: 'Conversion page',
  Commerce: 'Checkout flow',
  Legal: 'Legal page',
  Templates: 'Rendered by route',
  Custom: 'Custom CMS page',
};

function templateOf(row) {
  if (row.kind === 'template') return { value: 'template', label: 'Template' };
  if (!row.sections.length && SYSTEM_KINDS.has(row.kind)) return { value: 'system', label: 'System' };
  const value = deriveTemplate(row.sections);
  return { value, label: TEMPLATE_LABELS[value] || value };
}

function serializeSections(sections) {
  return (sections || []).map((section) => ({
    type: section.type || 'text',
    heading: section.heading || null,
    body: section.body || null,
    image: section.image || null,
    data: section.data ?? null,
  }));
}

function visibleCount(sections) {
  return (sections || []).filter((section) => section.data?.visible !== false).length;
}

function StatCard({ label, value, caption, tone }) {
  return (
    <Card $pad="12px 14px" style={{ flex: '1 1 150px', minWidth: 140 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--dash-faint)' }}>
        {label}
      </div>
      <div style={{ fontSize: 21, fontWeight: 680, color: tone || 'var(--dash-ink)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {caption && <div style={{ fontSize: 10.5, color: 'var(--dash-faint)', marginTop: 2 }}>{caption}</div>}
    </Card>
  );
}

export default function PagesModule() {
  const { notify } = useToast();
  const { data: pages, loading, error, refresh } = useList('/api/content/pages', {
    page: 1,
    pageSize: 100,
    sort: 'updatedAt',
    order: 'desc',
  });

  const attempted = useRef(false);
  const attemptedLayoutSync = useRef(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [sort, setSort] = useState('website');
  const [page, setPage] = useState(1);

  const [detail, setDetail] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({ title: '', slug: '', template: 'editorial', status: 'draft', content: '', seoTitle: '', seoDescription: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rows = useMemo(() => {
    const bySlug = new Map(pages.map((entry) => [entry.slug, entry]));
    const registered = PUBLIC_PAGES.map((entry) => {
      const page = bySlug.get(entry.slug) || null;
      return {
        key: page?.id || `route:${entry.slug}`,
        id: page?.id || null,
        page,
        registry: entry,
        kind: entry.kind,
        group: entry.group,
        title: page?.title || entry.title,
        description: entry.description,
        slug: page?.slug || entry.slug,
        url: entry.path,
        sections: page?.sections || [],
        status: page?.status || 'live',
        updatedAt: page?.updatedAt || null,
        locked: true,
      };
    });
    const custom = pages
      .filter((entry) => !REGISTRY_BY_SLUG.has(entry.slug))
      .map((entry) => ({
        key: entry.id,
        id: entry.id,
        page: entry,
        registry: null,
        kind: 'custom',
        group: 'Custom',
        title: entry.title,
        description: entry.content ? String(entry.content).slice(0, 90) : 'Custom CMS page',
        slug: entry.slug,
        url: `/pages/${entry.slug}`,
        sections: entry.sections || [],
        status: entry.status,
        updatedAt: entry.updatedAt,
        locked: false,
      }));
    return [...registered, ...custom].map((row) => ({ ...row, template: templateOf(row) }));
  }, [pages]);

  const missingCount = useMemo(
    () => PUBLIC_PAGES.filter((entry) => !pages.some((page) => page.slug === entry.slug)).length,
    [pages]
  );

  useEffect(() => {
    if (loading || error || attempted.current) return;
    if (missingCount === 0) return;
    attempted.current = true;
    (async () => {
      setSyncing(true);
      try {
        const payload = await apiRequest('/api/content/pages/register', { method: 'POST' });
        const created = payload.data?.createdCount || 0;
        if (created > 0) {
          notify(`${created} website page${created === 1 ? '' : 's'} registered in the CMS.`);
        }
        refresh();
      } catch (err) {
        setSyncError(err.message);
      } finally {
        setSyncing(false);
      }
    })();
  }, [loading, error, missingCount, refresh, notify]);

  useEffect(() => {
    if (loading || error || attemptedLayoutSync.current) return;
    if (!pages.length) return;
    const anyMapped = pages.some((page) =>
      (page.sections || []).some((section) => section.data?.layoutKey),
    );
    if (anyMapped) return;
    attemptedLayoutSync.current = true;
    (async () => {
      setSyncing(true);
      try {
        const payload = await apiRequest('/api/content/pages/sync-layout', { method: 'POST' });
        const created = payload.data?.createdCount || 0;
        if (created > 0) {
          notify(`${created} existing website section${created === 1 ? '' : 's'} mapped into the CMS.`);
        }
        refresh();
      } catch (err) {
        setSyncError(err.message);
      } finally {
        setSyncing(false);
      }
    })();
  }, [loading, error, pages, refresh, notify]);

  async function runLayoutSync() {
    setSyncing(true);
    setSyncError('');
    try {
      const payload = await apiRequest('/api/content/pages/sync-layout', { method: 'POST' });
      const created = payload.data?.createdCount || 0;
      notify(
        created > 0
          ? `${created} website section${created === 1 ? '' : 's'} mapped into the CMS.`
          : 'Every website page already maps to its CMS sections.',
      );
      refresh();
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = rows.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      if (templateFilter && row.template.value !== templateFilter) return false;
      if (groupFilter && row.group !== groupFilter) return false;
      if (!term) return true;
      return [row.title, row.slug, row.url, row.description, row.group]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
    if (sort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'updated') {
      list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } else if (sort === 'sections') {
      list.sort((a, b) => b.sections.length - a.sections.length || a.title.localeCompare(b.title));
    }
    return list;
  }, [rows, q, statusFilter, templateFilter, groupFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const meta = {
    page: currentPage,
    pageSize: PAGE_SIZE,
    total: filtered.length,
    totalPages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };

  const stats = useMemo(() => {
    const published = rows.filter((row) => row.status === 'published').length;
    const drafts = rows.filter((row) => row.status === 'draft').length;
    const sections = rows.reduce((total, row) => total + row.sections.length, 0);
    const registeredCustom = rows.filter((row) => row.kind === 'custom').length;
    return { total: rows.length, published, drafts, sections, registeredCustom };
  }, [rows]);

  function resetPage() {
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setValues({ title: '', slug: '', template: 'editorial', status: 'draft', content: '', seoTitle: '', seoDescription: '' });
    setSlugTouched(false);
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(row) {
    if (!row.id) {
      notify('This page is not registered yet. Register website pages first.', 'error');
      return;
    }
    setEditing(row);
    setValues({
      title: row.title,
      slug: row.slug,
      template: row.template.value === 'system' || row.template.value === 'template' ? 'blank' : row.template.value,
      status: row.status === 'live' ? 'published' : row.status,
      content: row.page?.content || '',
      seoTitle: row.page?.seoTitle || '',
      seoDescription: row.page?.seoDescription || '',
    });
    setSlugTouched(true);
    setFormError('');
    setFormOpen(true);
  }

  function setValue(name, value) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'title' && !slugTouched && !editing) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    const title = values.title.trim();
    if (title.length < 2) {
      setFormError('Page title is required.');
      return;
    }
    const slug = slugify(values.slug) || slugify(title);
    if (!slug) {
      setFormError('Add a slug using letters, numbers and hyphens.');
      return;
    }
    const clash = rows.find((row) => row.slug === slug && row.key !== editing?.key);
    if (clash) {
      setFormError(`“${slug}” is already used by ${clash.title}. Choose a different slug.`);
      return;
    }

    const payload = {
      title,
      slug,
      status: values.status || 'draft',
      content: values.content,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
    };

    const currentTemplate = editing ? deriveTemplate(editing.sections) : 'blank';
    if (!editing) {
      payload.sections = starterSections(values.template);
    } else if (values.template !== currentTemplate) {
      const existingTypes = new Set((editing.sections || []).map((section) => section.type));
      const additions = starterSections(values.template).filter((section) => !existingTypes.has(section.type));
      if (additions.length) {
        payload.sections = [...serializeSections(editing.sections), ...additions];
      }
    }

    setSaving(true);
    try {
      await apiRequest(editing ? `/api/content/pages/${editing.id}` : '/api/content/pages', {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      notify(editing ? 'Page updated.' : 'Page created.');
      setFormOpen(false);
      setSort('updated');
      resetPage();
      refresh();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/content/pages/${confirm.row.id}`, { method: 'DELETE' });
      notify('Page deleted.');
      setConfirm(null);
      setDetail(null);
      refresh();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = Boolean(q.trim() || statusFilter || templateFilter || groupFilter);

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Website Studio</span>
          <h1>Pages</h1>
          <p>
            Every public page on the RootEco storefront — built-in routes and CMS pages in one place. Open
            Sections to review, edit and reorder the real content blocks on each page.
          </p>
        </div>
        <div className="actions">
          <Button as={Link} href="/" target="_blank" $variant="outline">
            <ExternalLink size={14} /> View website
          </Button>
          <Button type="button" $variant="outline" onClick={runLayoutSync} disabled={loading || syncing}>
            <Layers size={14} /> {syncing ? 'Syncing…' : 'Sync content'}
          </Button>
          <Button type="button" $variant="outline" onClick={refresh} disabled={loading || syncing}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus size={14} /> New page
          </Button>
        </div>
      </PageHeader>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <StatCard label="Public pages" value={stats.total} caption={`${PUBLIC_PAGES.length} built-in routes`} />
        <StatCard label="Published" value={stats.published} caption="Live sections on the website" />
        <StatCard label="Drafts" value={stats.drafts} caption="Hidden from visitors" tone="var(--dash-accent)" />
        <StatCard label="Sections" value={stats.sections} caption="CMS sections across all pages" />
      </div>

      {syncError && <ErrorBlock message={`Could not synchronize website pages: ${syncError}`} onRetry={() => { attempted.current = false; attemptedLayoutSync.current = false; setSyncError(''); refresh(); }} />}
      {error && <ErrorBlock message={error} onRetry={refresh} />}

      <Card $pad="16px">
        <Toolbar>
          <SearchBox
            value={q}
            onChange={(value) => {
              setQ(value);
              resetPage();
            }}
            placeholder="Search pages by title, slug or URL…"
          />
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              resetPage();
            }}
            style={{ width: 'auto', minWidth: 150 }}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={templateFilter}
            onChange={(event) => {
              setTemplateFilter(event.target.value);
              resetPage();
            }}
            style={{ width: 'auto', minWidth: 150 }}
            aria-label="Filter by template"
          >
            <option value="">All templates</option>
            {TEMPLATE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={groupFilter}
            onChange={(event) => {
              setGroupFilter(event.target.value);
              resetPage();
            }}
            style={{ width: 'auto', minWidth: 150 }}
            aria-label="Filter by page type"
          >
            <option value="">All page types</option>
            {[...PAGE_GROUPS, 'Custom'].map((group) => (
              <option key={group} value={group}>
                {GROUP_LABELS[group] || group}
              </option>
            ))}
          </Select>
          <div className="spacer" />
          <Select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              resetPage();
            }}
            style={{ width: 'auto', minWidth: 160 }}
            aria-label="Sort pages"
          >
            <option value="website">Website order</option>
            <option value="updated">Recently updated</option>
            <option value="title">Title A–Z</option>
            <option value="sections">Most sections</option>
          </Select>
        </Toolbar>

        {loading ? (
          <SkeletonRows rows={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={19} />}
            title="No pages match these filters"
            text="Try a different search, or clear the filters to see every public page."
            action={
              hasFilters ? (
                <Button
                  type="button"
                  $variant="outline"
                  onClick={() => {
                    setQ('');
                    setStatusFilter('');
                    setTemplateFilter('');
                    setGroupFilter('');
                    resetPage();
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button type="button" onClick={openCreate}>
                  <Plus size={14} /> New page
                </Button>
              )
            }
          />
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th style={{ minWidth: 230 }}>Page</th>
                  <th style={{ minWidth: 190 }}>URL</th>
                  <th style={{ width: 110 }}>Template</th>
                  <th style={{ width: 96 }}>Sections</th>
                  <th style={{ width: 110 }}>Status</th>
                  <th style={{ minWidth: 130 }}>Last updated</th>
                  <th style={{ textAlign: 'right', width: 170 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => {
                  const hidden = row.sections.length - visibleCount(row.sections);
                  return (
                    <tr key={row.key} onClick={() => setDetail(row)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                          <span
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              display: 'grid',
                              placeItems: 'center',
                              background: row.kind === 'custom' ? 'var(--dash-accent-soft)' : 'var(--dash-panel-3)',
                              color: row.kind === 'custom' ? 'var(--dash-accent)' : 'var(--dash-muted)',
                              flexShrink: 0,
                            }}
                          >
                            {row.kind === 'custom' ? <FileText size={14} /> : <Layers size={14} />}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--dash-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {row.title}
                            </div>
                            <div style={{ fontSize: 10.5, color: 'var(--dash-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {GROUP_LABELS[row.group] || row.group}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="muted" style={{ fontSize: 11.5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {row.url}
                        </span>
                      </td>
                      <td>
                        <Badge $tone={TEMPLATE_TONES[row.template.value] || 'neutral'}>{row.template.label}</Badge>
                      </td>
                      <td>
                        <Badge $tone={row.sections.length ? 'gold' : 'neutral'}>{row.sections.length}</Badge>
                        {hidden > 0 && (
                          <div style={{ fontSize: 10, color: 'var(--dash-faint)', marginTop: 3 }}>{hidden} hidden</div>
                        )}
                      </td>
                      <td>
                        {row.page ? <StatusBadgeSafe value={row.status} /> : <Badge $tone="green">Live</Badge>}
                        <div style={{ fontSize: 10, color: 'var(--dash-faint)', marginTop: 3 }}>
                          {row.kind === 'custom' ? 'full page' : 'CMS sections'}
                        </div>
                      </td>
                      <td>{row.updatedAt ? formatDate(row.updatedAt, true) : <span className="muted">—</span>}</td>
                      <td onClick={(event) => event.stopPropagation()}>
                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
                          <Button
                            as={Link}
                            href={`/dashboard/pages/${row.id}/sections`}
                            $variant="outline"
                            aria-disabled={!row.id}
                            onClick={(event) => {
                              if (!row.id) event.preventDefault();
                            }}
                            style={{ padding: '5px 9px', fontSize: 11, color: 'var(--dash-accent)', borderColor: 'rgba(233,166,78,0.35)' }}
                          >
                            <LayoutList size={12} /> Sections
                          </Button>
                          <IconButton
                            as={Link}
                            href={row.status === 'draft' && row.id ? `/preview/${row.slug}?id=${row.id}` : row.registry?.redirectTo || row.url}
                            target={row.url.startsWith('http') ? undefined : '_blank'}
                            aria-label="Preview page"
                            title="Preview page"
                          >
                            <ExternalLink />
                          </IconButton>
                          <IconButton type="button" onClick={() => openEdit(row)} aria-label="Edit page" title="Edit page">
                            <Pencil />
                          </IconButton>
                          {row.locked ? (
                            <IconButton type="button" aria-label="Protected page" title="Built-in route — delete disabled" style={{ color: 'var(--dash-faint)' }} onClick={() => notify('Built-in website routes are protected. Unpublish the page to hide its CMS sections.', 'error')}>
                              <Lock />
                            </IconButton>
                          ) : (
                            <IconButton type="button" onClick={() => setConfirm({ row })} aria-label="Delete page" title="Delete page" style={{ color: 'var(--dash-red)' }}>
                              <Trash2 />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableScroll>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--dash-faint)' }}>
            {hasFilters ? `${filtered.length} of ${rows.length} pages` : `All ${rows.length} public pages`}
            {missingCount > 0 ? ` · ${missingCount} route${missingCount === 1 ? '' : 's'} pending registration` : ''}
          </span>
          <div style={{ flex: 1 }} />
          <Pagination meta={meta} onPage={setPage} />
        </div>
      </Card>

      <Drawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.title}` : 'New page'}
        subtitle={
          editing
            ? 'Update the page details. Section order is managed in the section manager.'
            : 'Create a CMS page with its own sections, SEO details and public URL.'
        }
        width={620}
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="page-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create page'}
            </Button>
          </>
        }
      >
        <form id="page-form" onSubmit={submit}>
          {formError && (
            <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(224,122,95,0.4)', background: 'rgba(224,122,95,0.1)', color: 'var(--dash-red)', fontSize: 12 }}>
              {formError}
            </div>
          )}
          <FormGrid>
            <Field label="Page title" required full>
              <Input value={values.title} onChange={(event) => setValue('title', event.target.value)} placeholder="Corporate gifting guide" />
            </Field>
            <Field
              label="URL slug"
              hint={editing?.locked ? 'Built-in route — the slug is fixed.' : `Public URL: /pages/${slugify(values.slug) || 'your-slug'}`}
            >
              <Input
                value={values.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setValue('slug', event.target.value);
                }}
                disabled={Boolean(editing?.locked)}
                placeholder="corporate-gifting-guide"
              />
            </Field>
            <Field label="Publication status">
              <Select value={values.status} onChange={(event) => setValue('status', event.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </Select>
            </Field>
            <Field
              label={editing ? 'Template (starter sections)' : 'Template'}
              hint={
                editing
                  ? `Current layout: ${TEMPLATE_LABELS[deriveTemplate(editing.sections)]}. Choosing another template appends its starter sections and keeps existing ones.`
                  : TEMPLATE_OPTIONS.find((option) => option.value === values.template)?.description
              }
              full
            >
              <Select value={values.template} onChange={(event) => setValue('template', event.target.value)}>
                {TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} — {option.description}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Intro content" hint="Rendered above the sections. Optional." full>
              <Textarea value={values.content} onChange={(event) => setValue('content', event.target.value)} rows={4} placeholder="Short introduction for this page." />
            </Field>
            <Field label="SEO title" full>
              <Input value={values.seoTitle} onChange={(event) => setValue('seoTitle', event.target.value)} placeholder="Corporate gifting guide | RootEco" />
            </Field>
            <Field label="SEO description" full>
              <Textarea value={values.seoDescription} onChange={(event) => setValue('seoDescription', event.target.value)} rows={3} placeholder="A one-sentence summary for search results and sharing." />
            </Field>
          </FormGrid>
          {editing?.locked && (
            <p style={{ marginTop: 14, fontSize: 11.5, color: 'var(--dash-faint)', lineHeight: 1.6 }}>
              This is a built-in storefront route. Its layout and route metadata come from the application; this record
              holds the CMS sections and page details used by the dashboard.
            </p>
          )}
        </form>
      </Drawer>

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.title || 'Page'}
        subtitle={detail?.url}
        width={560}
        footer={
          detail && (
            <>
              <Button as={Link} href={detail.registry?.redirectTo || detail.url} target="_blank" $variant="outline">
                <ExternalLink size={14} /> Open live
              </Button>
              <Button as={Link} href={`/dashboard/pages/${detail.id}/sections`} style={{ marginLeft: 'auto' }}>
                <LayoutList size={14} /> Manage sections
              </Button>
            </>
          )
        }
      >
        {detail && (
          <>
            <DetailSection title="Page">
              <DetailList>
                <DetailRow label="Title">{detail.title}</DetailRow>
                <DetailRow label="URL">{detail.url}</DetailRow>
                <DetailRow label="Type">{GROUP_LABELS[detail.group] || detail.group}</DetailRow>
                <DetailRow label="Template">
                  <Badge $tone={TEMPLATE_TONES[detail.template.value] || 'neutral'}>{detail.template.label}</Badge>
                </DetailRow>
                <DetailRow label="Status">
                  {detail.page ? <StatusBadgeSafe value={detail.status} /> : <Badge $tone="green">Live</Badge>}
                </DetailRow>
                <DetailRow label="Sections">
                  {detail.sections.length} total · {visibleCount(detail.sections)} visible
                </DetailRow>
                <DetailRow label="Last updated">{detail.updatedAt ? formatDate(detail.updatedAt, true) : '—'}</DetailRow>
                {detail.page && <DetailRow label="Created">{formatDate(detail.page.createdAt)}</DetailRow>}
              </DetailList>
              {detail.description && (
                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--dash-muted)', lineHeight: 1.6 }}>{detail.description}</p>
              )}
            </DetailSection>

            <DetailSection title="Sections">
              {detail.sections.length === 0 ? (
                <EmptyState title="No sections yet" text="Open Manage sections to add a hero, text, collection or process section." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detail.sections.map((section, index) => (
                    <div
                      key={section.id || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--dash-line-soft)',
                        background: 'var(--dash-panel-2)',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: 'var(--dash-faint)', fontVariantNumeric: 'tabular-nums' }}>{index + 1}</span>
                      <Badge $tone="neutral">{section.type}</Badge>
                      <span style={{ flex: 1, color: 'var(--dash-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {section.heading || section.body || 'Untitled section'}
                      </span>
                      <Badge $tone={section.data?.visible === false ? 'red' : 'green'}>
                        {section.data?.visible === false ? 'hidden' : 'visible'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Button as={Link} href={`/dashboard/pages/${detail.id}`} $variant="outline" style={{ flex: 1 }}>
                  <FileText size={14} /> Page builder
                </Button>
                <Button
                  as={Link}
                  href={detail.status === 'draft' ? `/preview/${detail.slug}?id=${detail.id}` : detail.registry?.redirectTo || detail.url}
                  $variant="outline"
                  target="_blank"
                  style={{ flex: 1 }}
                >
                  <ExternalLink size={14} /> Preview
                </Button>
              </div>
            </DetailSection>

            {!detail.locked && (
              <DetailSection title="Danger zone">
                <p style={{ fontSize: 12, color: 'var(--dash-muted)', lineHeight: 1.6, marginBottom: 10 }}>
                  Deleting removes this CMS page record and its sections. Published pages disappear from the website.
                </p>
                <Button type="button" $variant="danger" onClick={() => setConfirm({ row: detail })}>
                  <Trash2 size={14} /> Delete page
                </Button>
              </DetailSection>
            )}
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete this page?"
        message={
          confirm
            ? `“${confirm.row.title}” and its ${confirm.row.sections.length} section${confirm.row.sections.length === 1 ? '' : 's'} will be removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete page"
        busy={deleting}
      />
    </>
  );
}

function StatusBadgeSafe({ value }) {
  const tone = value === 'published' ? 'green' : value === 'draft' ? 'neutral' : 'blue';
  return <Badge $tone={tone}>{String(value || '').replace(/-/g, ' ')}</Badge>;
}
