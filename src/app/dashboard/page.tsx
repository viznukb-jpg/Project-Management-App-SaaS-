import { DashboardContent } from '@/features/workspaces';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard / Workspace
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your workspace settings and members.
        </p>
      </div>

      <DashboardContent />
    </div>
  );
}
