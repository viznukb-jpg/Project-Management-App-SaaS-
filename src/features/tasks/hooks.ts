import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { TaskFormValues } from './components/TaskFormModal';
import { taskKeys } from './queryKeys';

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  position: number;
  assigneeId?: string | null;
};

export function useTasks(projectId: string, search = '') {
  return useInfiniteQuery({
    queryKey: taskKeys.list(projectId, search),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ projectId });
      if (search) params.set('search', search);
      if (pageParam) params.set('cursor', pageParam);
      params.set('limit', '20');

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json() as Promise<{ data: Task[]; nextCursor: string | null }>;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTask: TaskFormValues) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, projectId }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all(projectId) });
      const previous = queryClient.getQueriesData<{
        pages: { data: Task[]; nextCursor: string | null }[];
      }>({
        queryKey: taskKeys.all(projectId),
      });

      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        projectId,
        title: newTask.title,
        description: newTask.description || null,
        status: newTask.status || 'TODO',
        priority: newTask.priority || 'MEDIUM',
        position: 0, // Will be updated on actual fetch
      };

      queryClient.setQueriesData<{
        pages: { data: Task[]; nextCursor: string | null }[];
      }>({ queryKey: taskKeys.all(projectId) }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((p, index) => {
            if (index === 0) {
              return { ...p, data: [optimisticTask, ...p.data] };
            }
            return p;
          }),
        };
      });

      return { previous };
    },
    onError: (err, newTask, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedTask: Partial<Task> & { id: string }) => {
      const { id, projectId: _projectId, ...payload } = updatedTask;
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all(projectId) });
      const previous = queryClient.getQueriesData<{
        pages: { data: Task[]; nextCursor: string | null }[];
      }>({
        queryKey: taskKeys.all(projectId),
      });

      queryClient.setQueriesData<{
        pages: { data: Task[]; nextCursor: string | null }[];
      }>({ queryKey: taskKeys.all(projectId) }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            data: p.data.map((t) =>
              t.id === updatedTask.id ? { ...t, ...updatedTask } : t
            ),
          })),
        };
      });

      return { previous };
    },
    onError: (err, updatedTask, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all(projectId) });
      const previous = queryClient.getQueriesData<{
        pages: { data: Task[]; nextCursor: string | null }[];
      }>({
        queryKey: taskKeys.all(projectId),
      });

      queryClient.setQueriesData<{
        pages: { data: Task[]; nextCursor: string | null }[];
      }>({ queryKey: taskKeys.all(projectId) }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            data: p.data.filter((t) => t.id !== taskId),
          })),
        };
      });

      return { previous };
    },
    onError: (err, taskId, context) => {
      context?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}
