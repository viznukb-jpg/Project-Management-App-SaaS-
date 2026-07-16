'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { TaskCard, SortableTaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { createClient } from '@supabase/supabase-js';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
type TaskStatus = (typeof COLUMNS)[number];

type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  position: number;
};

// Initialize Supabase Client for Real-time subscriptions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function KanbanBoard({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });

  // Supabase Real-time Subscription
  useEffect(() => {
    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (_payload) => {
          // Whenever a task changes in the DB, invalidate the react-query cache
          // to refetch automatically on all connected clients
          queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<Task> & { id: string }) => {
      const res = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    // Optimistic Update
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>([
        'tasks',
        projectId,
      ]);

      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) => {
        if (!old) return [];
        return old.map((t) =>
          t.id === updatedTask.id ? { ...t, ...updatedTask } : t
        );
      });
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks', projectId], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
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
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) => {
        if (!old) return [];
        const activeIndex = old.findIndex((t) => t.id === activeId);
        const overIndex = old.findIndex((t) => t.id === overId);

        if (old[activeIndex].status !== old[overIndex].status) {
          const newTasks = [...old];
          newTasks[activeIndex].status = old[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(old, activeIndex, overIndex);
      });
    }

    // Dropping a Task over an empty Column
    if (isActiveTask && isOverColumn) {
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) => {
        if (!old) return [];
        const activeIndex = old.findIndex((t) => t.id === activeId);
        const newTasks = [...old];
        newTasks[activeIndex].status = overId as TaskStatus;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    let newStatus = activeTask.status;

    // Determine new status based on what it was dropped on
    if (over.data.current?.type === 'Column') {
      newStatus = overId as TaskStatus;
    } else if (over.data.current?.type === 'Task') {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (activeTask.status !== newStatus) {
      updateTaskMutation.mutate({ id: activeTask.id, status: newStatus });
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              status={col}
              tasks={tasks.filter((t) => t.status === col)}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}

function KanbanColumn({
  status,
  tasks,
  onTaskClick,
}: {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (t: Task) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { type: 'Column', status },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-slate-100 rounded-lg p-4 min-w-[300px] w-[300px] border border-slate-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700 text-sm">
          {status.replace('_', ' ')}
        </h3>
        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
