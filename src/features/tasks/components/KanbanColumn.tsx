import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '../hooks';
import { SortableTaskCard } from './TaskCard';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  canManageTasks,
}: {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (t: Task) => void;
  canManageTasks?: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { type: 'Column', status },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-slate-100 rounded-lg p-4 min-w-[300px] w-[300px] border border-slate-200 h-full min-h-0"
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
              disabled={!canManageTasks}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
