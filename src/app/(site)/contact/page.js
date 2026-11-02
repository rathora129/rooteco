import ContactPage from '@/components/pages/ContactPage';
import { getPage } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { absoluteUrl } from '@/lib/seo';

export async function generateMetadata() {
  const [page, settings] = await Promise.all([getPage('contact'), getSettings()]);
  return {
    title: page?.seoTitle ? { absolute: page.seoTitle } : page?.title || 'Contact Us',
    description:
      page?.seoDescription ||
      'Contact the RootEco gifting team for product questions, bulk orders, samples or delivery support.',
    alternates: { canonical: absoluteUrl('/contact', settings) },
  };
}

export default async function ContactRoute() {
  const settings = await getSettings();
  return <ContactPage contact={settings.contact} />;
}
