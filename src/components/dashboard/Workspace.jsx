'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  LayoutGrid,
  Pencil,
  Plus,
  RefreshCw,
  Rows3,
  Trash2,
} from 'lucide-react';
import styled from 'styled-components';
import {
  Button,
  Card,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorBlock,
  Field,
  FormGrid,
  IconButton,
  ImageField,
  ImageListField,
  Input,
  PageHeader,
  Pagination,
  SearchBox,
  Select,
  SkeletonRows,
  Table,
  TableScroll,
  Textarea,
  Toggle,
  Toolbar,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, buildQuery, useDebounced, useList } from '@/components/dashboard/hooks';

const GridWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
`;

const GridCard = styled.button`
  text-align: left;
  background: var(--dash-panel);
  border: 1px solid var(--dash-line);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.15s ease, transform 0.15s ease;
  &:hover {
    border-color: rgba(233, 166, 78, 0.4);
    transform: translateY(-1px);
  }
`;

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  margin-bottom: 12px;
  border-radius: 9px;
  border: 1px solid rgba(233, 166, 78, 0.28);
  background: var(--dash-accent-soft);
  font-size: 12px;
  color: var(--dash-ink);
  flex-wrap: wrap;
  .count { font-weight: 650; color: var(--dash-accent); }
`;

const MultiBox = styled.div`
  border: 1px solid var(--dash-line);
  border-radius: 9px;
  background: var(--dash-panel-2);
  max-height: 170px;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--dash-ink);
    padding: 2px 0;
  }
  input { accent-color: var(--dash-accent); }
  .empty { font-size: 11.5px; color: var(--dash-faint); }
`;

const DetailList = styled.dl`
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 10px 16px;
  font-size: 12.5px;
  margin: 0;
  dt { color: var(--dash-faint); }
  dd { color: var(--dash-ink); margin: 0; overflow-wrap: anywhere; }
`;

export function DetailRow({ label, children }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{children ?? '—'}</dd>
    </>
  );
}

