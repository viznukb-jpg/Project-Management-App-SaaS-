'use client';

import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/shared/store/workspace';
import Link from 'next/link';
import { StatsGrid, useWorkspaceStats } from '@/features/admin';

export default function AdminDashboardPage() {
  const { activeWorkspaceId } = useWorkspaceStore();

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

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 sm:p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Overview of your workspace statistics.
        </p>
      </div>

      <StatsGrid workspaceId={activeWorkspaceId} />
    </div>
  );
}
