import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { projectKeys } from './queryKeys';

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  workspaceId: string;
  createdAt?: string; // It's returned from API
};

export function useProjects(workspaceId: string | null, search?: string) {
  return useInfiniteQuery({
    queryKey: projectKeys.list(workspaceId || '', search || ''),
    queryFn: async ({ pageParam }) => {
      if (!workspaceId) throw new Error('No workspaceId');

      const params = new URLSearchParams({ workspaceId });
      if (search) params.set('search', search);
      if (pageParam) params.set('cursor', pageParam);
      params.set('limit', '12');

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json() as Promise<{
        data: Project[];
        total: number;
        nextCursor: string | null;
      }>;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!workspaceId,
  });
}

export function useProject(projectId: string) {
  return useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCreateProject(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, workspaceId }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    onMutate: async (newProject) => {
      if (!workspaceId) return;
      await queryClient.cancelQueries({
        queryKey: projectKeys.all(workspaceId),
      });
      const previous = queryClient.getQueriesData<{
        pages: { data: Project[]; nextCursor: string | null }[];
      }>({
        queryKey: projectKeys.all(workspaceId),
      });

      const optimisticProject: Project = {
        id: `temp-${Date.now()}`,
        name: newProject.name,
        description: newProject.description || null,
        status: 'ACTIVE',
        workspaceId,
      };

      queryClient.setQueriesData<{
        pages: { data: Project[]; nextCursor: string | null }[];
      }>({ queryKey: projectKeys.all(workspaceId) }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((p, index) => {
            if (index === 0) {
              return { ...p, data: [optimisticProject, ...p.data] };
            }
            return p;
          }),
        };
      });

      return { previous };
    },
    onError: (err, newProject, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.all(workspaceId),
        });
      }
    },
  });
}

export function useUpdateProject(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedProject: Partial<Project> & { id: string }) => {
      const { id, workspaceId: _, ...payload } = updatedProject;
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update project');
      }
      return res.json();
    },
    onMutate: async (updatedProject) => {
      if (!workspaceId) return;
      await queryClient.cancelQueries({
        queryKey: projectKeys.all(workspaceId),
      });
      await queryClient.cancelQueries({
        queryKey: ['project', updatedProject.id],
      });

      const previous = queryClient.getQueriesData<{
        pages: { data: Project[]; nextCursor: string | null }[];
      }>({
        queryKey: projectKeys.all(workspaceId),
      });
      const previousProject = queryClient.getQueryData<Project>([
        'project',
        updatedProject.id,
      ]);

      queryClient.setQueriesData<{
        pages: { data: Project[]; nextCursor: string | null }[];
      }>({ queryKey: projectKeys.all(workspaceId) }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            data: p.data.map((pr) =>
              pr.id === updatedProject.id ? { ...pr, ...updatedProject } : pr
            ),
          })),
        };
      });

      queryClient.setQueryData<Project>(
        ['project', updatedProject.id],
        (old) => {
          if (!old) return old;
          return { ...old, ...updatedProject };
        }
      );

      return { previous, previousProject };
    },
    onError: (err, updatedProject, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousProject) {
        queryClient.setQueryData(
          ['project', updatedProject.id],
          context.previousProject
        );
      }
    },
    onSettled: (data, err, updatedProject) => {
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.all(workspaceId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['project', updatedProject.id],
      });
    },
  });
}

export function useDeleteProject(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }
      return res.json();
    },
    onMutate: async (projectId) => {
      if (!workspaceId) return;
      await queryClient.cancelQueries({
        queryKey: projectKeys.all(workspaceId),
      });

      const previous = queryClient.getQueriesData<{
        pages: { data: Project[]; nextCursor: string | null }[];
      }>({
        queryKey: projectKeys.all(workspaceId),
      });

      queryClient.setQueriesData<{
        pages: { data: Project[]; nextCursor: string | null }[];
      }>({ queryKey: projectKeys.all(workspaceId) }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            data: p.data.filter((pr) => pr.id !== projectId),
          })),
        };
      });

      return { previous };
    },
    onError: (err, projectId, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.all(workspaceId),
        });
      }
    },
  });
}
