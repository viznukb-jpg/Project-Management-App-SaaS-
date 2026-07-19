'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/shared/store/workspace';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof formSchema>;

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormValues) => void;
  initialData?: Partial<TaskFormValues> | null;
}) {
  const { activeWorkspaceId } = useWorkspaceStore();

  const { data: members } = useQuery({
    queryKey: ['workspaceMembers', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];
      const res = await fetch(
        `/api/workspaces/${activeWorkspaceId}/members?limit=1000`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!activeWorkspaceId && isOpen,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeId: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          description: initialData.description || '',
          status: initialData.status || 'TODO',
          priority: initialData.priority || 'MEDIUM',
          assigneeId: initialData.assigneeId || null,
        });
      } else {
        reset({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          assigneeId: null,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(val) =>
                setValue(
                  'status',
                  val as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={watch('assigneeId') || 'unassigned'}
              onValueChange={(val) =>
                setValue('assigneeId', val === 'unassigned' ? null : val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an assignee">
                  {(() => {
                    const assigneeId = watch('assigneeId');
                    if (!assigneeId || assigneeId === 'unassigned')
                      return 'Unassigned';

                    const selected = members?.find(
                      (m) => m.user.id === assigneeId
                    )?.user;
                    if (!selected) return assigneeId; // fallback while loading
                    return selected.name
                      ? `${selected.name} (${selected.email})`
                      : selected.email;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {members?.map((member: any) => (
                  <SelectItem key={member.user.id} value={member.user.id}>
                    {member.user.name
                      ? `${member.user.name} (${member.user.email})`
                      : member.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={watch('priority')}
              onValueChange={(val) =>
                setValue(
                  'priority',
                  val as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {initialData ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
