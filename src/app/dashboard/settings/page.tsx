'use client';

import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/shared/store/workspace';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { toast } from 'sonner';

export default function WorkspaceSettingsPage() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  // Fetch workspaces to find the active one
  const { data: workspaces } = useQuery({
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

  const updateMutation = useMutation({
    mutationFn: async (newName: string) => {
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

  if (!activeWorkspaceId) {
    return <div className="p-8">Please select a workspace first.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        Workspace Settings
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
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
        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER')
          }
          className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </select>
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
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {members?.map(
                (member: {
                  id: string;
                  role: string;
                  user: { name: string; email: string };
                }) => (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {member.user.name}
                      </div>
                      <div className="text-slate-500">{member.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.role !== 'OWNER' && (
                        <Button
                          variant="ghost"
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
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
