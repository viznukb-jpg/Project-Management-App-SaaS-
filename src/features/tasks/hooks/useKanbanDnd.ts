import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { MutableRefObject } from 'react';
import { Task } from '../hooks';
import { taskKeys } from '../queryKeys';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export function useKanbanDnd({
  projectId,
  tasks,
  setActiveTask,
  originalStatusRef,
  updateTaskMutation,
}: {
  projectId: string;
  tasks: Task[];
  setActiveTask: (task: Task | null) => void;
  originalStatusRef: MutableRefObject<TaskStatus | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateTaskMutation: any;
}) {
  const queryClient = useQueryClient();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      originalStatusRef.current = task.status;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      queryClient.setQueriesData<{
        pages: { data: Task[]; nextCursor: string | null }[];
      }>({ queryKey: taskKeys.all(projectId) }, (old) => {
        if (!old) return old;
        const allTasks = old.pages.flatMap((p) => p.data);
        const activeIndex = allTasks.findIndex((t) => t.id === activeId);
        const overIndex = allTasks.findIndex((t) => t.id === overId);

        if (activeIndex === -1 || overIndex === -1) return old;

        let newTasks = [...allTasks];
        if (allTasks[activeIndex].status !== allTasks[overIndex].status) {
          newTasks[activeIndex] = {
            ...newTasks[activeIndex],
            status: allTasks[overIndex].status,
          };
        }
        newTasks = arrayMove(newTasks, activeIndex, overIndex);

        let taskIndex = 0;
        return {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            data: newTasks.slice(taskIndex, (taskIndex += p.data.length)),
          })),
        };
      });
    }

    // Dropping a Task over an empty Column
    if (isActiveTask && isOverColumn) {
      queryClient.setQueriesData<{
        pages: { data: Task[]; nextCursor: string | null }[];
      }>({ queryKey: taskKeys.all(projectId) }, (old) => {
        if (!old) return old;
        const allTasks = old.pages.flatMap((p) => p.data);
        const activeIndex = allTasks.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return old;

        const newTasks = [...allTasks];
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          status: overId as TaskStatus,
        };

        let taskIndex = 0;
        return {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            data: newTasks.slice(taskIndex, (taskIndex += p.data.length)),
          })),
        };
      });
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    originalStatusRef.current = null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    const originalStatus = originalStatusRef.current;
    originalStatusRef.current = null;

    if (!over || !originalStatus) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let newStatus = originalStatus;

    if (over.data.current?.type === 'Column') {
      newStatus = overId as TaskStatus;
    } else if (over.data.current?.type === 'Task') {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (originalStatus !== newStatus) {
      updateTaskMutation.mutate({ id: activeId, status: newStatus });
    }
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
