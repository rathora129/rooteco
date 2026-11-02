import { requireOwnerPage } from '@/lib/auth';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Owner Dashboard',
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }) {
  const owner = await requireOwnerPage();
  return <DashboardShell owner={owner}>{children}</DashboardShell>;
}
