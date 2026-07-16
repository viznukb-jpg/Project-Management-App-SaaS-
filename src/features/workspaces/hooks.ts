import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/shared/store/workspace';

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
}

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await fetch('/api/workspaces');
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      return res.json();
    },
  });
}

export function useActiveWorkspaceRole() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();

  const activeWorkspace = workspaces?.find((w) => w.id === activeWorkspaceId);
  return activeWorkspace?.role || 'VIEWER'; // Fallback to least privileged
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string | null;
  action: string;
  metadata: unknown;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

export function useWorkspaceActivity(workspaceId: string) {
  return useQuery<AuditLog[]>({
    queryKey: ['activity', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/workspaces/${workspaceId}/activity`);
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json();
    },
    enabled: !!workspaceId,
  });
}
