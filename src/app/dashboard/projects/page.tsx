import { ProjectList } from '@/features/projects/components/ProjectList';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { cookies, headers } from 'next/headers';
import { auth } from '@/server/auth';
import { getProjects } from '@/server/services/project.service';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get('activeWorkspaceId')?.value;
  const resolvedSearchParams = await searchParams;

  const queryClient = new QueryClient();

  if (activeWorkspaceId) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session) {
      const search = resolvedSearchParams.search || '';
      const page = parseInt(resolvedSearchParams.page || '1', 10);
      const limit = parseInt(resolvedSearchParams.limit || '10', 10);

      await queryClient.prefetchQuery({
        queryKey: ['projects', activeWorkspaceId, search, page, limit],
        queryFn: async () => {
          return await getProjects(
            activeWorkspaceId,
            session.user.id,
            search,
            page,
            limit
          );
        },
      });
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
            <p className="text-slate-500 mt-1">
              Manage and track your team's projects.
            </p>
          </div>
          <CreateProjectModal />
        </div>

        <ProjectList />
      </div>
    </HydrationBoundary>
  );
}
