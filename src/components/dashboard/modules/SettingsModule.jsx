'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CheckRow,
  ErrorBlock,
  Field,
  FormGrid,
  Full,
  ImageField,
  Input,
  LoadingBlock,
  PageHeader,
  Textarea,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, useSettings } from '@/components/dashboard/hooks';
import theme from '@/styles/theme';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'contact', label: 'Contact' },
  { id: 'social', label: 'Social' },
  { id: 'footer', label: 'Footer' },
  { id: 'seo', label: 'SEO' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'payments', label: 'Payments' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

function setNested(draft, group, key, value) {
  return { ...draft, [group]: { ...draft[group], [key]: value } };
}

export default function SettingsModule() {
  const { notify } = useToast();
  const { settings, loading, error } = useSettings();
  const [tab, setTab] = useState('general');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    setFormError('');
    try {
      const response = await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ [tab]: draft[tab] }),
      });
      setDraft(response.data);
      setSavedAt(new Date());
      notify(`${TABS.find((item) => item.id === tab)?.label || 'Settings'} saved.`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !draft) {
    return (
      <>
        <PageHeader>
          <div>
            <span className="eyebrow">Configuration</span>
            <h1>Settings</h1>
          </div>
        </PageHeader>
        <Card>
          {error ? <ErrorBlock message={error} /> : <LoadingBlock label="Loading settings…" />}
        </Card>
      </>
    );
  }

  const update = (group, key, value) => setDraft((prev) => setNested(prev, group, key, value));

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">Configuration</span>
          <h1>Settings</h1>
          <p>
            Storefront identity, contact details, SEO defaults, payment instructions and WhatsApp
            configuration. Changes apply publicly as soon as you save.
          </p>
        </div>
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </PageHeader>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {TABS.map((item) => (
          <Button
            key={item.id}
            type="button"
            $variant={tab === item.id ? 'primary' : 'outline'}
            onClick={() => {
              setTab(item.id);
              setFormError('');
            }}
            style={{ padding: '7px 14px', fontSize: 12.5 }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {formError && <ErrorBlock message={formError} />}
      {savedAt && !formError && (
        <div style={{ fontSize: 12, color: theme.colors.green, marginBottom: 12 }}>
          Saved at {savedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      <Card>
        {tab === 'general' && (
          <>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Brand &amp; announcement</h2>
            <FormGrid $cols={2}>
              <Field label="Site name" required>
                <Input value={draft.general.siteName} onChange={(event) => update('general', 'siteName', event.target.value)} />
              </Field>
              <Field label="Tagline">
                <Input value={draft.general.tagline} onChange={(event) => update('general', 'tagline', event.target.value)} />
              </Field>
              <Full>
                <Field label="Announcement bar text">
                  <Input value={draft.general.announcement} onChange={(event) => update('general', 'announcement', event.target.value)} />
                </Field>
              </Full>
              <Full>
                <CheckRow>
                  <input
                    type="checkbox"
                    checked={Boolean(draft.general.announcementActive)}
                    onChange={(event) => update('general', 'announcementActive', event.target.checked)}
                  />
                  Show the announcement bar above the header
                </CheckRow>
              </Full>
              <ImageField
                label="Logo"
                value={draft.general.logoUrl}
                onChange={(value) => update('general', 'logoUrl', value)}
                hint="Used in the header, footer and emails"
              />
              <ImageField
                label="Favicon"
                value={draft.general.faviconUrl}
                onChange={(value) => update('general', 'faviconUrl', value)}
                hint="Square image, ideally 512×512"
              />
            </FormGrid>
          </>
        )}

        {tab === 'contact' && (
          <>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Public contact details</h2>
            <FormGrid $cols={2}>
              <Field label="Email" required>
                <Input type="email" value={draft.contact.email} onChange={(event) => update('contact', 'email', event.target.value)} />
              </Field>
              <Field label="Phone">
                <Input value={draft.contact.phone} onChange={(event) => update('contact', 'phone', event.target.value)} />
              </Field>
              <Field label="WhatsApp display number">
                <Input value={draft.contact.whatsapp} onChange={(event) => update('contact', 'whatsapp', event.target.value)} />
              </Field>
              <Field label="Working hours">
                <Input value={draft.contact.hours} onChange={(event) => update('contact', 'hours', event.target.value)} />
              </Field>
              <Full>
                <Field label="Address">
                  <Textarea value={draft.contact.address} onChange={(event) => update('contact', 'address', event.target.value)} />
                </Field>
              </Full>
            </FormGrid>
          </>
        )}

        {tab === 'social' && (
          <>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Social profiles</h2>
            <FormGrid $cols={2}>
              {[
                ['instagram', 'Instagram'],
                ['linkedin', 'LinkedIn'],
                ['facebook', 'Facebook'],
                ['twitter', 'X / Twitter'],
                ['youtube', 'YouTube'],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <Input
                    value={draft.social[key]}
                    onChange={(event) => update('social', key, event.target.value)}
                    placeholder="https://"
                  />
                </Field>
              ))}
            </FormGrid>
          </>
        )}

        {tab === 'footer' && (
          <>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Footer</h2>
            <FormGrid $cols={1}>
              <Field label="Footer description">
                <Textarea value={draft.footer.description} onChange={(event) => update('footer', 'description', event.target.value)} />
              </Field>
              <Field label="Copyright line" hint="Leave blank for the default">
                <Input value={draft.footer.copyright} onChange={(event) => update('footer', 'copyright', event.target.value)} />
              </Field>
            </FormGrid>
          </>
        )}

        {tab === 'seo' && (
          <>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Search defaults</h2>
            <FormGrid $cols={2}>
              <Full>
                <Field label="Default title">
                  <Input value={draft.seo.defaultTitle} onChange={(event) => update('seo', 'defaultTitle', event.target.value)} />
                </Field>
              </Full>
              <Field label="Title template">
                <Input value={draft.seo.titleTemplate} onChange={(event) => update('seo', 'titleTemplate', event.target.value)} />
              </Field>
              <Field label="Canonical base URL">
                <Input value={draft.seo.canonicalBase} onChange={(event) => update('seo', 'canonicalBase', event.target.value)} />
              </Field>
              <Full>
                <Field label="Default description">
                  <Textarea value={draft.seo.defaultDescription} onChange={(event) => update('seo', 'defaultDescription', event.target.value)} />
                </Field>
              </Full>
              <Full>
                <Field label="Keywords">
                  <Input value={draft.seo.keywords} onChange={(event) => update('seo', 'keywords', event.target.value)} />
                </Field>
              </Full>
              <Field label="Robots directive">
                <Input value={draft.seo.robots} onChange={(event) => update('seo', 'robots', event.target.value)} />
              </Field>
              <ImageField
                label="Default social image"
                value={draft.seo.ogImage}
                onChange={(value) => update('seo', 'ogImage', value)}
              />
              <Full>
                <CheckRow>
                  <input
                    type="checkbox"
                    checked={Boolean(draft.seo.sitemapEnabled)}
                    onChange={(event) => update('seo', 'sitemapEnabled', event.target.checked)}
                  />
                  Generate the public sitemap
                </CheckRow>
              </Full>
            </FormGrid>
          </>
        )}

        {tab === 'marketing' && (
          <>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Analytics</h2>
            <FormGrid $cols={2}>
              <Field label="Google Analytics 4 ID" hint="G-XXXXXXXXXX">
                <Input value={draft.marketing.ga4Id} onChange={(event) => update('marketing', 'ga4Id', event.target.value)} />
              </Field>
              <Field label="Meta Pixel ID">
                <Input value={draft.marketing.metaPixelId} onChange={(event) => update('marketing', 'metaPixelId', event.target.value)} />
              </Field>
              <Full>
                <Field label="Google site verification">
                  <Input value={draft.marketing.googleSiteVerification} onChange={(event) => update('marketing', 'googleSiteVerification', event.target.value)} />
                </Field>
              </Full>
            </FormGrid>
            <p style={{ marginTop: 10, fontSize: 11.5, color: theme.colors.muted }}>
              Tracking scripts are loaded only when an ID is present. Event data is stored through the
              first-party `/api/events` endpoint.
            </p>
          </>
        )}

        {tab === 'payments' && (
          <>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>Payment methods</h2>
            <FormGrid $cols={1}>
              <CheckRow>
                <input
                  type="checkbox"
                  checked={(draft.payments.methods || []).includes('bank-transfer')}
                  onChange={(event) =>
                    update(
                      'payments',
                      'methods',
                      event.target.checked
                        ? [...new Set([...(draft.payments.methods || []), 'bank-transfer'])]
                        : (draft.payments.methods || []).filter((method) => method !== 'bank-transfer')
                    )
                  }
                />
                Bank transfer / proforma invoice
              </CheckRow>
              <CheckRow>
                <input
                  type="checkbox"
                  checked={(draft.payments.methods || []).includes('cod')}
                  onChange={(event) =>
                    update(
                      'payments',
                      'methods',
                      event.target.checked
                        ? [...new Set([...(draft.payments.methods || []), 'cod'])]
                        : (draft.payments.methods || []).filter((method) => method !== 'cod')
                    )
                  }
                />
                Cash on delivery
              </CheckRow>
              <Field label="Payment instructions" hint="Shown on the order confirmation and invoice">
                <Textarea
                  value={draft.payments.instructions}
                  onChange={(event) => update('payments', 'instructions', event.target.value)}
                />
              </Field>
            </FormGrid>
            <div
              style={{
                marginTop: 14,
                background: theme.colors.cream,
                border: `1px solid ${theme.colors.line}`,
                borderRadius: 10,
                padding: 12,
                fontSize: 12,
                color: theme.colors.muted,
                lineHeight: 1.7,
              }}
            >
              Online payments stay disabled until a payment provider is configured with its secret keys
              and webhook. Orders are never marked paid without a verified provider confirmation.
              {draft.payments.onlineEnabled ? ' Online payment is currently enabled in settings.' : ''}
            </div>
          </>
        )}

        {tab === 'whatsapp' && (
          <>
            <h2 style={{ fontSize: 16, color: theme.colors.forest, marginBottom: 12 }}>WhatsApp button</h2>
            <FormGrid $cols={2}>
              <Field label="WhatsApp number" hint="Digits with country code">
                <Input value={draft.whatsapp.number} onChange={(event) => update('whatsapp', 'number', event.target.value)} />
              </Field>
              <Full>
                <Field label="Default message">
                  <Textarea value={draft.whatsapp.message} onChange={(event) => update('whatsapp', 'message', event.target.value)} />
                </Field>
              </Full>
              <Full>
                <CheckRow>
                  <input
                    type="checkbox"
                    checked={Boolean(draft.whatsapp.enabled)}
                    onChange={(event) => update('whatsapp', 'enabled', event.target.checked)}
                  />
                  Show the floating WhatsApp button on the storefront
                </CheckRow>
              </Full>
            </FormGrid>
            <p style={{ marginTop: 10, fontSize: 11.5, color: theme.colors.muted, lineHeight: 1.7 }}>
              This number powers click-to-chat and WhatsApp lead tracking. Two-way messaging requires
              the WhatsApp Business Platform environment variables listed in the deployment docs.
            </p>
          </>
        )}

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${theme.colors.line}`, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : `Save ${TABS.find((item) => item.id === tab)?.label || ''}`}
          </Button>
        </div>
      </Card>
    </>
  );
}
