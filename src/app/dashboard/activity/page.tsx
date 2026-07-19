import { ActivityList } from '@/features/workspaces';

export default function ActivityPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 min-h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Activity Log
          </h1>
          <p className="text-slate-500 mt-1">
            Track everything that happens in your workspace.
          </p>
        </div>

        <ActivityList />
      </div>
    </div>
  );
}
