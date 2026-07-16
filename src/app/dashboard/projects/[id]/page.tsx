import { getProject } from '@/server/services/project.service';
import { getTasks } from '@/server/services/task.service';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { KanbanBoard } from '@/features/tasks/components/KanbanBoard';
import { ProjectDetailHeader } from '@/features/projects/components/ProjectDetailHeader';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return notFound();

  const queryClient = new QueryClient();
  const { id } = await params;

  let project;
  try {
    project = await getProject(id, session.user.id);

    await queryClient.prefetchQuery({
      queryKey: ['tasks', id],
      queryFn: async () => {
        return await getTasks(id, session.user.id);
      },
    });
  } catch (_error) {
    return notFound();
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ProjectDetailHeader project={project} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex-1 min-h-0 overflow-hidden p-6 bg-slate-50/50">
          <KanbanBoard projectId={id} />
        </div>
      </HydrationBoundary>
    </div>
  );
}
