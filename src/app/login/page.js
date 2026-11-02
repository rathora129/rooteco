import { redirect } from 'next/navigation';
import LoginForm from '@/components/dashboard/LoginForm';
import { getSessionOwner } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Owner Sign In',
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }) {
  const owner = await getSessionOwner();
  if (owner) redirect('/dashboard');

  const params = await searchParams;
  const next = typeof params?.next === 'string' ? params.next : '';
  const nextUrl = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  return <LoginForm nextUrl={nextUrl} />;
}
