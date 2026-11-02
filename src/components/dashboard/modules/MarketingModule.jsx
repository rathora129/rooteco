'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CheckRow,
  EmptyState,
  ErrorBlock,
  Field,
  FormGrid,
  Full,
  ImageField,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Select,
  Table,
  TableScroll,
  Textarea,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, formatDate, formatDateTime, formatMoney, useList } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

const EVENT_LABELS = {
  product_view: 'Product views',
  add_to_cart: 'Add to cart',
  checkout_started: 'Checkouts started',
  purchase: 'Purchases',
  quote_request: 'Quote requests',
  whatsapp_click: 'WhatsApp clicks',
  contact_submit: 'Contact submissions',
};

const emptyCoupon = {
  code: '',
  type: 'percent',
  value: '',
  minSubtotal: '',
  active: true,
  expiresAt: '',
};

function dateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export default function MarketingModule() {
  const { notify } = useToast();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [seo, setSeo] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [savingSeo, setSavingSeo] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    data: coupons,
    loading: couponsLoading,
    error: couponsError,
    refresh: refreshCoupons,
  } = useList('/api/marketing/coupons', { pageSize: 50 });

  const [couponOpen, setCouponOpen] = useState(false);
  const [couponEditing, setCouponEditing] = useState(null);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    let active = true;
    setStatsLoading(true);
    setStatsError('');
    apiRequest('/api/marketing')
      .then((payload) => {
        if (!active) return;
        setStats(payload.data);
        setSeo(payload.data.seo);
        setTracking(payload.data.marketing);
      })
      .catch((err) => {
        if (active) setStatsError(err.message);
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  async function saveSeo() {
    setSavingSeo(true);
    setFormError('');
    try {
      const response = await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ seo }),
      });
      setSeo(response.data.seo);
      notify('SEO defaults saved.');
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSavingSeo(false);
    }
  }

  async function saveTracking() {
    setSavingTracking(true);
    setFormError('');
    try {
      const response = await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ marketing: tracking }),
      });
      setTracking(response.data.marketing);
      notify('Tracking settings saved.');
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSavingTracking(false);
    }
  }

  function openCreateCoupon() {
    setCouponEditing(null);
    setCouponForm(emptyCoupon);
    setCouponError('');
    setCouponOpen(true);
  }

  function openEditCoupon(coupon) {
    setCouponEditing(coupon);
    setCouponForm({
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: Number(coupon.value || 0),
      minSubtotal: coupon.minSubtotal === null || coupon.minSubtotal === undefined ? '' : Number(coupon.minSubtotal),
      active: Boolean(coupon.active),
      expiresAt: dateInput(coupon.expiresAt),
    });
    setCouponError('');
    setCouponOpen(true);
  }

  async function saveCoupon() {
    setCouponSaving(true);
    setCouponError('');
    try {
      const payload = {
        code: couponForm.code,
        type: couponForm.type,
        value: couponForm.value,
        minSubtotal: couponForm.minSubtotal === '' ? null : Number(couponForm.minSubtotal),
        active: couponForm.active,
        expiresAt: couponForm.expiresAt || null,
      };
      if (couponEditing) {
        await apiRequest(`/api/marketing/coupons/${couponEditing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        notify('Coupon updated.');
      } else {
        await apiRequest('/api/marketing/coupons', { method: 'POST', body: JSON.stringify(payload) });
        notify('Coupon created.');
      }
      setCouponOpen(false);
      refreshCoupons();
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponSaving(false);
    }
  }

  async function deleteCoupon(coupon) {
    if (!window.confirm(`Delete coupon ${coupon.code}? This cannot be undone.`)) return;
    try {
      await apiRequest(`/api/marketing/coupons/${coupon.id}`, { method: 'DELETE' });
      notify('Coupon deleted.');
      refreshCoupons();
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  const daily = stats?.events?.daily || [];
  const maxDaily = Math.max(1, ...daily.map((point) => point.count));
  const byType = [...(stats?.events?.byType || [])].sort((a, b) => b.count - a.count);

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Growth</span>
          <h1>Marketing &amp; SEO</h1>
          <p>
            Track storefront events, set search defaults for every page, manage coupons and keep
            analytics IDs in one place. Secret provider keys stay in environment variables.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button as="a" href="/sitemap.xml" target="_blank" rel="noreferrer" $variant="outline">
            Sitemap
          </Button>
          <Button as="a" href="/robots.txt" target="_blank" rel="noreferrer" $variant="outline">
            Robots
          </Button>
        </div>
      </PageHeader>

      {statsError && <ErrorBlock message={statsError} onRetry={() => setRefreshKey((key) => key + 1)} />}
      {statsLoading && <Card><LoadingBlock label="Loading analytics…" /></Card>}

      {stats && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              marginBottom: 18,
            }}
          >
            {[
              { label: 'Events (30 days)', value: stats.events?.total30d ?? 0 },
              { label: 'Coupons', value: stats.counts?.coupons ?? 0 },
              { label: 'Active banners', value: stats.counts?.activeBanners ?? 0 },
              { label: 'Published blogs', value: stats.counts?.publishedBlogs ?? 0 },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: '#fff',
                  border: `1px solid ${theme.colors.line}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.colors.muted }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: theme.colors.forest, marginTop: 4 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18, marginBottom: 18 }}>
            <Card>
              <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Last 14 days</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130 }}>
                {daily.map((point) => (
                  <div key={point.date} style={{ flex: 1, textAlign: 'center' }} title={`${point.date}: ${point.count}`}>
                    <div
                      style={{
                        height: `${Math.max(4, (point.count / maxDaily) * 100)}px`,
                        background: point.count ? theme.colors.green : theme.colors.creamDark,
                        borderRadius: 4,
                        transition: 'height 0.2s ease',
                      }}
                    />
                    <div style={{ fontSize: 9, color: theme.colors.muted, marginTop: 4 }}>
                      {new Date(point.date).getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: theme.colors.muted }}>
                Storefront events recorded from the public website.
              </div>
            </Card>

            <Card>
              <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Event breakdown</h2>
              {byType.length === 0 ? (
                <EmptyState title="No events yet" text="Events appear as visitors browse the storefront." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {byType.map((row) => (
                    <div key={row.type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <span>{EVENT_LABELS[row.type] || row.type}</span>
                      <strong>{row.count}</strong>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Recent events</h2>
            {(stats.recent || []).length === 0 ? (
              <EmptyState title="No tracked events" text="Browse the storefront to generate product and checkout events." />
            ) : (
              <TableScroll>
                <Table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Path</th>
                      <th>Product</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map((event) => (
                      <tr key={event.id}>
                        <td><Badge $tone="cream">{EVENT_LABELS[event.type] || event.type}</Badge></td>
                        <td className="muted">{event.path || '—'}</td>
                        <td className="muted">{event.productId || '—'}</td>
                        <td className="muted">{formatDateTime(event.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableScroll>
            )}
          </Card>
        </>
      )}

      {formError && <ErrorBlock message={formError} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card>
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>SEO defaults</h2>
          {!seo ? (
            <LoadingBlock label="Loading SEO settings…" />
          ) : (
            <>
              <FormGrid $cols={1}>
                <Field label="Default title">
                  <Input value={seo.defaultTitle} onChange={(event) => setSeo((prev) => ({ ...prev, defaultTitle: event.target.value }))} />
                </Field>
                <Field label="Title template">
                  <Input value={seo.titleTemplate} onChange={(event) => setSeo((prev) => ({ ...prev, titleTemplate: event.target.value }))} />
                </Field>
                <Field label="Default description">
                  <Textarea value={seo.defaultDescription} onChange={(event) => setSeo((prev) => ({ ...prev, defaultDescription: event.target.value }))} />
                </Field>
                <Field label="Keywords">
                  <Input value={seo.keywords} onChange={(event) => setSeo((prev) => ({ ...prev, keywords: event.target.value }))} />
                </Field>
                <Field label="Canonical base URL">
                  <Input value={seo.canonicalBase} onChange={(event) => setSeo((prev) => ({ ...prev, canonicalBase: event.target.value }))} placeholder="https://rooteco.vercel.app" />
                </Field>
                <Field label="Robots directive">
                  <Input value={seo.robots} onChange={(event) => setSeo((prev) => ({ ...prev, robots: event.target.value }))} />
                </Field>
                <CheckRow>
                  <input
                    type="checkbox"
                    checked={Boolean(seo.sitemapEnabled)}
                    onChange={(event) => setSeo((prev) => ({ ...prev, sitemapEnabled: event.target.checked }))}
                  />
                  Include published products, categories, collections and blogs in the sitemap
                </CheckRow>
                <ImageField
                  label="Default social share image"
                  value={seo.ogImage}
                  onChange={(value) => setSeo((prev) => ({ ...prev, ogImage: value }))}
                />
              </FormGrid>
              <Button type="button" onClick={saveSeo} disabled={savingSeo} style={{ marginTop: 12 }}>
                {savingSeo ? 'Saving…' : 'Save SEO defaults'}
              </Button>
            </>
          )}
        </Card>

        <Card>
          <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Tracking IDs</h2>
          {!tracking ? (
            <LoadingBlock label="Loading tracking settings…" />
          ) : (
            <>
              <FormGrid $cols={1}>
                <Field label="Google Analytics 4 ID" hint="G-XXXXXXXXXX">
                  <Input value={tracking.ga4Id} onChange={(event) => setTracking((prev) => ({ ...prev, ga4Id: event.target.value }))} />
                </Field>
                <Field label="Meta Pixel ID">
                  <Input value={tracking.metaPixelId} onChange={(event) => setTracking((prev) => ({ ...prev, metaPixelId: event.target.value }))} />
                </Field>
                <Field label="Google site verification">
                  <Input value={tracking.googleSiteVerification} onChange={(event) => setTracking((prev) => ({ ...prev, googleSiteVerification: event.target.value }))} />
                </Field>
              </FormGrid>
              <div style={{ marginTop: 10, fontSize: 11.5, color: theme.colors.muted, lineHeight: 1.7 }}>
                These identifiers are public by design and are only injected when set. Provider API
                secrets belong in Vercel environment variables, never in settings or client code.
              </div>
              <Button type="button" onClick={saveTracking} disabled={savingTracking} style={{ marginTop: 12 }}>
                {savingTracking ? 'Saving…' : 'Save tracking'}
              </Button>
            </>
          )}
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 16, color: theme.colors.forest }}>Coupons</h2>
            <p style={{ fontSize: 12, color: theme.colors.muted, marginTop: 2 }}>Codes applied at checkout and validated on the server.</p>
          </div>
          <Button type="button" onClick={openCreateCoupon}>Add coupon</Button>
        </div>

        {couponsError && <ErrorBlock message={couponsError} onRetry={refreshCoupons} />}
        {couponsLoading ? (
          <LoadingBlock label="Loading coupons…" />
        ) : coupons.length === 0 ? (
          <EmptyState title="No coupons yet" text="Create a percent or fixed-value code for promotions." />
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Minimum</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="strong">{coupon.code}</td>
                    <td>
                      {coupon.type === 'percent' ? `${Number(coupon.value)}%` : formatMoney(coupon.value)}
                    </td>
                    <td className="muted">{coupon.minSubtotal ? formatMoney(coupon.minSubtotal) : '—'}</td>
                    <td className="muted">{coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}</td>
                    <td>
                      <Badge $tone={coupon.active ? 'green' : 'neutral'}>
                        {coupon.active ? 'active' : 'inactive'}
                      </Badge>
                    </td>
                    <td className="muted">{formatDate(coupon.createdAt)}</td>
                    <td>
                      <div className="actions">
                        <Button type="button" $variant="outline" onClick={() => openEditCoupon(coupon)} style={{ padding: '6px 12px' }}>
                          Edit
                        </Button>
                        <Button type="button" $variant="ghost" onClick={() => deleteCoupon(coupon)} style={{ padding: '6px 10px' }}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </Card>

      <Modal
        open={couponOpen}
        onClose={() => setCouponOpen(false)}
        title={couponEditing ? `Edit coupon ${couponEditing.code}` : 'Add coupon'}
        footer={
          <>
            <Button type="button" $variant="outline" onClick={() => setCouponOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveCoupon} disabled={couponSaving}>
              {couponSaving ? 'Saving…' : couponEditing ? 'Save coupon' : 'Create coupon'}
            </Button>
          </>
        }
      >
        {couponError && <ErrorBlock message={couponError} />}
        <FormGrid $cols={2}>
          <Field label="Code" required>
            <Input
              value={couponForm.code}
              onChange={(event) => setCouponForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
              placeholder="WELCOME10"
            />
          </Field>
          <Field label="Type">
            <Select value={couponForm.type} onChange={(event) => setCouponForm((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </Select>
          </Field>
          <Field label={couponForm.type === 'percent' ? 'Percent off' : 'Amount off (₹)'} required>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={couponForm.value}
              onChange={(event) => setCouponForm((prev) => ({ ...prev, value: event.target.value }))}
            />
          </Field>
          <Field label="Minimum subtotal (₹)">
            <Input
              type="number"
              min="0"
              value={couponForm.minSubtotal}
              onChange={(event) => setCouponForm((prev) => ({ ...prev, minSubtotal: event.target.value }))}
            />
          </Field>
          <Field label="Expires on">
            <Input
              type="date"
              value={couponForm.expiresAt}
              onChange={(event) => setCouponForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
            />
          </Field>
          <Full>
            <CheckRow>
              <input
                type="checkbox"
                checked={Boolean(couponForm.active)}
                onChange={(event) => setCouponForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Active and redeemable at checkout
            </CheckRow>
          </Full>
        </FormGrid>
      </Modal>
    </>
  );
}
