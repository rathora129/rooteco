'use client';

import { useCallback, useEffect, useState } from 'react';

export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    const details = payload?.error?.details;
    const detailText = Array.isArray(details)
      ? details.map((detail) => detail.message).filter(Boolean).join(' ')
      : '';
    const error = new Error(detailText || payload?.error?.message || 'Something went wrong.');
    error.status = response.status;
    error.details = details;
    throw error;
  }
  return payload;
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useList(endpoint, { q = '', page = 1, pageSize = 20, filters = {}, sort = '', order = '' } = {}) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const query = buildQuery({ q, page, pageSize, sort, order, ...filters });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiRequest(`${endpoint}${query}`)
      .then((payload) => {
        if (!active) return;
        setData(payload.data || []);
        setMeta(payload.meta || null);
      })
      .catch((err) => {
        if (active) {
          setData([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [endpoint, query, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return { data, meta, loading, error, refresh };
}

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest('/api/settings')
      .then((payload) => {
        if (active) setSettings(payload.data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, setSettings, loading, error };
}

export function formatDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function formatDateTime(value) {
  return formatDate(value, true);
}

export function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
