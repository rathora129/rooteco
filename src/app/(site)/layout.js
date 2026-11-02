import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import FloatingWhatsAppButton from '@/components/common/FloatingWhatsAppButton';
import Analytics from '@/components/marketing/Analytics';
import { getCategories, getProducts } from '@/lib/catalog';
import { getSettings, publicSettings } from '@/lib/settings';
import { absoluteUrl, jsonLdScript, siteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

function normalizeRobots(value) {
  const text = String(value || 'index, follow');
  const index = !/noindex/i.test(text);
  const follow = !/nofollow/i.test(text);
  return { index, follow };
}

export async function generateMetadata() {
  const settings = await getSettings();
  const seo = settings.seo || {};
  const general = settings.general || {};
  const base = siteUrl(settings);
  const title = seo.defaultTitle || general.siteName || 'RootEco';
  const description = seo.defaultDescription || general.tagline || '';
  const ogImage = absoluteUrl(seo.ogImage || general.logoUrl, settings);

  return {
    metadataBase: new URL(base),
    title: {
      default: title,
      template: seo.titleTemplate || '%s | RootEco',
    },
    description,
    keywords: String(seo.keywords || '')
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    alternates: { canonical: base },
    robots: normalizeRobots(seo.robots),
    icons: {
      icon: general.faviconUrl || '/icon.png',
      apple: general.faviconUrl || '/icon.png',
    },
    verification: {
      google: settings.marketing?.googleSiteVerification || undefined,
    },
    openGraph: {
      type: 'website',
      url: base,
      siteName: general.siteName || 'RootEco',
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function SiteLayout({ children }) {
  const [settings, categories, featured] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({ featured: true, limit: 1 }),
  ]);
  const publicConfig = publicSettings(settings);
  const base = siteUrl(settings);
  const socialLinks = Object.values(settings.social || {}).filter(Boolean);
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings.general.siteName || 'RootEco',
      url: base,
      logo: absoluteUrl(settings.general.logoUrl, settings),
      email: settings.contact.email || undefined,
      telephone: settings.contact.phone || undefined,
      address: settings.contact.address
        ? { '@type': 'PostalAddress', streetAddress: settings.contact.address }
        : undefined,
      sameAs: socialLinks.length ? socialLinks : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: settings.general.siteName || 'RootEco',
      url: base,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${base}/products?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData) }}
      />
      <AnnouncementBar
        message={settings.general.announcement}
        active={settings.general.announcementActive}
      />
      <Navbar
        categories={categories}
        featuredProduct={featured[0] || null}
        logoUrl={settings.general.logoUrl}
      />
      <main>{children}</main>
      <Footer categories={categories} settings={publicConfig} />
      <CartDrawer />
      <FloatingWhatsAppButton
        number={settings.whatsapp.number}
        message={settings.whatsapp.message}
        enabled={settings.whatsapp.enabled}
      />
      <Analytics
        ga4Id={settings.marketing.ga4Id}
        metaPixelId={settings.marketing.metaPixelId}
      />
    </>
  );
}
