'use client';

import { Users, FolderKanban, ListTodo, LayoutDashboard } from 'lucide-react';
import { useWorkspaceStats } from '../hooks';

export function StatsGrid({ workspaceId }: { workspaceId: string | null }) {
  const { data: stats } = useWorkspaceStats(workspaceId);

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
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </h3>
              </div>
            </div>
          </div>
          <div
            className={`absolute bottom-0 left-0 h-1 w-full ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          />
        </div>
      ))}
    </div>
  );
}
