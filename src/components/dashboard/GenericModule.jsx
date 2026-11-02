'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Pencil, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import theme from '@/styles/theme';
import {
  Button,
  Card,
  CheckRow,
  EmptyState,
  ErrorBlock,
  Field,
  FormGrid,
  ImageField,
  ImageListField,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Pagination,
  Select,
  StatusBadge,
  Table,
  TableScroll,
  Textarea,
  Toolbar,
  SearchBox,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, useDebounced, useList } from '@/components/dashboard/hooks';

const MultiBox = styled.div`
  border: 1.5px solid ${theme.colors.line};
  border-radius: 10px;
  background: #fff;
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
    font-size: 12.5px;
    color: ${theme.colors.ink};
    padding: 2px 0;
  }
  input {
    accent-color: ${theme.colors.forest};
  }
  .empty {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`;

const SectionBox = styled.div`
  border: 1px solid ${theme.colors.line};
  border-radius: 12px;
  background: #fff;
  padding: 12px;
  & + & {
    margin-top: 10px;
  }
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
    strong {
      font-size: 12px;
      color: ${theme.colors.forest};
    }
    .tools {
      display: flex;
      gap: 4px;
    }
  }
`;

function SectionEditor({ value = [], onChange }) {
  const rows = Array.isArray(value) ? value : [];
  const update = (index, patch) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };
  const move = (index, direction) => {
    const next = [...rows];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <div>
      {rows.map((section, index) => (
        <SectionBox key={section.id || index}>
          <div className="section-head">
            <strong>Section {index + 1}</strong>
            <div className="tools">
              <Button type="button" $variant="ghost" onClick={() => move(index, -1)} style={{ padding: 5 }} aria-label="Move up">
                <ArrowUp size={13} />
              </Button>
              <Button type="button" $variant="ghost" onClick={() => move(index, 1)} style={{ padding: 5 }} aria-label="Move down">
                <ArrowDown size={13} />
              </Button>
              <Button
                type="button"
                $variant="ghost"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                style={{ padding: 5, color: theme.colors.sale }}
                aria-label="Remove section"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
          <FormGrid>
            <Field label="Type">
              <Select
                value={section.type || 'text'}
                onChange={(event) => update(index, { type: event.target.value })}
              >
                <option value="text">Text</option>
                <option value="image">Image + text</option>
                <option value="quote">Quote</option>
                <option value="columns">Columns</option>
                <option value="cta">Call to action</option>
              </Select>
            </Field>
            <Field label="Heading">
              <Input
                value={section.heading || ''}
                onChange={(event) => update(index, { heading: event.target.value })}
                placeholder="Section heading"
              />
            </Field>
            <Field label="Body" full>
              <Textarea
                value={section.body || ''}
                onChange={(event) => update(index, { body: event.target.value })}
                placeholder="Section copy"
              />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <ImageField
                label="Image"
                value={section.image || ''}
                onChange={(url) => update(index, { image: url })}
              />
            </div>
          </FormGrid>
        </SectionBox>
      ))}
      <Button
        type="button"
        $variant="outline"
        onClick={() => onChange([...rows, { type: 'text', heading: '', body: '', image: '', data: null }])}
        style={{ marginTop: rows.length ? 10 : 0 }}
      >
        <Plus size={14} /> Add section
      </Button>
    </div>
  );
}

function fieldValues(fields, row, defaults = {}) {
  const values = {};
  for (const field of fields) {
    const raw = row ? row[field.name] : defaults[field.name];
    if (field.type === 'tags' || field.type === 'multiselect' || field.type === 'imagelist') {
      values[field.name] = Array.isArray(raw) ? raw : [];
    } else if (field.type === 'json') {
      values[field.name] = raw ? JSON.stringify(raw, null, 2) : '';
    } else if (field.type === 'date') {
      values[field.name] = raw ? String(raw).slice(0, 10) : '';
    } else if (field.type === 'checkbox') {
      values[field.name] = Boolean(raw);
    } else if (field.type === 'sections') {
      values[field.name] = Array.isArray(raw) ? raw : [];
    } else {
      values[field.name] = raw ?? '';
    }
  }
  return values;
}

function serializeValues(fields, values) {
  const payload = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === 'tags') {
      payload[field.name] = String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (field.type === 'imagelist' || field.type === 'multiselect') {
      payload[field.name] = Array.isArray(value) ? value : [];
    } else if (field.type === 'checkbox') {
      payload[field.name] = Boolean(value);
    } else if (field.type === 'number') {
      payload[field.name] = value === '' || value === null ? undefined : Number(value);
    } else if (field.type === 'json') {
      if (!value || !String(value).trim()) {
        payload[field.name] = null;
      } else {
        payload[field.name] = JSON.parse(value);
      }
    } else if (field.type === 'date') {
      payload[field.name] = value ? new Date(value).toISOString() : null;
    } else if (field.type === 'sections') {
      payload[field.name] = Array.isArray(value) ? value : [];
    } else {
      payload[field.name] = value === '' ? undefined : value;
    }
  }
  return payload;
}

