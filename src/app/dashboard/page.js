import OverviewModule from '@/components/dashboard/modules/OverviewModule';

export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

export default function DashboardPage() {
  return <OverviewModule />;
}
