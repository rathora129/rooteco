import FAQPage from '@/components/pages/FAQPage';
import { getFaqs } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';

export const metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about RootEco corporate gifting — MOQs, branding, samples, payment terms, delivery and tracking.',
};

export default async function FAQRoute() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);
  return <FAQPage faqs={faqs} contact={settings.contact} />;
}
