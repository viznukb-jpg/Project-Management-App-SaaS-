import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  workspaceId: string;
};

export function useProjects(workspaceId: string | null) {
  return useQuery<Project[]>({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/projects?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
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
      await queryClient.cancelQueries({ queryKey: ['projects', workspaceId] });
      const previousProjects = queryClient.getQueryData<Project[]>([
        'projects',
        workspaceId,
      ]);

      const optimisticProject: Project = {
        id: `temp-${Date.now()}`,
        name: newProject.name,
        description: newProject.description || null,
        status: 'ACTIVE',
        workspaceId,
      };

      queryClient.setQueryData<Project[]>(['projects', workspaceId], (old) => {
        return [...(old || []), optimisticProject];
      });

      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      if (context?.previousProjects && workspaceId) {
        queryClient.setQueryData(
          ['projects', workspaceId],
          context.previousProjects
        );
      }
    },
    onSettled: () => {
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
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
      await queryClient.cancelQueries({ queryKey: ['projects', workspaceId] });
      await queryClient.cancelQueries({
        queryKey: ['project', updatedProject.id],
      });

      const previousProjects = queryClient.getQueryData<Project[]>([
        'projects',
        workspaceId,
      ]);
      const previousProject = queryClient.getQueryData<Project>([
        'project',
        updatedProject.id,
      ]);

      queryClient.setQueryData<Project[]>(['projects', workspaceId], (old) => {
        if (!old) return [];
        return old.map((p) =>
          p.id === updatedProject.id ? { ...p, ...updatedProject } : p
        );
      });

      queryClient.setQueryData<Project>(
        ['project', updatedProject.id],
        (old) => {
          if (!old) return old;
          return { ...old, ...updatedProject };
        }
      );

      return { previousProjects, previousProject };
    },
    onError: (err, updatedProject, context) => {
      if (workspaceId && context?.previousProjects) {
        queryClient.setQueryData(
          ['projects', workspaceId],
          context.previousProjects
        );
      }
      if (context?.previousProject) {
        queryClient.setQueryData(
          ['project', updatedProject.id],
          context.previousProject
        );
      }
    },
    onSettled: (data, err, updatedProject) => {
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
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
      await queryClient.cancelQueries({ queryKey: ['projects', workspaceId] });

      const previousProjects = queryClient.getQueryData<Project[]>([
        'projects',
        workspaceId,
      ]);

      queryClient.setQueryData<Project[]>(['projects', workspaceId], (old) => {
        if (!old) return [];
        return old.filter((p) => p.id !== projectId);
      });

      return { previousProjects };
    },
    onError: (err, projectId, context) => {
      if (workspaceId && context?.previousProjects) {
        queryClient.setQueryData(
          ['projects', workspaceId],
          context.previousProjects
        );
      }
    },
    onSettled: () => {
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      }
    },
  });
}
