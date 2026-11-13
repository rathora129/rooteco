'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CircleCheck,
  CreditCard,
  Globe2,
  Mail,
  Megaphone,
  MessageCircle,
  Search,
  Share2,
  Store,
} from 'lucide-react';
import {
  Button,
  Card,
  CheckRow,
  ErrorBlock,
  Field,
  FormGrid,
  ImageField,
  Input,
  SkeletonRows,
  Textarea,
  useToast,
} from '@/components/dashboard/ui';
import { apiRequest, useSettings } from '@/components/dashboard/hooks';

const TABS = [
  { id: 'general', label: 'Brand & identity', icon: Store, group: 'website' },
  { id: 'contact', label: 'Contact details', icon: Mail, group: 'website' },
  { id: 'social', label: 'Social profiles', icon: Share2, group: 'website' },
  { id: 'footer', label: 'Footer', icon: Globe2, group: 'website' },
  { id: 'seo', label: 'Search defaults', icon: Search, group: 'website' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, group: 'website' },
  { id: 'marketing', label: 'Analytics & tracking', icon: Megaphone, group: 'system' },
  { id: 'payments', label: 'Payments', icon: CreditCard, group: 'system' },
];

const Layout = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const TabList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px;
  border: 1px solid var(--dash-line);
  border-radius: 12px;
  background: var(--dash-panel);
  position: sticky;
  top: 88px;
  @media (max-width: 860px) {
    position: static;
    flex-direction: row;
    overflow-x: auto;
  }
  button {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    text-align: left;
    padding: 9px 11px;
    border-radius: 8px;
    border: 0;
    background: transparent;
    color: var(--dash-muted);
    font-size: 12.5px;
    font-weight: 550;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.14s ease, color 0.14s ease;
  }
  button:hover {
    background: var(--dash-panel-2);
    color: var(--dash-ink);
  }
  button[data-active='true'] {
    background: var(--dash-accent-soft);
    color: var(--dash-accent);
  }
  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }
  .divider {
    height: 1px;
    background: var(--dash-line);
    margin: 6px 8px;
  }
  @media (max-width: 860px) {
    .divider {
      display: none;
    }
  }
`;

const GroupTitle = styled.h3`
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--dash-faint);
  font-weight: 650;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--dash-line);
`;

const SaveBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--dash-line);
  .saved {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--dash-green);
  }
`;

