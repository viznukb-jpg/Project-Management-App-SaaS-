'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MessageSquare } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import Link from 'next/link';

type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
};

const priorityColors = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export function TaskCard({
  task,
  isOverlay = false,
  onClick,
}: {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 rounded-md shadow-sm border border-slate-200 group flex flex-col gap-2 relative ${
        isOverlay
          ? 'opacity-90 shadow-lg scale-105 rotate-2 cursor-grabbing'
          : 'cursor-pointer hover:border-blue-400'
      }`}
    >
      <div className="absolute left-2 top-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} />
      </div>

      <div className="pl-4">
        <h4 className="font-medium text-slate-800 text-sm mb-1">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      <div className="pl-4 mt-2 flex items-center justify-between">
        <Badge
          className={`text-[10px] uppercase font-semibold ${priorityColors[task.priority]} hover:${priorityColors[task.priority]}`}
          variant="secondary"
        >
          {task.priority}
        </Badge>
        <Link
          href={`/dashboard/projects/${task.projectId}/tasks/${task.id}/comments`}
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1 text-xs font-medium"
          title="View comments"
        >
          <MessageSquare size={14} />
        </Link>
      </div>
    </div>
  );
}

export function SortableTaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-50/50 border-2 border-dashed border-blue-400 rounded-md h-[120px]"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
