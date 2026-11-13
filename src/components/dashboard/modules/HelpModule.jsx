'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Compass,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  UploadCloud,
  Wrench,
} from 'lucide-react';
import { Badge, Button, Card, PageHeader, SearchBox } from '@/components/dashboard/ui';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TopicNav = styled.div`
  position: sticky;
  top: 84px;
  @media (max-width: 900px) {
    position: static;
  }
`;

const TopicButton = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: left;
  font-size: 12px;
  line-height: 1.45;
  color: ${(p) => (p.$active ? 'var(--dash-ink)' : 'var(--dash-muted)')};
  background: ${(p) => (p.$active ? 'var(--dash-panel-2)' : 'transparent')};
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    margin-top: 1px;
    color: ${(p) => (p.$active ? 'var(--dash-accent)' : 'var(--dash-faint)')};
  }
  &:hover { background: var(--dash-panel-2); color: var(--dash-ink); }
`;

const GroupLabel = styled.div`
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dash-faint);
  padding: 12px 10px 5px;
`;

const Step = styled.li`
  margin-bottom: 8px;
  padding-left: 2px;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--dash-muted);
  strong { color: var(--dash-ink); font-weight: 600; }
`;

const ARTICLES = [
  {
    id: 'overview',
    icon: Compass,
    category: 'Getting started',
    title: 'Find your way around the dashboard',
    summary: 'How the owner console is organised and where each job lives.',
    keywords: 'navigation sidebar groups command palette overview alerts',
    body: [
      'The sidebar groups every screen into Overview, Website Studio, Catalogue, Business, Marketing, Communication and System. Click a group heading to collapse it, or use the collapse button at the top left to shrink the sidebar to icons.',
      'The Overview screen shows revenue, orders, leads and website health. The bell in the top bar lists items that need attention, such as pending orders or leads waiting for a follow-up.',
      'Press ⌘K (or Ctrl+K) anywhere to open the command palette and jump straight to a module. Arrow keys move through results and Enter opens one.',
    ],
    links: [
      { label: 'Open the overview', href: '/dashboard' },
      { label: 'Open Website Studio', href: '/dashboard/website' },
    ],
  },
  {
    id: 'pages',
    icon: FileText,
    category: 'Website Studio',
    title: 'Create and publish a page',
    summary: 'Add a CMS page, choose its slug and control its SEO metadata.',
    keywords: 'pages slug seo publish draft preview new page',
    body: [
      'Open Website Studio → Pages and choose New page. Enter a title, a unique slug and optional SEO fields, then save.',
      'Pages start in draft. Use Publish to make the page available on the public site, and Unpublish to take it offline without deleting it.',
      'The public URL is /pages/<slug>. The Preview action opens /preview/<slug>, which renders the latest saved draft even before publishing.',
      'Delete a page only when you are sure; deletion also removes its sections.',
    ],
    links: [
      { label: 'Manage pages', href: '/dashboard/pages' },
      { label: 'SEO defaults', href: '/dashboard/seo' },
    ],
  },
  {
    id: 'builder',
    icon: Layers,
    category: 'Website Studio',
    title: 'Build a page with sections',
    summary: 'Add, configure, order, hide and remove sections on each page.',
    keywords: 'page builder sections drag drop order visibility enable disable hero cta',
    body: [
      'Open a page with the Build action to launch the page builder. Each page keeps its own independent section list.',
      'Add a section from the section library, then edit its heading, copy, media and layout configuration in the inspector.',
      'Drag sections by their handle to change the order. The saved order is used by the public page, so what you arrange is what visitors see.',
      'Toggle a section off to keep it configured but hidden, and remove sections you no longer need. Duplicate a section to reuse its settings.',
      'Click Save draft to persist changes. Use Preview to check the draft, then Publish to push the page live.',
    ],
    links: [
      { label: 'Open pages', href: '/dashboard/pages' },
      { label: 'View the storefront', href: '/' },
    ],
  },
  {
    id: 'publishing',
    icon: UploadCloud,
    category: 'Website Studio',
    title: 'How drafts and publishing work',
    summary: 'What is public, what stays private, and how to check before launch.',
    keywords: 'publish unpublish draft preview live status cms',
    body: [
      'Draft content is visible only inside the dashboard and on preview URLs. Unpublished pages return a not-found response on the public site.',
      'Publishing changes the page status and immediately makes its current saved sections public. There is no separate cache to clear.',
      'Before publishing, open Preview and confirm the section order, images and text. Then publish and open the public URL in a new tab.',
      'To take a page offline temporarily, unpublish it instead of deleting it. Its content and sections are kept for later.',
    ],
    links: [
      { label: 'Banners', href: '/dashboard/banners' },
      { label: 'Media library', href: '/dashboard/media' },
    ],
  },
  {
    id: 'catalogue',
    icon: Boxes,
    category: 'Catalogue',
    title: 'Manage products, categories and collections',
    summary: 'Keep the storefront catalogue accurate and in stock.',
    keywords: 'products categories collections price stock images slug publish',
    body: [
      'Products need a name, category and price. Add images, description, stock, tags and a slug; the public product page updates as soon as you save.',
      'Categories and collections group products on the storefront. Keep names and slugs stable once they are linked from navigation.',
      'The overview highlights products low on stock, and orders reduce stock as they are placed.',
      'Use the media library for images so you can reuse and update them consistently.',
    ],
    links: [
      { label: 'Products', href: '/dashboard/products' },
      { label: 'Categories', href: '/dashboard/categories' },
      { label: 'Collections', href: '/dashboard/collections' },
    ],
  },
  {
    id: 'sales',
    icon: ShoppingBag,
    category: 'Business',
    title: 'Run leads, quotations and orders',
    summary: 'From first enquiry to delivered order, without re-entering data.',
    keywords: 'leads quotes quotations orders follow up convert payment status delivery',
    body: [
      'Every contact form, quote request and manual lead lands in Leads. Move a lead through the pipeline stages and set a follow-up date so it appears in the attention list.',
      'Quotations capture the requirement and amount. When a quote is accepted, convert it to an order with the delivery address; the quote is marked won and linked to the order.',
      'Orders show fulfilment status, payment status and a history timeline. Update status as you confirm, pack, ship and deliver.',
      'Payment status can only be marked paid through verified provider confirmation, so it is read-only in the order editor.',
    ],
    links: [
      { label: 'Leads', href: '/dashboard/leads' },
      { label: 'Quotations', href: '/dashboard/quotes' },
      { label: 'Orders', href: '/dashboard/orders' },
      { label: 'Customers', href: '/dashboard/clients' },
    ],
  },
  {
    id: 'marketing',
    icon: Megaphone,
    category: 'Marketing',
    title: 'Search, analytics and promotions',
    summary: 'SEO defaults, sitemap, tracking IDs, events and coupon codes.',
    keywords: 'seo sitemap robots ga4 meta pixel analytics coupons utm campaigns',
    body: [
      'SEO & search holds the default title, description, canonical URL and social image used when a page has no override. Save it once and every new page inherits it.',
      'The sitemap and robots endpoints are generated from published content. Open them from the SEO screen to confirm what search engines receive.',
      'Analytics reads first-party storefront events: product views, add to cart, checkout starts, purchases, quote requests and WhatsApp clicks.',
      'Coupons are validated on the server at checkout against the code, minimum subtotal, expiry and active state.',
      'Tracking IDs are public identifiers and are only injected when set. Provider secret keys belong in environment variables, never in settings.',
    ],
    links: [
      { label: 'SEO & search', href: '/dashboard/seo' },
      { label: 'Analytics', href: '/dashboard/analytics' },
      { label: 'Coupons', href: '/dashboard/coupons' },
      { label: 'Journal', href: '/dashboard/blogs' },
    ],
  },
  {
    id: 'communication',
    icon: MessageCircle,
    category: 'Communication',
    title: 'Enquiries, WhatsApp and the newsletter',
    summary: 'Reply to customers and understand what each channel needs to work.',
    keywords: 'enquiries contact form whatsapp newsletter subscribers messages cloud api',
    body: [
      'Enquiries collects submissions from the contact form and quote request form. Open an enquiry to call, email or message the customer and update its stage.',
      'The WhatsApp screen sends messages only when the WhatsApp Business Platform environment variables are configured. The floating storefront button uses the display number from settings.',
      'Newsletter lists everyone who subscribed from the storefront. Unsubscribing keeps the record so future sign-ups stay suppressed; deleting removes it permanently.',
    ],
    links: [
      { label: 'Enquiries', href: '/dashboard/enquiries' },
      { label: 'WhatsApp', href: '/dashboard/whatsapp' },
      { label: 'Newsletter', href: '/dashboard/newsletter' },
    ],
  },
  {
    id: 'media',
    icon: UploadCloud,
    category: 'Website Studio',
    title: 'Upload and reuse images',
    summary: 'Add product, banner and editorial images from one library.',
    keywords: 'media images upload cloudinary alt text storage',
    body: [
      'Open Media library and upload one or more images. When Cloudinary is configured, files are stored there and served optimised; local storage is for development only.',
      'Edit the filename and alt text after upload. Alt text is used by screen readers and when an image fails to load.',
      'Copy an image URL to reuse it in product, banner or page fields. Deleting an image removes it from the library, so check where it is used first.',
    ],
    links: [
      { label: 'Media library', href: '/dashboard/media' },
      { label: 'Banners', href: '/dashboard/banners' },
    ],
  },
  {
    id: 'settings',
    icon: Settings2,
    category: 'System',
    title: 'Website settings and branding',
    summary: 'Brand identity, contact details, social links and payments.',
    keywords: 'settings site name logo favicon contact social footer payments whatsapp',
    body: [
      'Website settings controls the site name, tagline, announcement bar, logo and favicon. These values are used by the public header, footer and metadata.',
      'Contact details and social links feed the storefront footer and contact page. Keep the WhatsApp display number in sync with the click-to-chat button.',
      'Payment instructions appear on the order confirmation. Online payments stay disabled until a provider is configured with secret keys and a webhook.',
    ],
    links: [
      { label: 'Website settings', href: '/dashboard/website/settings' },
      { label: 'General settings', href: '/dashboard/settings' },
    ],
  },
  {
    id: 'security',
    icon: ShieldCheck,
    category: 'System',
    title: 'Protect the owner account',
    summary: 'Change the password and control signed-in devices.',
    keywords: 'password security sessions sign out devices login',
    body: [
      'Account security lets you change the password. Use at least 8 characters with a letter and a number.',
      'Changing the password signs out every other session. You can also review and revoke other sessions without changing the password.',
      'Dashboard sessions live in an httpOnly cookie for seven days and sign-in attempts are rate limited.',
    ],
    links: [
      { label: 'Account security', href: '/dashboard/security' },
    ],
  },
  {
    id: 'troubleshooting',
    icon: Wrench,
    category: 'System',
    title: 'Troubleshooting common issues',
    summary: 'Quick checks when something does not look right.',
    keywords: 'error 401 login upload fail empty page slow preview not found',
    body: [
      'Signed out unexpectedly: sessions expire after seven days or when the password changes. Sign in again at /login.',
      'Uploads fail: confirm the storage environment variables are set and that the file is an image under the provider limit.',
      'A page is missing publicly: check that it is published and that its slug is correct. Draft pages are only available on /preview/<slug>.',
      'WhatsApp sending is disabled: the Cloud API token, phone number ID, verify token and app secret must be configured on the server.',
      'Slow screens: large media files and many open tabs slow the browser. The dashboard already paginates tables and loads images lazily.',
    ],
    links: [
      { label: 'Website Studio', href: '/dashboard/website' },
      { label: 'Media library', href: '/dashboard/media' },
    ],
  },
];

const CATEGORIES = ['Getting started', 'Website Studio', 'Catalogue', 'Business', 'Marketing', 'Communication', 'System'];

export default function HelpModule() {
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState('overview');

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return ARTICLES;
    return ARTICLES.filter((article) =>
      `${article.title} ${article.summary} ${article.keywords} ${article.body.join(' ')}`
        .toLowerCase()
        .includes(needle)
    );
  }, [q]);

  const active = ARTICLES.find((article) => article.id === activeId) || ARTICLES[0];
  const Icon = active.icon;

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: results.filter((article) => article.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <PageHeader>
        <div>
          <span className="eyebrow">System</span>
          <h1>Help centre</h1>
          <p>
            Practical guides for running the storefront: publishing pages, arranging sections,
            managing products, following up on enquiries and keeping search settings healthy.
          </p>
        </div>
        <Button as="a" href="/dashboard" $variant="outline">
          <LifeBuoy size={14} /> Back to overview
        </Button>
      </PageHeader>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--dash-muted)' }}>
            <BookOpen size={16} style={{ color: 'var(--dash-accent)' }} />
            <span style={{ fontSize: 12.5 }}>
              {results.length} guide{results.length === 1 ? '' : 's'}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <SearchBox value={q} onChange={setQ} placeholder="Search guides, e.g. “drag sections” or “sitemap”…" />
          </div>
        </div>
      </Card>

      <Layout>
        <TopicNav>
          <Card style={{ padding: 10 }}>
            {grouped.length === 0 ? (
              <div style={{ padding: '18px 10px', fontSize: 12, color: 'var(--dash-faint)', textAlign: 'center' }}>
                <Search size={18} style={{ marginBottom: 6 }} />
                <div>No guides match that search.</div>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.category}>
                  <GroupLabel>{group.category}</GroupLabel>
                  {group.items.map((article) => {
                    const ItemIcon = article.icon;
                    return (
                      <TopicButton
                        key={article.id}
                        type="button"
                        $active={article.id === activeId}
                        onClick={() => setActiveId(article.id)}
                      >
                        <ItemIcon />
                        <span>{article.title}</span>
                      </TopicButton>
                    );
                  })}
                </div>
              ))
            )}
          </Card>
        </TopicNav>

        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                background: 'var(--dash-accent-soft)',
                color: 'var(--dash-accent)',
                flexShrink: 0,
              }}
            >
              <Icon size={18} />
            </span>
            <div>
              <Badge $tone="cream">{active.category}</Badge>
              <h2 style={{ fontSize: 18, marginTop: 6 }}>{active.title}</h2>
              <p style={{ fontSize: 12.5, color: 'var(--dash-muted)', marginTop: 3 }}>{active.summary}</p>
            </div>
          </div>

          <ol style={{ margin: '18px 0 0', paddingLeft: 18 }}>
            {active.body.map((paragraph, index) => (
              <Step key={index}>{paragraph}</Step>
            ))}
          </ol>

          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--dash-line)',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 10.5, fontWeight: 650, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dash-faint)' }}>
              Open
            </span>
            {active.links.map((link) =>
              link.href.startsWith('http') ? (
                <Button key={link.href} as="a" href={link.href} target="_blank" rel="noreferrer" $variant="outline" style={{ padding: '5px 11px', fontSize: 12 }}>
                  {link.label} <ExternalLink size={12} />
                </Button>
              ) : (
                <Button key={link.href} as="a" href={link.href} $variant="outline" style={{ padding: '5px 11px', fontSize: 12 }}>
                  {link.label} <ArrowRight size={12} />
                </Button>
              )
            )}
          </div>
        </Card>
      </Layout>

      <Card style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <HelpCircle size={16} style={{ color: 'var(--dash-accent)' }} />
        <div style={{ fontSize: 12.5, color: 'var(--dash-muted)', flex: 1, minWidth: 220 }}>
          Still stuck? Check the deployment notes in the project repository, or re-run the health
          endpoint to confirm the database and environment are reachable.
        </div>
        <Button as="a" href="/api/health" target="_blank" rel="noreferrer" $variant="ghost" style={{ fontSize: 12 }}>
          Health check <ExternalLink size={12} />
        </Button>
      </Card>
    </>
  );
}
