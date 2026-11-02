import SettingsModule from '@/components/dashboard/modules/SettingsModule';

export const metadata = { title: 'Settings', robots: { index: false, follow: false } };

export default function SettingsPage() {
  return <SettingsModule />;
}
