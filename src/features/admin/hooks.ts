import { useQuery } from '@tanstack/react-query';

export interface WorkspaceStats {
  usersCount: number;
  projectsCount: number;
  tasksCount: number;
  activeWorkspacesCount: number;
}

export function useWorkspaceStats(activeWorkspaceId: string | null) {
  return useQuery<WorkspaceStats>({
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
}
