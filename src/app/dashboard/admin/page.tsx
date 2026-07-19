import { AdminDashboardContent } from '@/features/admin';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 sm:p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Overview of your workspace statistics.
        </p>
      </div>

      <AdminDashboardContent />
    </div>
  );
}
