'use client';

import { useWorkspaceStore } from '@/shared/store/workspace';
import { useWorkspaceActivity } from '../hooks';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Clock } from 'lucide-react';

export function ActivityList() {
  const { activeWorkspaceId } = useWorkspaceStore();

  const { data: logs, isLoading } = useWorkspaceActivity(
    activeWorkspaceId as string
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 p-4 border rounded-xl bg-white">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white border border-slate-200 rounded-xl">
        <Clock className="w-12 h-12 mb-4 text-slate-300" />
        <p className="text-lg font-medium">No activity yet</p>
        <p className="text-sm">Actions in this workspace will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="divide-y divide-slate-100">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-4 p-5 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0">
              {(log.user?.name || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 font-medium">
                <span className="font-semibold">
                  {log.user?.name || 'Someone'}
                </span>{' '}
                <span className="text-slate-600 font-normal">{log.action}</span>
              </p>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(log.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
