import SecurityModule from '@/components/dashboard/modules/SecurityModule';

export const metadata = { title: 'Account security', robots: { index: false, follow: false } };

export default function SecurityPage() {
  return <SecurityModule />;
}