export function DetailSection({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      {title && (
        <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--dash-faint)', marginBottom: 10 }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export { DetailList };

function initialValues(fields, row, defaults = {}) {
  const values = {};
  for (const field of fields) {
    const raw = row ? row[field.name] : defaults[field.name];
    if (field.type === 'tags' || field.type === 'multiselect' || field.type === 'imagelist') {
      values[field.name] = Array.isArray(raw) ? raw : [];
    } else if (field.type === 'checkbox') {
      values[field.name] = Boolean(raw);
    } else if (field.type === 'json') {
      values[field.name] = raw ? JSON.stringify(raw, null, 2) : '';
    } else if (field.type === 'date') {
      values[field.name] = raw ? String(raw).slice(0, 10) : '';
    } else {
      values[field.name] = raw ?? '';
    }
  }
  return values;
}

function serialize(fields, values) {
  const payload = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === 'tags') {
      payload[field.name] = String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (field.type === 'multiselect' || field.type === 'imagelist') {
      payload[field.name] = Array.isArray(value) ? value : [];
    } else if (field.type === 'checkbox') {
      payload[field.name] = Boolean(value);
    } else if (field.type === 'number') {
      payload[field.name] = value === '' || value === null || value === undefined ? undefined : Number(value);
    } else if (field.type === 'json') {
      payload[field.name] = !value || !String(value).trim() ? null : JSON.parse(value);
    } else if (field.type === 'date') {
      payload[field.name] = value ? new Date(value).toISOString() : null;
    } else {
      const clean = typeof value === 'string' ? value.trim() : value;
      payload[field.name] = clean === '' || clean === undefined ? undefined : clean;
    }
  }
  return payload;
}

function renderControl(field, values, setValue) {
  const value = values[field.name];
  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          value={value}
          onChange={(event) => setValue(field.name, event.target.value)}
          placeholder={field.placeholder}
          $tall={field.tall}
          rows={field.rows}
          required={field.required}
        />
      );
    case 'select':
      return (
        <Select value={value ?? ''} onChange={(event) => setValue(field.name, event.target.value)} required={field.required}>
          <option value="">{field.placeholder || 'Select…'}</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    case 'checkbox':
      return (
        <Toggle
          checked={Boolean(value)}
          onChange={(next) => setValue(field.name, next)}
          label={field.checkboxLabel || 'Enabled'}
          hint={field.checkboxHint}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={value}
          onChange={(event) => setValue(field.name, event.target.value)}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
    case 'date':
      return (
        <Input type="date" value={value} onChange={(event) => setValue(field.name, event.target.value)} required={field.required} />
      );
    case 'image':
      return <ImageField label={field.label} value={value} onChange={(url) => setValue(field.name, url)} />;
    case 'imagelist':
      return <ImageListField label={field.label} value={value} onChange={(next) => setValue(field.name, next)} />;
    case 'multiselect':
      return (
        <MultiBox>
          {(field.options || []).length === 0 ? (
            <span className="empty">No options available yet.</span>
          ) : (
            (field.options || []).map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(event) => {
                    const current = Array.isArray(value) ? value : [];
                    setValue(
                      field.name,
                      event.target.checked
                        ? [...current, option.value]
                        : current.filter((item) => item !== option.value)
                    );
                  }}
                />
                {option.label}
              </label>
            ))
          )}
        </MultiBox>
      );
    case 'tags':
      return (
        <Input
          value={value}
          onChange={(event) => setValue(field.name, event.target.value)}
          placeholder={field.placeholder || 'gifting, hampers, festive'}
        />
      );
    case 'json':
      return (
        <Textarea
          value={value}
          onChange={(event) => setValue(field.name, event.target.value)}
          placeholder={field.placeholder || '{\n  "key": "value"\n}'}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
          $tall
        />
      );
    default:
      return (
        <Input
          type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={(event) => setValue(field.name, event.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          autoComplete="off"
        />
      );
  }
}

function downloadCsv(filename, rows, columns) {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const header = columns.map((column) => escape(column.label)).join(',');
  const lines = rows.map((row) =>
    columns
      .map((column) => {
        const raw = column.csvValue ? column.csvValue(row) : row[column.key];
        return escape(raw);
      })
      .join(',')
  );
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Workspace({
  eyebrow,
  title,
  description,
  endpoint,
  itemLabel = 'record',
  columns,
  fields,
  defaults = {},
  filters = [],
  searchPlaceholder = 'Search…',
  pageSize = 15,
  createLabel = 'Add new',
  canCreate = true,
  canEdit = true,
  canDelete = true,
  transformIn,
  transformOut,
  emptyTitle,
  emptyText,
  emptyIcon,
  rowActions,
  getRowKey = (row) => row.id,
  renderDetail,
  renderCard,
  viewModes = ['table'],
  defaultView = 'table',
  exportName,
  sortOptions = [],
  itemLabelPlural: itemLabelPluralProp,
  liveHref,
  headerActions,
  onChanged,
  detailWidth = 540,
  validate,
}) {
  const { notify } = useToast();
  const itemLabelPlural = itemLabelPluralProp || `${itemLabel}s`;
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState({});
  const [sort, setSort] = useState('');
  const [view, setView] = useState(defaultView);
  const [selected, setSelected] = useState([]);
  const [exporting, setExporting] = useState(false);
  const debouncedQ = useDebounced(q, 320);

  const activeFilters = useMemo(
    () => Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value !== '' && value !== undefined)),
    [filterValues]
  );

  const sortSpec = useMemo(() => {
    const option = sortOptions.find((entry) => entry.value === sort);
    return option ? { sort: option.sort, order: option.order || 'desc' } : { sort: '', order: '' };
  }, [sort, sortOptions]);

  const { data, meta, loading, error, refresh } = useList(endpoint, {
    q: debouncedQ,
    page,
    pageSize,
    filters: activeFilters,
    sort: sortSpec.sort,
    order: sortSpec.order,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(() => initialValues(fields, null, defaults));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setSelected([]);
  }, [debouncedQ, page, filterValues, sort]);

  const setValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const allChecked = data.length > 0 && selected.length === data.length;
  const toggleAll = () => setSelected(allChecked ? [] : data.map((row) => getRowKey(row)));
  const toggleOne = (key) => setSelected((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));

  function openCreate() {
    setEditing(null);
    setValues(initialValues(fields, null, defaults));
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(row) {
    const source = transformIn ? transformIn(row) : row;
    setEditing(row);
    setValues(initialValues(fields, source, defaults));
    setFormError('');
    setFormOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    const missing = fields.find((field) => field.required && !String(values[field.name] ?? '').trim());
    if (missing) {
      setFormError(`${missing.label} is required.`);
      return;
    }
    if (validate) {
      const message = validate(values, editing);
      if (message) {
        setFormError(message);
        return;
      }
    }
    setSaving(true);
    try {
      let payload = serialize(fields, values);
      if (transformOut) payload = transformOut(payload, editing ? 'update' : 'create', editing);
      const path = editing ? `${endpoint}/${editing.id}` : endpoint;
      await apiRequest(path, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      notify(editing ? 'Changes saved.' : `${itemLabel} created.`);
      setFormOpen(false);
      refresh();
      onChanged?.();
    } catch (err) {
      setFormError(err instanceof SyntaxError ? 'One of the JSON fields is not valid JSON.' : err.message);
    } finally {
      setSaving(false);
    }
  }

  async function requestDelete(row) {
    setConfirm({ row, label: row.title || row.name || row.code || row.question || row.email || itemLabel, ids: null });
  }

  async function requestBulkDelete() {
    setConfirm({ row: null, label: `${selected.length} selected ${selected.length === 1 ? itemLabel : itemLabelPlural}`, ids: selected });
  }

  async function confirmDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      const targets = confirm.ids || [getRowKey(confirm.row)];
      const results = await Promise.allSettled(
        targets.map((id) => apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }))
      );
      const failed = results.filter((result) => result.status === 'rejected');
      if (failed.length) {
        notify(`${failed.length} item${failed.length === 1 ? '' : 's'} could not be deleted.`, 'error');
      } else {
        notify(targets.length > 1 ? `${targets.length} items deleted.` : 'Deleted.');
      }
      setConfirm(null);
      setSelected([]);
      setDetail(null);
      refresh();
      onChanged?.();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  async function exportRows() {
    setExporting(true);
    try {
      const query = buildQuery({
        q: debouncedQ,
        page: 1,
        pageSize: 500,
        ...activeFilters,
        ...(sortSpec.sort ? { sort: sortSpec.sort, order: sortSpec.order } : {}),
      });
      const payload = await apiRequest(`${endpoint}${query}`);
      downloadCsv(
        `${exportName || itemLabel.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`,
        payload.data || [],
        columns
      );
      notify('Export ready.');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader>
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        <div className="actions">
          {headerActions}
          {exportName && (
            <Button type="button" $variant="outline" onClick={exportRows} disabled={exporting}>
              <Download size={14} /> {exporting ? 'Exporting…' : 'Export'}
            </Button>
          )}
          {canCreate && (
            <Button type="button" onClick={openCreate}>
              <Plus size={14} /> {createLabel}
            </Button>
          )}
        </div>
      </PageHeader>

      <Card $pad="16px">
        <Toolbar>
          <SearchBox value={q} onChange={(value) => { setQ(value); setPage(1); }} placeholder={searchPlaceholder} />
          {filters.map((filter) => (
            <Select
              key={filter.name}
              value={filterValues[filter.name] || ''}
              onChange={(event) => {
                setFilterValues((prev) => ({ ...prev, [filter.name]: event.target.value }));
                setPage(1);
              }}
              style={{ width: 'auto', minWidth: 140 }}
              aria-label={filter.label}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ))}
          <div className="spacer" />
          {sortOptions.length > 0 && (
            <Select
              value={sort}
              onChange={(event) => { setSort(event.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: 150 }}
              aria-label="Sort"
            >
              <option value="">Default order</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
          {viewModes.length > 1 && (
            <div style={{ display: 'flex', gap: 2, padding: 2, background: 'var(--dash-panel-2)', borderRadius: 8, border: '1px solid var(--dash-line)' }}>
              {viewModes.includes('table') && (
                <IconButton type="button" onClick={() => setView('table')} aria-label="Table view" style={{ width: 28, height: 28, background: view === 'table' ? 'var(--dash-panel-3)' : 'transparent', color: view === 'table' ? 'var(--dash-accent)' : undefined }}>
                  <Rows3 />
                </IconButton>
              )}
              {viewModes.includes('grid') && (
                <IconButton type="button" onClick={() => setView('grid')} aria-label="Grid view" style={{ width: 28, height: 28, background: view === 'grid' ? 'var(--dash-panel-3)' : 'transparent', color: view === 'grid' ? 'var(--dash-accent)' : undefined }}>
                  <LayoutGrid />
                </IconButton>
              )}
            </div>
          )}
          <IconButton type="button" onClick={refresh} aria-label="Refresh">
            <RefreshCw />
          </IconButton>
        </Toolbar>

        {selected.length > 0 && canDelete && (
          <BulkBar>
            <span className="count">{selected.length} selected</span>
            <span style={{ color: 'var(--dash-muted)' }}>Apply an action to the selected rows.</span>
            <div style={{ flex: 1 }} />
            <Button type="button" $variant="ghost" onClick={() => setSelected([])} style={{ padding: '5px 10px', fontSize: 11.5 }}>
              Clear
            </Button>
            <Button type="button" $variant="danger" onClick={requestBulkDelete} style={{ padding: '5px 10px', fontSize: 11.5 }}>
              <Trash2 size={13} /> Delete selected
            </Button>
          </BulkBar>
        )}

        {error ? (
          <ErrorBlock message={error} onRetry={refresh} />
        ) : loading ? (
          <SkeletonRows rows={Math.min(pageSize, 7)} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle || `No ${itemLabelPlural} found`}
            text={emptyText || 'Try a different search, clear filters, or create a new record.'}
            action={canCreate ? <Button type="button" onClick={openCreate}><Plus size={14} /> {createLabel}</Button> : null}
          />
        ) : view === 'grid' && renderCard ? (
          <GridWrap>
            {data.map((row) => (
              <div key={getRowKey(row)} style={{ position: 'relative' }}>
                <GridCard type="button" onClick={() => renderDetail && setDetail(row)}>
                  {renderCard(row)}
                </GridCard>
                {(canEdit || canDelete) && (
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 3 }}>
                    {canEdit && (
                      <IconButton type="button" onClick={() => openEdit(row)} aria-label="Edit" style={{ background: 'rgba(8,10,9,0.72)' }}>
                        <Pencil />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton type="button" onClick={() => requestDelete(row)} aria-label="Delete" style={{ background: 'rgba(8,10,9,0.72)', color: 'var(--dash-red)' }}>
                        <Trash2 />
                      </IconButton>
                    )}
                  </div>
                )}
              </div>
            ))}
          </GridWrap>
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  {canDelete && (
                    <th style={{ width: 38 }}>
                      <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all rows" />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th key={column.key} style={{ width: column.width, minWidth: column.width }}>
                      {column.label}
                    </th>
                  ))}
                  <th style={{ textAlign: 'right', width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => {
                  const key = getRowKey(row);
                  return (
                    <tr
                      key={key}
                      className={selected.includes(key) ? 'selected' : undefined}
                      onClick={() => renderDetail && setDetail(row)}
                      style={renderDetail ? { cursor: 'pointer' } : undefined}
                    >
                      {canDelete && (
                        <td onClick={(event) => event.stopPropagation()}>
                          <input type="checkbox" checked={selected.includes(key)} onChange={() => toggleOne(key)} aria-label="Select row" />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} style={column.width ? { width: column.width, minWidth: column.width } : undefined}>
                          {column.render ? column.render(row) : row[column.key] ?? '—'}
                        </td>
                      ))}
                      <td onClick={(event) => event.stopPropagation()}>
                        <div className="actions">
                          {rowActions?.(row, { edit: () => openEdit(row), remove: () => requestDelete(row), open: () => setDetail(row) })}
                          {canEdit && (
                            <IconButton type="button" onClick={() => openEdit(row)} aria-label="Edit" title="Edit">
                              <Pencil />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton type="button" onClick={() => requestDelete(row)} aria-label="Delete" title="Delete" style={{ color: 'var(--dash-red)' }}>
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
        <Pagination meta={meta} onPage={(next) => setPage(next)} />
      </Card>

      <Drawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${itemLabel}` : `New ${itemLabel}`}
        subtitle={editing ? 'Changes are saved immediately.' : 'Fill in the details below.'}
        width={600}
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="workspace-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : `Create ${itemLabel}`}
            </Button>
          </>
        }
      >
        {formError && <ErrorBlock message={formError} />}
        <form id="workspace-form" onSubmit={submit}>
          <FormGrid>
            {fields.map((field, index) => {
              const heading =
                field.section && field.section !== fields[index - 1]?.section ? (
                  <div key={`section-${field.section}`} style={{ gridColumn: '1 / -1', marginTop: index === 0 ? 0 : 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dash-faint)' }}>
                        {field.section}
                      </span>
                      <span style={{ flex: 1, height: 1, background: 'var(--dash-line)' }} />
                    </div>
                  </div>
                ) : null;
              const control =
                field.full || field.type === 'image' || field.type === 'imagelist' || field.type === 'multiselect' || field.type === 'json' ? (
                  <div key={field.name} style={{ gridColumn: '1 / -1' }}>
                    {field.type === 'image' || field.type === 'imagelist' ? (
                      renderControl(field, values, setValue)
                    ) : (
                      <Field label={field.label} required={field.required} hint={field.hint}>
                        {renderControl(field, values, setValue)}
                      </Field>
                    )}
                  </div>
                ) : (
                  <Field key={field.name} label={field.label} required={field.required} hint={field.hint} full={field.full}>
                    {renderControl(field, values, setValue)}
                  </Field>
                );
              return (
                <Fragment key={field.name}>
                  {heading}
                  {control}
                </Fragment>
              );
            })}
          </FormGrid>
        </form>
      </Drawer>

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? detail.title || detail.name || detail.code || detail.question || itemLabel : ''}
        subtitle={detail?.subtitle || detail?.email || detail?.slug || undefined}
        width={detailWidth}
        footer={
          detail ? (
            <>
              {detail && liveHref?.(detail) && (
                <Button as="a" href={liveHref(detail)} target="_blank" rel="noreferrer" $variant="outline">
                  <ExternalLink size={14} /> View live
                </Button>
              )}
              <Button type="button" $variant="outline" onClick={() => setDetail(null)}>
                Close
              </Button>
              {canEdit && (
                <Button type="button" onClick={() => { const row = detail; setDetail(null); openEdit(row); }}>
                  <Pencil size={14} /> Edit
                </Button>
              )}
            </>
          ) : null
        }
      >
        {detail && renderDetail ? (
          renderDetail(detail, { edit: () => { const row = detail; setDetail(null); openEdit(row); }, refresh })
        ) : (
          detail && (
            <DetailList>
              {columns.map((column) => (
                <DetailRow key={column.key} label={column.label}>
                  {column.render ? column.render(detail) : detail[column.key] ?? '—'}
                </DetailRow>
              ))}
            </DetailList>
          )
        )}
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title={`Delete ${confirm?.label || itemLabel}?`}
        message="This action cannot be undone. Related records may also be affected, depending on how this resource is connected."
        confirmLabel="Delete permanently"
      />
    </>
  );
}
