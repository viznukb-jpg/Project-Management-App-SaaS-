'use client';

import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/shared/store/workspace';
import {
  useWorkspaces,
  useActiveWorkspaceRole,
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
} from '../hooks';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';

export function WorkspaceSettingsForm() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const [name, setName] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isDeleteWorkspaceModalOpen, setIsDeleteWorkspaceModalOpen] =
    useState(false);

  const { data: workspaces } = useWorkspaces();
  const role = useActiveWorkspaceRole();
  const canManageWorkspace = role === 'OWNER' || role === 'ADMIN';
  const isOwner = role === 'OWNER';

  const activeWorkspace = workspaces?.find((w) => w.id === activeWorkspaceId);

  const [name, setName] = useState(activeWorkspace?.name || '');
  // Note: name state is initialized from activeWorkspace; component will reset when activeWorkspace changes via key prop on root.

  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();

  if (!canManageWorkspace) {
    return null;
  }

  return (
    <div className="flex-1 w-full space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
          <Input
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="E.g., Another Team"
            className="flex-1"
          />
          <Button
            onClick={() => {
              createMutation.mutate(newWorkspaceName, {
                onSuccess: () => setNewWorkspaceName(''),
              });
            }}
            disabled={!newWorkspaceName || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>
          <Button
            onClick={() => updateMutation.mutate(name)}
            disabled={
              updateMutation.isPending ||
              !name ||
              name === activeWorkspace?.name
            }
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {isOwner && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Once you delete a workspace, there is no going back. Please be
              certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteWorkspaceModalOpen(true)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Workspace'}
            </Button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteWorkspaceModalOpen}
        onClose={() => setIsDeleteWorkspaceModalOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(undefined, {
            onSuccess: () => setIsDeleteWorkspaceModalOpen(false),
          });
        }}
        title="Delete Workspace"
        description="Are you absolutely sure you want to delete this workspace? This action cannot be undone."
        confirmText="Delete Workspace"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