function renderInput(field, values, setValue) {
  const value = values[field.name];

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          value={value}
          onChange={(event) => setValue(field.name, event.target.value)}
          placeholder={field.placeholder}
          $tall={field.tall}
          required={field.required}
        />
      );
    case 'select':
      return (
        <Select
          value={value ?? ''}
          onChange={(event) => setValue(field.name, event.target.value)}
          required={field.required}
        >
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
        <CheckRow>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => setValue(field.name, event.target.checked)}
          />
          {field.checkboxLabel || 'Enabled'}
        </CheckRow>
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
        <Input
          type="date"
          value={value}
          onChange={(event) => setValue(field.name, event.target.value)}
          required={field.required}
        />
      );
    case 'image':
      return <ImageField label={field.label} value={value} onChange={(url) => setValue(field.name, url)} />;
    case 'imagelist':
      return (
        <ImageListField
          label={field.label}
          value={value}
          onChange={(next) => setValue(field.name, next)}
        />
      );
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
    case 'json':
      return (
        <Textarea
          value={value}
          onChange={(event) => setValue(field.name, event.target.value)}
          placeholder={field.placeholder || '{\n  "key": "value"\n}'}
          style={{ fontFamily: 'monospace', fontSize: 12.5 }}
          $tall
        />
      );
    case 'sections':
      return <SectionEditor value={value} onChange={(next) => setValue(field.name, next)} />;
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

export default function GenericModule({
  eyebrow,
  title,
  description,
  endpoint,
  columns,
  fields,
  defaults = {},
  filters = [],
  searchPlaceholder = 'Search…',
  pageSize = 15,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  transformOut,
  transformIn,
  headerActions,
  emptyTitle,
  emptyText,
  rowActions,
  getRowKey = (row) => row.id,
  defaultSort,
  onSaved,
}) {
  const { notify } = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState({});
  const [sort, setSort] = useState('');
  const debouncedQ = useDebounced(q, 320);

  const activeFilters = useMemo(
    () => Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value !== '')),
    [filterValues]
  );

  const { data, meta, loading, error, refresh } = useList(endpoint, {
    q: debouncedQ,
    page,
    pageSize,
    filters: activeFilters,
    sort,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(() => fieldValues(fields, null, defaults));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const setValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  function openCreate() {
    setEditing(null);
    setValues(fieldValues(fields, null, defaults));
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(row) {
    const source = transformIn ? transformIn(row) : row;
    setEditing(row);
    setValues(fieldValues(fields, source, defaults));
    setFormError('');
    setModalOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      let payload = serializeValues(fields, values);
      if (transformOut) payload = transformOut(payload, editing ? 'update' : 'create', editing);
      const path = editing ? `${endpoint}/${editing.id}` : endpoint;
      const response = await apiRequest(path, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      notify(editing ? 'Changes saved.' : 'Created successfully.');
      setModalOpen(false);
      refresh();
      onSaved?.(response.data);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row, label) {
    if (!window.confirm(`Delete ${label || 'this record'}? This cannot be undone.`)) return;
    try {
      await apiRequest(`${endpoint}/${row.id}`, { method: 'DELETE' });
      notify('Deleted.');
      refresh();
    } catch (err) {
      notify(err.message, 'error');
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
          {canCreate && (
            <Button type="button" onClick={openCreate}>
              <Plus size={15} /> Add new
            </Button>
          )}
        </div>
      </PageHeader>

      <Card>
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
              style={{ width: 'auto', minWidth: 150 }}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ))}
          {defaultSort?.length > 1 && (
            <Select
              value={sort}
              onChange={(event) => { setSort(event.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: 150 }}
            >
              <option value="">Default order</option>
              {defaultSort.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Toolbar>

        {error && <ErrorBlock message={error} onRetry={refresh} />}
        {loading ? (
          <LoadingBlock label="Loading records…" />
        ) : data.length === 0 ? (
          <EmptyState title={emptyTitle || 'No records found'} text={emptyText || 'Try a different search or create a new record.'} />
        ) : (
          <>
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} style={{ width: column.width }}>{column.label}</th>
                    ))}
                    {(canEdit || canDelete || rowActions) && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={getRowKey(row)}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.render ? column.render(row) : row[column.key] ?? '—'}
                        </td>
                      ))}
                      {(canEdit || canDelete || rowActions) && (
                        <td>
                          <div className="actions">
                            {rowActions?.(row)}
                            {canEdit && (
                              <Button
                                type="button"
                                $variant="ghost"
                                onClick={() => openEdit(row)}
                                style={{ padding: 6 }}
                                aria-label="Edit"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                type="button"
                                $variant="ghost"
                                onClick={() => remove(row, row.name || row.title || row.code || row.question)}
                                style={{ padding: 6, color: theme.colors.sale }}
                                aria-label="Delete"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
            <Pagination meta={meta} onPage={(next) => setPage(next)} />
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${title.replace(/s$/, '')}` : `New ${title.replace(/s$/, '')}`}
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="generic-module-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </Button>
          </>
        }
      >
        {formError && <ErrorBlock message={formError} />}
        <form id="generic-module-form" onSubmit={submit}>
          <FormGrid>
            {fields.map((field) => {
              if (field.type === 'image' || field.type === 'imagelist') {
                return (
                  <div key={field.name} style={{ gridColumn: '1 / -1' }}>
                    {renderInput(field, values, setValue)}
                  </div>
                );
              }
              return (
                <Field
                  key={field.name}
                  label={field.label}
                  required={field.required}
                  hint={field.hint}
                  full={field.full || ['textarea', 'multiselect', 'json', 'sections'].includes(field.type)}
                >
                  {renderInput(field, values, setValue)}
                </Field>
              );
            })}
            {fields.some((field) => field.type === 'select' && field.name === 'status') && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 11, color: theme.colors.muted }}>
                  Published records appear immediately on the storefront.
                </span>
              </div>
            )}
          </FormGrid>
        </form>
      </Modal>
    </>
  );
}
