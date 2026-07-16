import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/server/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (e) {
    console.error('Session error:', e);
  }

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
