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
import { useState, useEffect, useRef } from 'react';
import { TaskCard, SortableTaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskFormModal, TaskFormValues } from './TaskFormModal';
import { supabase } from '@/shared/utils/supabase/client';
import { Button } from '@/shared/ui/Button';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { Input } from '@/shared/ui/Input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  useTasks,
  useUpdateTask,
  useCreateTask,
  useDeleteTask,
  Task,
} from '../hooks';
import { taskKeys } from '../queryKeys';
import { useActiveWorkspaceRole } from '@/features/workspaces';
import { useTaskRealtime } from '../hooks/useTaskRealtime';
import { useKanbanDnd } from '../hooks/useKanbanDnd';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
type TaskStatus = (typeof COLUMNS)[number];

export function KanbanBoard({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const originalStatusRef = useRef<TaskStatus | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Sync state if URL changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search);
  }, [search]);

  const {
    data: tasksRes,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTasks(projectId, search);

  const tasks = tasksRes?.pages.flatMap((p) => p.data) || [];

  const updateTaskMutation = useUpdateTask(projectId);
  const createTaskMutation = useCreateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);
  const role = useActiveWorkspaceRole();
  const canManageTasks = role !== 'VIEWER';

  // Supabase Real-time Subscription
  useTaskRealtime(projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // If user cannot manage tasks, don't pass sensors to DndContext
  const activeSensors = canManageTasks ? sensors : [];

  const { handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
    useKanbanDnd({
      projectId,
      tasks,
      setActiveTask,
      originalStatusRef,
      updateTaskMutation,
    });

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
    setTaskToDelete(taskId);
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-full gap-6 items-center w-full min-h-0">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-7xl px-4 pt-4 gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-md">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchInput('');
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {canManageTasks && (
          <Button
            onClick={() => setIsFormOpen(true)}
            size="default"
            className="w-full sm:w-auto shadow-sm"
          >
            <PlusIcon className="size-4 mr-2" />
            Create Task
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden w-full max-w-7xl mx-auto pb-4">
        <DndContext
          id="kanban-board-dnd"
          sensors={activeSensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-6 h-full items-start px-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col}
                status={col}
                tasks={tasks.filter((t) => t.status === col)}
                onTaskClick={(t) => {
                  setActiveTask(t);
                  setSelectedTask(t);
                }}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-[300px] opacity-80 cursor-grabbing">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <SortableTaskCard task={activeTask as any} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {hasNextPage && (
        <div className="w-full max-w-7xl px-4 flex justify-center pb-8 pt-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More Tasks'}
          </Button>
        </div>
      )}

      <TaskDetailModal
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        task={selectedTask as any}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onEditClick={canManageTasks ? (handleEditClick as any) : undefined}
        onDeleteClick={canManageTasks ? handleDeleteTask : undefined}
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

      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTaskMutation.mutate(taskToDelete, {
              onSuccess: () => {
                setSelectedTask(null);
                setTaskToDelete(null);
              },
            });
          }
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? All comments and attachments will also be deleted."
        confirmText="Delete"
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
}
