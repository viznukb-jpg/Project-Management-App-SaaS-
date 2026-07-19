'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
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
import { ConfirmModal } from '@/shared/ui/ConfirmModal';
import { useActiveWorkspaceRole } from '@/features/workspaces';
import {
  useWorkspaceMembers,
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
} from '../hooks';

export function MemberManagement({ workspaceId }: { workspaceId: string }) {
  const roleContext = useActiveWorkspaceRole();
  const canManageMembers = roleContext === 'OWNER' || roleContext === 'ADMIN';
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const {
    data: membersRes,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWorkspaceMembers(workspaceId);

  const members = membersRes?.pages.flatMap((p) => p.data) || [];

  const inviteMutation = useInviteMember(workspaceId);
  const removeMutation = useRemoveMember(workspaceId);
  const updateRoleMutation = useUpdateMemberRole(workspaceId);

  return (
    <div className="space-y-8">
      {/* Invite Form */}
      {canManageMembers && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="User email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Select
            value={role}
            onValueChange={(val) =>
              setRole(val as 'ADMIN' | 'MEMBER' | 'VIEWER')
            }
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
            onClick={() => {
              inviteMutation.mutate({ email, role });
              setEmail('');
              toast.success('Member invited successfully');
            }}
            disabled={!email || inviteMutation.isPending}
          >
            {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
          </Button>
        </div>
      )}

      {/* Members List */}
      <div className="border border-slate-200 rounded-lg overflow-y-auto max-h-[420px]">
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
              {[...(members || [])]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .sort((a: any, b: any) =>
                  a.role === 'OWNER' ? -1 : b.role === 'OWNER' ? 1 : 0
                )
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {member.user.name}
                      </div>
                      <div className="text-slate-500">{member.user.email}</div>
                    </TableCell>
                    <TableCell>
                      {roleContext === 'OWNER' && member.role !== 'OWNER' ? (
                        <Select
                          value={member.role}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onValueChange={(val: any) =>
                            updateRoleMutation.mutate(
                              {
                                memberId: member.id,
                                newRole: val,
                              },
                              {
                                onSuccess: () => {
                                  toast.success('Role updated successfully');
                                },
                                onError: (error: Error) => {
                                  toast.error(error.message);
                                },
                              }
                            )
                          }
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">{member.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManageMembers && member.role !== 'OWNER' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setMemberToRemove(member.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More Members'}
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={() => {
          if (memberToRemove) {
            removeMutation.mutate(memberToRemove, {
              onSuccess: () => {
                setMemberToRemove(null);
                toast.success('Member removed');
              },
              onError: (error: Error) => {
                toast.error(error.message);
              },
            });
          }
        }}
        title="Remove Member"
        description="Are you sure you want to remove this member? They will lose access to this workspace."
        confirmText="Remove"
        isLoading={removeMutation.isPending}
      />
    </div>
  );
}
