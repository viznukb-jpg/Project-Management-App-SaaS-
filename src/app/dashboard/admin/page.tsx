import Link from 'next/link';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  // TODO: Replace with actual platform-admin check when the spec is clarified.
  const isPlatformAdmin = session.user.email === 'admin@example.com';

  if (!isPlatformAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2">
          You do not have platform administrator privileges.
        </p>
        <Link href="/dashboard" className="text-blue-500 underline mt-4 block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p className="mt-2">
        Users count, Projects count, Tasks count, Active workspaces
      </p>
      <Link href="/dashboard" className="text-blue-500 underline mt-4 block">
        Back to Dashboard
      </Link>
    </div>
  );
}
