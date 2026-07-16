'use client';

import { useQuery } from '@tanstack/react-query';
import { useWorkspaceStore } from '@/shared/store/workspace';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { Button } from '@/shared/ui/Button';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { useEffect } from 'react';

export function WorkspaceSwitcher() {
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await fetch('/api/workspaces');
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      return res.json();
    },
  });

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspaceId) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId, setActiveWorkspaceId]);

  const activeWorkspace = workspaces?.find(
    (w: { id: string; name: string }) => w.id === activeWorkspaceId
  );

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className="w-[200px] justify-between text-slate-500"
      >
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center h-10 px-4 py-2 rounded-md border w-[180px] sm:w-[220px] justify-between truncate bg-white shadow-sm hover:bg-slate-50 border-slate-200 text-slate-700 font-medium text-sm outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
        <span className="truncate">
          {activeWorkspace?.name || 'Select Workspace'}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px] sm:w-[220px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
            Your Workspaces
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces?.map((workspace: { id: string; name: string }) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => setActiveWorkspaceId(workspace.id)}
              className="cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">{workspace.name}</span>
              {workspace.id === activeWorkspaceId && (
                <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link
              href="/dashboard"
              className="cursor-pointer text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-700 flex w-full"
            />
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
