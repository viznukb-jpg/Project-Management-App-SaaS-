'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/Dialog';
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
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="mb-2">
              {task.status}
            </Badge>
            <Badge variant="outline" className="mb-2 uppercase text-xs">
              {task.priority}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription className="text-slate-600 mt-2 whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div>
            <CommentList taskId={task.id} currentUserId={currentUserId} />
          </div>
          <div>
            <AttachmentList taskId={task.id} currentUserId={currentUserId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
