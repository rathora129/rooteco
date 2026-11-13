import TrackOrderPage from '@/components/pages/TrackOrderPage';
import { getPage } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { heroFromSections } from '@/lib/pages/layouts';

export const metadata = {
  title: 'Track Order',
  description:
    'Check the status of your RootEco order with your order reference and email address.',
};

export default async function TrackOrderRoute({ searchParams }) {
  const [settings, params, page] = await Promise.all([
    getSettings(),
    searchParams,
    getPage('track-order'),
  ]);
  const hero = heroFromSections(page?.sections, {
    eyebrow: 'Order tracking',
    title: 'Track your order',
    subtitle:
      'Enter your order reference and the email used at checkout to see the latest status from our workshop.',
  });
  return (
    <TrackOrderPage
      initialNumber={typeof params?.number === 'string' ? params.number : ''}
      contact={settings.contact}
      hero={hero}
    />
  );
}
