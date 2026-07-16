'use client';

import { useQueryClient } from '@tanstack/react-query';
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
import { TaskFormModal, TaskFormValues } from './TaskFormModal';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/shared/ui/Button';
import { PlusIcon } from 'lucide-react';
import {
  useTasks,
  useUpdateTask,
  useCreateTask,
  useDeleteTask,
  Task,
} from '../hooks';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
type TaskStatus = (typeof COLUMNS)[number];

// Initialize Supabase Client for Real-time subscriptions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function KanbanBoard({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const { data: tasks = [] } = useTasks(projectId);
  const updateTaskMutation = useUpdateTask(projectId);
  const createTaskMutation = useCreateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

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
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

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

  const handleCreateTask = (data: TaskFormValues) => {
    createTaskMutation.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const handleUpdateTask = (data: TaskFormValues) => {
    if (!taskToEdit) return;
    updateTaskMutation.mutate(
      { id: taskToEdit.id, ...data },
      {
        onSuccess: () => {
          setIsFormOpen(false);
          setTaskToEdit(null);
          setSelectedTask(null);
        },
      }
    );
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => {
        setSelectedTask(null);
      },
    });
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col h-full gap-6 items-center w-full">
      <div className="flex justify-center w-full pt-4">
        <Button
          onClick={() => setIsFormOpen(true)}
          size="lg"
          className="w-[300px] text-base h-12 shadow-md hover:shadow-lg transition-shadow"
        >
          <PlusIcon className="size-5 mr-2" />
          Create Task
        </Button>
      </div>

      <div className="flex-1 overflow-hidden w-full max-w-7xl mx-auto flex justify-center">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full overflow-x-auto pb-4 px-4 w-full justify-start md:justify-center">
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
            {activeTask ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <TaskCard task={activeTask as any} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDetailModal
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        task={selectedTask as any}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onEditClick={handleEditClick as any}
        onDeleteClick={handleDeleteTask}
      />

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={taskToEdit ? handleUpdateTask : handleCreateTask}
        initialData={taskToEdit}
      />
    </div>
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              task={task as any}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
