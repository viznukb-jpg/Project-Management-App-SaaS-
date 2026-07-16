'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { CommentList } from '@/features/comments/components/CommentList';
import { AttachmentList } from '@/features/attachments/components/AttachmentList';

type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeId?: string | null;
};

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  currentUserId,
  onEditClick,
  onDeleteClick,
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onEditClick?: (task: Task) => void;
  onDeleteClick?: (taskId: string) => void;
}) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{task.status}</Badge>
              <Badge variant="outline" className="uppercase text-xs">
                {task.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2 pr-8">
              {onEditClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(task)}
                >
                  Edit
                </Button>
              )}
              {onDeleteClick && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteClick(task.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription className="text-slate-600 mt-2 whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div>
            <CommentList
              taskId={task.id}
              currentUserId={currentUserId}
              projectId={task.projectId}
              isModal={true}
            />
          </div>
          <div>
            <AttachmentList taskId={task.id} currentUserId={currentUserId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
