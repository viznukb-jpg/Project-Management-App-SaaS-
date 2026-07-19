'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/shared/store/workspace';
import { useWorkspaces, useCreateWorkspace } from '@/features/workspaces';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { MemberManagement } from '@/features/members';
import { WorkspaceSettingsForm } from '@/features/workspaces';

export default function DashboardPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const { data: workspaces, isLoading } = useWorkspaces();
  const createMutation = useCreateWorkspace();

  const activeWorkspace = workspaces?.find(
    (w: { id: string; name: string }) => w.id === activeWorkspaceId
  );

  if (isLoading) {
    return (
      <div className="p-8 text-slate-500 animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  // If NO workspaces at all, show only the Create Workspace UI
  if (workspaces?.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 lg:p-12 mt-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Welcome to Your Dashboard!
        </h1>
        <p className="text-slate-500 mb-8">
          You don&apos;t have any workspaces yet. Create one to get started.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="E.g., My Awesome Company"
            className="flex-1"
          />
          <Button
            onClick={() => createMutation.mutate(newWorkspaceName)}
            disabled={!newWorkspaceName || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Workspace'}
          </Button>
        </div>
      </div>
    );
  }

  // If there are workspaces but none is active (edge case), force selection
  if (!activeWorkspaceId || !activeWorkspace) {
    return (
      <div className="p-8 text-center text-slate-500">
        Please select a workspace from the header menu.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard / Workspace
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your workspace settings and members.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <WorkspaceSettingsForm />

        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Members</h2>
          <p className="text-sm text-slate-500 mb-6">
            Manage who has access to this workspace.
          </p>
          <MemberManagement workspaceId={activeWorkspaceId} />
        </div>
      </div>
    </div>
  );
}
