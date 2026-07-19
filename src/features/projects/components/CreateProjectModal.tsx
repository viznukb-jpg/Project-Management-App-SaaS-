'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, CreateProjectInput } from '../schemas';
import { useWorkspaceStore } from '@/shared/store/workspace';
import { useActiveWorkspaceRole } from '@/features/workspaces';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Label } from '@/shared/ui/Label';
import { toast } from 'sonner';

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const { activeWorkspaceId } = useWorkspaceStore();
  const role = useActiveWorkspaceRole();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<CreateProjectInput, 'workspaceId'>>({
    resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<CreateProjectInput, 'workspaceId'>) => {
      if (!activeWorkspaceId) throw new Error('No active workspace');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, workspaceId: activeWorkspaceId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create project');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', activeWorkspaceId],
      });
      toast.success('Project created successfully');
      setOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted || role === 'VIEWER') return null;

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Project</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            className="space-y-4 mt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="E.g., Marketing Campaign"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description..."
                className="min-h-[120px] resize-y"
                {...register('description')}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !activeWorkspaceId}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
