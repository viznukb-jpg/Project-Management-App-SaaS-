'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import { Edit2, Trash2 } from 'lucide-react';
import { ProjectFormModal } from './ProjectFormModal';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { Project, useUpdateProject, useDeleteProject } from '../hooks';
import { UpdateProjectInput } from '../schemas';
import { toast } from 'sonner';

export function ProjectDetailHeader({ project }: { project: Project }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const updateMutation = useUpdateProject(project.workspaceId);
  const deleteMutation = useDeleteProject(project.workspaceId);

  const handleUpdate = (data: UpdateProjectInput) => {
    updateMutation.mutate(
      { id: project.id, ...data },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          toast.success('Project updated successfully');
        },
        onError: (err) => {
          toast.error(err.message);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(project.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        toast.success('Project deleted successfully');
        router.push('/dashboard');
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <>
      <header className="flex-none p-6 pb-4 border-b border-slate-200 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {project.name}
            </h1>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                project.status === 'ACTIVE'
                  ? 'bg-blue-100 text-blue-700'
                  : project.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-200 text-slate-700'
              }`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-slate-500 mt-1">{project.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="text-slate-600"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent hover:border-red-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </header>

      <ProjectFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={project}
        isLoading={updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Are you absolutely sure you want to delete this project? All tasks, comments, and attachments will be permanently removed. This action cannot be undone."
        confirmText="Delete Project"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
