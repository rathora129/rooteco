import TrackOrderPage from '@/components/pages/TrackOrderPage';

export const metadata = {
  title: 'Track Order',
  description:
    'Check the demo status of your RootEco order with your order reference and email address.',
};

export default function TrackOrderRoute() {
  return <TrackOrderPage />;
}
