'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/shared/store/workspace';
import {
  useWorkspaces,
  useActiveWorkspaceRole,
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
  useLeaveWorkspace,
} from '../hooks';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { ConfirmModal } from '@/shared/ui/ConfirmModal';

export function WorkspaceSettingsForm() {
  const { activeWorkspaceId } = useWorkspaceStore();

  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isDeleteWorkspaceModalOpen, setIsDeleteWorkspaceModalOpen] =
    useState(false);
  const [isLeaveWorkspaceModalOpen, setIsLeaveWorkspaceModalOpen] =
    useState(false);

  const { data: workspaces } = useWorkspaces();
  const role = useActiveWorkspaceRole();
  const canManageWorkspace = role === 'OWNER' || role === 'ADMIN';
  const isOwner = role === 'OWNER';

  const activeWorkspace = workspaces?.find((w) => w.id === activeWorkspaceId);

  const [name, setName] = useState(activeWorkspace?.name || '');

  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();
  const leaveMutation = useLeaveWorkspace();

  console.log('Rendering WorkspaceSettingsForm, role:', role);

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

      {canManageWorkspace && (
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
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
        {isOwner ? (
          <div>
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
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              If you leave this workspace, you will lose access until an admin
              invites you back.
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsLeaveWorkspaceModalOpen(true)}
              disabled={leaveMutation.isPending}
            >
              {leaveMutation.isPending ? 'Leaving...' : 'Leave Workspace'}
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

      <ConfirmModal
        isOpen={isLeaveWorkspaceModalOpen}
        onClose={() => setIsLeaveWorkspaceModalOpen(false)}
        onConfirm={() => {
          leaveMutation.mutate(undefined, {
            onSuccess: () => setIsLeaveWorkspaceModalOpen(false),
          });
        }}
        title="Leave Workspace"
        description="Are you sure you want to leave this workspace? You will need an invite to rejoin."
        confirmText="Leave Workspace"
        isLoading={leaveMutation.isPending}
      />
    </div>
  );
}
