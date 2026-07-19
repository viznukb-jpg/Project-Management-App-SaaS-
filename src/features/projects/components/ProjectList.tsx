'use client';

import { useWorkspaceStore } from '@/shared/store/workspace';
import Link from 'next/link';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useProjects } from '@/features/projects/hooks';
import { useState, useEffect } from 'react';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
};

export function ProjectList() {
  const { activeWorkspaceId } = useWorkspaceStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Sync state if URL changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search);
  }, [search]);

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProjects(activeWorkspaceId, search);

  const projects = data?.pages.flatMap((p) => p.data) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.delete('cursor'); // Reset pagination on search
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!isMounted || !activeWorkspaceId) {
    return (
      <div className="p-12 text-center border border-dashed rounded-lg bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          No Workspaces Found
        </h2>
        <p className="text-slate-500 mb-6">
          You don&apos;t have any workspaces yet, or none is selected.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-900/90 h-10 px-4 py-2"
        >
          Go to Dashboard to Create Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input
          placeholder="Search projects..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput('');
              const params = new URLSearchParams(searchParams);
              params.delete('search');
              params.set('page', '1');
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {isLoading ? (
        <div className="p-8 text-center animate-pulse text-slate-500">
          Loading projects...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          Error loading projects.
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed rounded-lg bg-slate-50/50">
          No projects found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[460px] content-start">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group flex flex-col h-[144px] p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-blue-200"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="font-semibold text-lg text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {project.name}
                  </h3>
                  <Badge
                    variant={
                      project.status === 'ACTIVE' ? 'default' : 'secondary'
                    }
                    className="text-[10px] shrink-0"
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 min-h-[40px]">
                  {project.description || 'No description provided.'}
                </p>
              </Link>
            ))}
          </div>

          {hasNextPage && (
            <div className="pt-6 flex justify-center border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More Projects'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
