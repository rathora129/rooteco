import LeadsModule from '@/components/dashboard/modules/LeadsModule';

export const metadata = { title: 'Leads & clients', robots: { index: false, follow: false } };

export default function LeadsPage() {
  return <LeadsModule />;
}
