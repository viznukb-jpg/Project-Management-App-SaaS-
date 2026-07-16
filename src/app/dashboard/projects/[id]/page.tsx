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
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex-none p-6 pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
        <p className="text-slate-500 mt-1">{project.description}</p>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <KanbanBoard projectId={id} />
        </div>
      </HydrationBoundary>
    </div>
  );
}
