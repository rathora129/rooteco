'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  BarChart3,
  Check,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  Link2,
  Search,
  ShieldCheck,
  X,
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
import { apiRequest } from '@/components/dashboard/hooks';

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  margin-bottom: 14px;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h2`
  font-size: 13.5px;
  font-weight: 650;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--dash-line);
  display: flex;
  align-items: center;
  gap: 7px;
  svg {
    width: 14px;
    height: 14px;
    color: var(--dash-accent);
  }
`;

const CheckRowItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 8px 0;
  border-bottom: 1px solid var(--dash-line-soft);
  font-size: 12.5px;
  &:last-child {
    border-bottom: 0;
  }
  .icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    margin-top: 1px;
    background: ${(p) => (p.$ok ? 'var(--dash-green-soft)' : 'var(--dash-red-soft)')};
    color: ${(p) => (p.$ok ? 'var(--dash-green)' : 'var(--dash-red)')};
  }
  .icon svg {
    width: 11px;
    height: 11px;
  }
  .text {
    flex: 1;
  }
  .hint {
    font-size: 11px;
    color: var(--dash-muted);
    margin-top: 2px;
  }
  a {
    font-size: 11px;
    color: var(--dash-accent);
    white-space: nowrap;
  }
`;

const ScoreBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  .track {
    flex: 1;
    height: 6px;
    border-radius: 999px;
    background: var(--dash-panel-3);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: 999px;
    background: var(--dash-accent);
    opacity: 0.85;
  }
  .value {
    font-size: 12px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }
`;

