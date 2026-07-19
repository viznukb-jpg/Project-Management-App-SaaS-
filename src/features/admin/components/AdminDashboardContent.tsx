'use client';

import { useSyncExternalStore } from 'react';
import { useWorkspaceStore } from '@/shared/store/workspace';
import Link from 'next/link';
import { StatsGrid, useWorkspaceStats } from '@/features/admin';

const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

export function AdminDashboardContent() {
  const isClient = useIsClient();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { isLoading, error } = useWorkspaceStats(activeWorkspaceId ?? null);

  if (!isClient) return null;

  if (!activeWorkspaceId) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Please select a workspace first.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        Loading statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 max-w-md text-center">
          <p className="font-semibold mb-2">Access Denied</p>
          <p className="text-sm mb-4">{error.message}</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <StatsGrid workspaceId={activeWorkspaceId} />;
}
