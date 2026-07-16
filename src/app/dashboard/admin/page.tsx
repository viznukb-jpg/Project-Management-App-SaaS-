'use client';

import { useWorkspaceStore } from '@/shared/store/workspace';
import { useQuery } from '@tanstack/react-query';
import { Users, FolderKanban, ListTodo, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface WorkspaceStats {
  usersCount: number;
  projectsCount: number;
  tasksCount: number;
  activeWorkspacesCount: number;
}

export default function AdminDashboardPage() {
  const { activeWorkspaceId } = useWorkspaceStore();

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<WorkspaceStats>({
    queryKey: ['workspaceStats', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return null;
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/stats`);
      if (!res.ok) {
        if (res.status === 403)
          throw new Error(
            'Forbidden: You do not have admin access to this workspace.'
          );
        throw new Error('Failed to fetch statistics');
      }
      return res.json();
    },
    enabled: !!activeWorkspaceId,
  });

  if (!activeWorkspaceId) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Please select a workspace first.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        Loading statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 max-w-md text-center">
          <p className="font-semibold mb-2">Access Denied</p>
          <p className="text-sm mb-4">{error.message}</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Users count',
      value: stats?.usersCount || 0,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Projects count',
      value: stats?.projectsCount || 0,
      icon: FolderKanban,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Tasks count',
      value: stats?.tasksCount || 0,
      icon: ListTodo,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Active workspaces',
      value: stats?.activeWorkspacesCount || 0,
      icon: LayoutDashboard,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="group relative bg-white overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 rounded-xl ${stat.lightColor} transition-colors group-hover:scale-110 duration-300 ease-out`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500 truncate">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
            {/* Bottom decoration line */}
            <div
              className={`h-1 w-full ${stat.color} absolute bottom-0 left-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