export default function SeoModule() {
  const { notify } = useToast();
  const [seo, setSeo] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingSeo, setSavingSeo] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiRequest('/api/marketing');
      setSeo(payload.data.seo);
      setTracking(payload.data.marketing);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSeo() {
    setSavingSeo(true);
    setFormError('');
    try {
      const response = await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ seo }),
      });
      setSeo(response.data.seo);
      notify('Search defaults saved.');
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
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSavingTracking(false);
    }
  }

  const checks = seo
    ? [
        {
          ok: Boolean(seo.defaultTitle) && seo.defaultTitle.length <= 60,
          label: 'Default title length',
          hint: seo.defaultTitle
            ? `${seo.defaultTitle.length} characters — aim for 50–60`
            : 'Add a default page title',
          href: '/',
        },
        {
          ok: Boolean(seo.defaultDescription) && seo.defaultDescription.length >= 50 && seo.defaultDescription.length <= 160,
          label: 'Meta description length',
          hint: seo.defaultDescription
            ? `${seo.defaultDescription.length} characters — aim for 120–160`
            : 'Add a meta description',
        },
        {
          ok: /^https:\/\//.test(seo.canonicalBase || ''),
          label: 'Canonical base URL',
          hint: seo.canonicalBase ? seo.canonicalBase : 'Set the production domain',
        },
        {
          ok: /index/i.test(seo.robots || ''),
          label: 'Search indexing allowed',
          hint: seo.robots || 'Robots directive is empty',
        },
        {
          ok: Boolean(seo.sitemapEnabled),
          label: 'Sitemap generation',
          hint: seo.sitemapEnabled ? 'Published content is listed in /sitemap.xml' : 'Sitemap is disabled',
        },
        {
          ok: Boolean(seo.ogImage),
          label: 'Social share image',
          hint: seo.ogImage ? 'Open Graph image is configured' : 'Upload a 1200×630 share image',
        },
        {
          ok: Boolean(tracking?.ga4Id),
          label: 'Google Analytics 4',
          hint: tracking?.ga4Id || 'Add a GA4 measurement ID',
        },
        {
          ok: Boolean(tracking?.metaPixelId),
          label: 'Meta Pixel',
          hint: tracking?.metaPixelId || 'Add a Meta Pixel ID',
        },
        {
          ok: Boolean(tracking?.googleSiteVerification),
          label: 'Google site verification',
          hint: tracking?.googleSiteVerification || 'Add the verification token',
        },
      ]
    : [];

  const passed = checks.filter((check) => check.ok).length;
  const score = checks.length ? Math.round((passed / checks.length) * 100) : 0;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        <div>
          <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dash-accent)', marginBottom: 6 }}>
            Marketing
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3vw, 32px)', letterSpacing: '-0.02em', marginBottom: 5 }}>SEO &amp; search</h1>
          <p style={{ fontSize: 13, color: 'var(--dash-muted)', maxWidth: 640 }}>
            Search defaults used across the storefront, structured data, sitemap generation and the
            analytics integrations loaded on every public page.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button as="a" href="/sitemap.xml" target="_blank" rel="noreferrer" $variant="outline">
            <ExternalLink size={14} /> Sitemap
          </Button>
          <Button as="a" href="/robots.txt" target="_blank" rel="noreferrer" $variant="outline">
            <ExternalLink size={14} /> Robots.txt
          </Button>
        </div>
      </div>

      {error ? (
        <Card>
          <ErrorBlock message={error} onRetry={load} />
        </Card>
      ) : loading || !seo ? (
        <Card>
          <SkeletonRows rows={6} />
        </Card>
      ) : (
        <>
          {formError && <ErrorBlock message={formError} />}
          <Layout>
            <Card>
              <SectionTitle>
                <Search /> Search defaults
              </SectionTitle>
              <FormGrid $cols={2}>
                <Field label="Default title" hint="50–60 characters" full>
                  <Input value={seo.defaultTitle} onChange={(event) => setSeo((prev) => ({ ...prev, defaultTitle: event.target.value }))} />
                </Field>
                <Field label="Title template" hint="%s is the page title">
                  <Input value={seo.titleTemplate} onChange={(event) => setSeo((prev) => ({ ...prev, titleTemplate: event.target.value }))} />
                </Field>
                <Field label="Canonical base URL">
                  <Input value={seo.canonicalBase} onChange={(event) => setSeo((prev) => ({ ...prev, canonicalBase: event.target.value }))} placeholder="https://rooteco.vercel.app" />
                </Field>
                <Field label="Default description" hint="120–160 characters" full>
                  <Textarea value={seo.defaultDescription} onChange={(event) => setSeo((prev) => ({ ...prev, defaultDescription: event.target.value }))} />
                </Field>
                <Field label="Keywords" full>
                  <Input value={seo.keywords} onChange={(event) => setSeo((prev) => ({ ...prev, keywords: event.target.value }))} />
                </Field>
                <Field label="Robots directive">
                  <Input value={seo.robots} onChange={(event) => setSeo((prev) => ({ ...prev, robots: event.target.value }))} />
                </Field>
                <Field label="Sitemap">
                  <CheckRow>
                    <input
                      type="checkbox"
                      checked={Boolean(seo.sitemapEnabled)}
                      onChange={(event) => setSeo((prev) => ({ ...prev, sitemapEnabled: event.target.checked }))}
                    />
                    Include published content
                  </CheckRow>
                </Field>
                <ImageField
                  label="Default social share image"
                  value={seo.ogImage}
                  onChange={(value) => setSeo((prev) => ({ ...prev, ogImage: value }))}
                  hint="1200×630 recommended"
                />
              </FormGrid>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="button" onClick={saveSeo} disabled={savingSeo}>
                  {savingSeo ? 'Saving…' : 'Save search defaults'}
                </Button>
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card>
                <SectionTitle>
                  <ShieldCheck /> SEO checklist
                </SectionTitle>
                <ScoreBar>
                  <span className="track">
                    <span className="fill" style={{ width: `${score}%`, display: 'block' }} />
                  </span>
                  <span className="value">
                    {passed}/{checks.length}
                  </span>
                </ScoreBar>
                {checks.map((check) => (
                  <CheckRowItem key={check.label} $ok={check.ok}>
                    <span className="icon">{check.ok ? <Check /> : <X />}</span>
                    <span className="text">
                      <div style={{ fontWeight: 550 }}>{check.label}</div>
                      <div className="hint">{check.hint}</div>
                    </span>
                  </CheckRowItem>
                ))}
              </Card>

              <Card>
                <SectionTitle>
                  <BarChart3 /> Analytics &amp; verification
                </SectionTitle>
                <FormGrid $cols={1}>
                  <Field label="Google Analytics 4 ID" hint="G-XXXXXXXXXX">
                    <Input value={tracking.ga4Id} onChange={(event) => setTracking((prev) => ({ ...prev, ga4Id: event.target.value }))} />
                  </Field>
                  <Field label="Meta Pixel ID">
                    <Input value={tracking.metaPixelId} onChange={(event) => setTracking((prev) => ({ ...prev, metaPixelId: event.target.value }))} />
                  </Field>
                  <Field label="Google site verification">
                    <Input
                      value={tracking.googleSiteVerification}
                      onChange={(event) => setTracking((prev) => ({ ...prev, googleSiteVerification: event.target.value }))}
                    />
                  </Field>
                </FormGrid>
                <p style={{ marginTop: 10, fontSize: 11.5, color: 'var(--dash-muted)', lineHeight: 1.65 }}>
                  Scripts load only when an ID is present. Provider secrets belong in environment
                  variables, never here.
                </p>
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="button" onClick={saveTracking} disabled={savingTracking} $variant="outline">
                    {savingTracking ? 'Saving…' : 'Save tracking'}
                  </Button>
                </div>
              </Card>

              <Card>
                <SectionTitle>
                  <Globe2 /> Indexed surfaces
                </SectionTitle>
                <p style={{ fontSize: 12, color: 'var(--dash-muted)', lineHeight: 1.7 }}>
                  Published products, categories, collections, journal posts and CMS pages are
                  included automatically. Draft pages, unpublished products and the dashboard are
                  excluded from indexing.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  <Button as="a" href="/sitemap.xml" target="_blank" rel="noreferrer" $variant="ghost" style={{ padding: '5px 9px', fontSize: 11.5 }}>
                    <Link2 size={12} /> /sitemap.xml
                  </Button>
                  <Button as="a" href="/" target="_blank" rel="noreferrer" $variant="ghost" style={{ padding: '5px 9px', fontSize: 11.5 }}>
                    <ImageIcon size={12} /> Open storefront
                  </Button>
                </div>
              </Card>
            </div>
          </Layout>
        </>
      )}
    </>
  );
}
