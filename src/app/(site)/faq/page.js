import FAQPage from '@/components/pages/FAQPage';
import { getFaqs, getPage } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';

export const metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about RootEco corporate gifting — MOQs, branding, samples, payment terms, delivery and tracking.',
};

export default async function FAQRoute() {
  const [faqs, settings, page] = await Promise.all([getFaqs(), getSettings(), getPage('faq')]);
  return <FAQPage faqs={faqs} contact={settings.contact} sections={page?.sections} />;
}
