import TrackOrderPage from '@/components/pages/TrackOrderPage';
import { getSettings } from '@/lib/settings';

export const metadata = {
  title: 'Track Order',
  description:
    'Check the status of your RootEco order with your order reference and email address.',
};

export default async function TrackOrderRoute({ searchParams }) {
  const [settings, params] = await Promise.all([getSettings(), searchParams]);
  return (
    <TrackOrderPage
      initialNumber={typeof params?.number === 'string' ? params.number : ''}
      contact={settings.contact}
    />
  );
}
