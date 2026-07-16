'use client';

import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/shared/store/workspace';
import Link from 'next/link';
import { Badge } from '@/shared/ui/Badge';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
};

export function ProjectList() {
  const { activeWorkspaceId } = useWorkspaceStore();

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];
      const res = await fetch(`/api/projects?workspaceId=${activeWorkspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json() as Promise<Project[]>;
    },
    enabled: !!activeWorkspaceId,
  });

  if (!activeWorkspaceId) {
    return (
      <div className="p-12 text-center border border-dashed rounded-lg bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          No Workspaces Found
        </h2>
        <p className="text-slate-500 mb-6">
          You don't have any workspaces yet, or none is selected.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-900/90 h-10 px-4 py-2"
        >
          Go to Dashboard to Create Workspace
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse text-slate-500">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading projects.
      </div>
    );
  }

  if (projects?.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50/50">
        No projects found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects?.map((project) => (
        <Link
          key={project.id}
          href={`/dashboard/projects/${project.id}`}
          className="group block p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-blue-200"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <Badge
              variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
              className="text-[10px]"
            >
              {project.status}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm line-clamp-2 min-h-[40px]">
            {project.description || 'No description provided.'}
          </p>
        </Link>
      ))}
    </div>
  );
}
