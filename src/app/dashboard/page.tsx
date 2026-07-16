'use client';

import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/shared/store/workspace';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/Table';
import { Badge } from '@/shared/ui/Badge';

export default function DashboardPage() {
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await fetch('/api/workspaces');
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      return res.json();
    },
  });

  const activeWorkspace = workspaces?.find(
    (w: { id: string; name: string }) => w.id === activeWorkspaceId
  );

  useEffect(() => {
    if (activeWorkspace) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const createMutation = useMutation({
    mutationFn: async (wsName: string) => {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: wsName }),
      });
      if (!res.ok) throw new Error('Failed to create workspace');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setActiveWorkspaceId(data.id);
      setNewWorkspaceName('');
      toast.success('Workspace created and activated!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newName: string) => {
      if (!activeWorkspaceId) return;
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error('Failed to update workspace');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!activeWorkspaceId) return;
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete workspace');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setActiveWorkspaceId(''); // Clear active workspace
      toast.success('Workspace deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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
          You don't have any workspaces yet. Create one to get started.
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
    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard / Workspace
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your workspace settings and members.
        </p>
      </div>

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
            onClick={() => createMutation.mutate(newWorkspaceName)}
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
            onClick={() => {
              if (
                confirm(
                  'Are you absolutely sure you want to delete this workspace? This action cannot be undone.'
                )
              ) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Workspace'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <p className="text-sm text-slate-500 mb-6">
          Manage who has access to this workspace.
        </p>
        <MemberManagement workspaceId={activeWorkspaceId} />
      </div>
    </div>
  );
}

function MemberManagement({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');

  const { data: members, isLoading } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to invite');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspace-members', workspaceId],
      });
      toast.success('Member invited successfully');
      setEmail('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members/${memberId}`,
        {
          method: 'DELETE',
        }
      );
      if (!res.ok) throw new Error('Failed to remove member');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspace-members', workspaceId],
      });
      toast.success('Member removed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-8">
      {/* Invite Form */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="User email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Select
          value={role}
          onValueChange={(val) => setRole(val as 'ADMIN' | 'MEMBER' | 'VIEWER')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
            <SelectItem value="VIEWER">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => inviteMutation.mutate()}
          disabled={!email || inviteMutation.isPending}
        >
          {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
        </Button>
      </div>

      {/* Members List */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-slate-500 animate-pulse">
            Loading members...
          </div>
        ) : members?.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            No members found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map(
                (member: {
                  id: string;
                  role: string;
                  user: { name: string; email: string };
                }) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {member.user.name}
                      </div>
                      <div className="text-slate-500">{member.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {member.role !== 'OWNER' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (
                              confirm(
                                'Are you sure you want to remove this member?'
                              )
                            ) {
                              removeMutation.mutate(member.id);
                            }
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
