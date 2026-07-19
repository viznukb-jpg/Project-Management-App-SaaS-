'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { ProjectFormModal } from './ProjectFormModal';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { Project, useUpdateProject, useDeleteProject } from '../hooks';
import { UpdateProjectInput } from '../schemas';
import { toast } from 'sonner';
import { useActiveWorkspaceRole } from '@/features/workspaces/hooks';

export function ProjectDetailHeader({ project }: { project: Project }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const updateMutation = useUpdateProject(project.workspaceId);
  const deleteMutation = useDeleteProject(project.workspaceId);
  const role = useActiveWorkspaceRole();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const canEdit = isMounted && role !== 'VIEWER';
  const canDelete = isMounted && (role === 'OWNER' || role === 'ADMIN');

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
        router.push('/dashboard/projects');
      },
      onError: (err) => {
        toast.error(err.message);
      },
    });
  };

  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const isDescLong = project.description && project.description.length > 80;

  return (
    <>
      <header className="relative flex flex-col flex-none justify-center items-center p-6 pb-4 border-slate-200 border-b text-center">
        <div className="top-5 left-6 absolute">
          <Link href="/dashboard/projects">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-900 px-2"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex justify-center items-center gap-3">
          <h1 className="font-bold text-slate-900 text-2xl">{project.name}</h1>
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

        <div className="flex flex-col justify-center items-center mt-2 px-4 w-full max-w-2xl">
          <p
            className={`text-slate-500 w-full text-center ${
              !isDescExpanded && isDescLong
                ? 'truncate'
                : 'break-words whitespace-pre-wrap'
            }`}
          >
            {project.description}
          </p>
          {isDescLong && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="mt-2 font-medium text-blue-600 hover:text-blue-800 text-xs transition-colors"
            >
              {isDescExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        <div className="top-6 right-6 absolute flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="text-slate-600"
            >
              <Edit2 className="mr-2 w-4 h-4" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="hover:bg-red-50 border-transparent hover:border-red-200 text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 w-4 h-4" />
              Delete
            </Button>
          )}
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