export default function SettingsModule({
  initialGroup = 'general',
  only = null,
  title = 'Settings',
  eyebrow = 'Configuration',
  description = 'Storefront identity, contact details, SEO defaults, payment instructions and WhatsApp configuration. Changes apply publicly as soon as you save.',
}) {
  const { notify } = useToast();
  const { settings, loading, error } = useSettings();
  const [tab, setTab] = useState(initialGroup);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  const tabs = useMemo(() => TABS.filter((item) => !only || only.includes(item.id)), [only]);
  const activeTab = tabs.find((item) => item.id === tab) || tabs[0];

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  useEffect(() => {
    if (tabs.length && !tabs.some((item) => item.id === tab)) setTab(tabs[0].id);
  }, [tabs, tab]);

  async function save() {
    if (!draft || !activeTab) return;
    setSaving(true);
    setFormError('');
    try {
      const response = await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ [activeTab.id]: draft[activeTab.id] }),
      });
      setDraft((prev) => (prev ? { ...prev, [activeTab.id]: response.data[activeTab.id] } : response.data));
      setSavedAt(new Date());
      notify(`${activeTab.label} saved.`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const update = (group, key, value) =>
    setDraft((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));

  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dash-accent)', marginBottom: 6 }}>
          {eyebrow}
        </span>
        <h1 style={{ fontSize: 'clamp(26px, 3vw, 32px)', letterSpacing: '-0.02em', marginBottom: 5 }}>{title}</h1>
        <p style={{ fontSize: 13, color: 'var(--dash-muted)', maxWidth: 640 }}>{description}</p>
      </div>

      {error && !draft ? (
        <Card>
          <ErrorBlock message={error} />
        </Card>
      ) : loading || !draft ? (
        <Card>
          <SkeletonRows rows={6} />
        </Card>
      ) : (
        <Layout>
          <TabList>
            {tabs.map((item, index) => {
              const Icon = item.icon;
              const previous = tabs[index - 1];
              const divider = previous && previous.group !== item.group;
              return (
                <span key={item.id}>
                  {divider && <span className="divider" />}
                  <button type="button" data-active={tab === item.id} onClick={() => { setTab(item.id); setFormError(''); setSavedAt(null); }}>
                    <Icon /> {item.label}
                  </button>
                </span>
              );
            })}
          </TabList>

          <Card>
            {formError && <ErrorBlock message={formError} />}

            {tab === 'general' && (
              <>
                <GroupTitle>Brand &amp; announcement</GroupTitle>
                <FormGrid $cols={2}>
                  <Field label="Site name" required>
                    <Input value={draft.general.siteName} onChange={(event) => update('general', 'siteName', event.target.value)} />
                  </Field>
                  <Field label="Tagline">
                    <Input value={draft.general.tagline} onChange={(event) => update('general', 'tagline', event.target.value)} />
                  </Field>
                  <Field label="Announcement bar text" full>
                    <Input value={draft.general.announcement} onChange={(event) => update('general', 'announcement', event.target.value)} />
                  </Field>
                  <Field full>
                    <CheckRow>
                      <input
                        type="checkbox"
                        checked={Boolean(draft.general.announcementActive)}
                        onChange={(event) => update('general', 'announcementActive', event.target.checked)}
                      />
                      Show the announcement bar above the header
                    </CheckRow>
                  </Field>
                  <ImageField
                    label="Logo"
                    value={draft.general.logoUrl}
                    onChange={(value) => update('general', 'logoUrl', value)}
                    hint="Used in header, footer and emails"
                  />
                  <ImageField
                    label="Favicon"
                    value={draft.general.faviconUrl}
                    onChange={(value) => update('general', 'faviconUrl', value)}
                    hint="Square, ideally 512×512"
                  />
                </FormGrid>
              </>
            )}

            {tab === 'contact' && (
              <>
                <GroupTitle>Public contact details</GroupTitle>
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
                  <Field label="Address" full>
                    <Textarea value={draft.contact.address} onChange={(event) => update('contact', 'address', event.target.value)} />
                  </Field>
                </FormGrid>
              </>
            )}

            {tab === 'social' && (
              <>
                <GroupTitle>Social profiles</GroupTitle>
                <FormGrid $cols={2}>
                  {[
                    ['instagram', 'Instagram'],
                    ['linkedin', 'LinkedIn'],
                    ['facebook', 'Facebook'],
                    ['twitter', 'X / Twitter'],
                    ['youtube', 'YouTube'],
                  ].map(([key, label]) => (
                    <Field key={key} label={label}>
                      <Input value={draft.social[key]} onChange={(event) => update('social', key, event.target.value)} placeholder="https://" />
                    </Field>
                  ))}
                </FormGrid>
              </>
            )}

            {tab === 'footer' && (
              <>
                <GroupTitle>Footer</GroupTitle>
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
                <GroupTitle>Search defaults</GroupTitle>
                <FormGrid $cols={2}>
                  <Field label="Default title" full>
                    <Input value={draft.seo.defaultTitle} onChange={(event) => update('seo', 'defaultTitle', event.target.value)} />
                  </Field>
                  <Field label="Title template">
                    <Input value={draft.seo.titleTemplate} onChange={(event) => update('seo', 'titleTemplate', event.target.value)} />
                  </Field>
                  <Field label="Canonical base URL">
                    <Input value={draft.seo.canonicalBase} onChange={(event) => update('seo', 'canonicalBase', event.target.value)} />
                  </Field>
                  <Field label="Default description" full>
                    <Textarea value={draft.seo.defaultDescription} onChange={(event) => update('seo', 'defaultDescription', event.target.value)} />
                  </Field>
                  <Field label="Keywords" full>
                    <Input value={draft.seo.keywords} onChange={(event) => update('seo', 'keywords', event.target.value)} />
                  </Field>
                  <Field label="Robots directive">
                    <Input value={draft.seo.robots} onChange={(event) => update('seo', 'robots', event.target.value)} />
                  </Field>
                  <ImageField
                    label="Default social image"
                    value={draft.seo.ogImage}
                    onChange={(value) => update('seo', 'ogImage', value)}
                  />
                  <Field full>
                    <CheckRow>
                      <input
                        type="checkbox"
                        checked={Boolean(draft.seo.sitemapEnabled)}
                        onChange={(event) => update('seo', 'sitemapEnabled', event.target.checked)}
                      />
                      Generate the public sitemap
                    </CheckRow>
                  </Field>
                </FormGrid>
              </>
            )}

            {tab === 'marketing' && (
              <>
                <GroupTitle>Analytics &amp; tracking</GroupTitle>
                <FormGrid $cols={2}>
                  <Field label="Google Analytics 4 ID" hint="G-XXXXXXXXXX">
                    <Input value={draft.marketing.ga4Id} onChange={(event) => update('marketing', 'ga4Id', event.target.value)} />
                  </Field>
                  <Field label="Meta Pixel ID">
                    <Input value={draft.marketing.metaPixelId} onChange={(event) => update('marketing', 'metaPixelId', event.target.value)} />
                  </Field>
                  <Field label="Google site verification" full>
                    <Input
                      value={draft.marketing.googleSiteVerification}
                      onChange={(event) => update('marketing', 'googleSiteVerification', event.target.value)}
                    />
                  </Field>
                </FormGrid>
                <p style={{ marginTop: 12, fontSize: 11.5, color: 'var(--dash-muted)', lineHeight: 1.7 }}>
                  Tracking scripts load only when an ID is present. Provider API secrets belong in
                  environment variables, never in settings.
                </p>
              </>
            )}

            {tab === 'payments' && (
              <>
                <GroupTitle>Payment methods</GroupTitle>
                <FormGrid $cols={1}>
                  <Field>
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
                  </Field>
                  <Field>
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
                  </Field>
                  <Field label="Payment instructions" hint="Shown on order confirmation and invoice">
                    <Textarea
                      value={draft.payments.instructions}
                      onChange={(event) => update('payments', 'instructions', event.target.value)}
                    />
                  </Field>
                </FormGrid>
                <div
                  style={{
                    marginTop: 14,
                    background: 'var(--dash-panel-2)',
                    border: '1px solid var(--dash-line)',
                    borderRadius: 9,
                    padding: 12,
                    fontSize: 11.5,
                    color: 'var(--dash-muted)',
                    lineHeight: 1.7,
                  }}
                >
                  Online payments stay disabled until a payment provider is configured with secret keys
                  and a webhook. Orders are never marked paid without verified provider confirmation.
                  {draft.payments.onlineEnabled ? ' Online payment is currently enabled.' : ''}
                </div>
              </>
            )}

            {tab === 'whatsapp' && (
              <>
                <GroupTitle>WhatsApp button</GroupTitle>
                <FormGrid $cols={2}>
                  <Field label="WhatsApp number" hint="Digits with country code">
                    <Input value={draft.whatsapp.number} onChange={(event) => update('whatsapp', 'number', event.target.value)} />
                  </Field>
                  <Field label="Default message" full>
                    <Textarea value={draft.whatsapp.message} onChange={(event) => update('whatsapp', 'message', event.target.value)} />
                  </Field>
                  <Field full>
                    <CheckRow>
                      <input
                        type="checkbox"
                        checked={Boolean(draft.whatsapp.enabled)}
                        onChange={(event) => update('whatsapp', 'enabled', event.target.checked)}
                      />
                      Show the floating WhatsApp button on the storefront
                    </CheckRow>
                  </Field>
                </FormGrid>
                <p style={{ marginTop: 12, fontSize: 11.5, color: 'var(--dash-muted)', lineHeight: 1.7 }}>
                  This number powers click-to-chat and WhatsApp lead tracking. Two-way messaging
                  requires the WhatsApp Business Platform environment variables.
                </p>
              </>
            )}

            <SaveBar>
              {savedAt && !formError && (
                <span className="saved">
                  <CircleCheck size={14} /> Saved at{' '}
                  {savedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <Button type="button" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : `Save ${activeTab?.label || 'changes'}`}
              </Button>
            </SaveBar>
          </Card>
        </Layout>
      )}
    </>
  );
}
