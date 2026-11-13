import SettingsModule from '@/components/dashboard/modules/SettingsModule';

export const metadata = { title: 'Website settings', robots: { index: false, follow: false } };

export default function WebsiteSettingsPage() {
  return (
    <SettingsModule
      title="Website settings"
      eyebrow="Website studio"
      description="Brand identity, public contact details, social profiles, footer content, search defaults and the storefront WhatsApp button."
      only={['general', 'contact', 'social', 'footer', 'seo', 'whatsapp']}
    />
  );
}
