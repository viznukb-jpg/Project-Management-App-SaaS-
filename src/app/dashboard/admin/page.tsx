import Link from 'next/link';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/server/db';
import { users, projects, tasks, workspaces } from '@/server/db/schema';
import { count } from 'drizzle-orm';

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

  const [usersCount] = await db.select({ value: count() }).from(users);
  const [projectsCount] = await db.select({ value: count() }).from(projects);
  const [tasksCount] = await db.select({ value: count() }).from(tasks);
  const [workspacesCount] = await db
    .select({ value: count() })
    .from(workspaces);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Platform Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {usersCount.value}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium">Workspaces</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {workspacesCount.value}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium">Projects</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {projectsCount.value}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium">Tasks Created</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {tasksCount.value}
          </p>
        </div>
      </div>

      <Link
        href="/dashboard"
        className="text-blue-500 underline mt-8 inline-block"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
