import { getProject } from '@/server/services/project.service';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { KanbanBoard } from '@/features/tasks';
import { ProjectDetailHeader } from '@/features/projects';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return notFound();

  const { id } = await params;

  let project;
  try {
    project = await getProject(id, session.user.id);
  } catch (_error) {
    return notFound();
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProjectDetailHeader project={project as any} />

      <div className="flex-1 min-h-[600px] p-6 bg-slate-50/50 flex flex-col">
        <KanbanBoard projectId={id} />
      </div>
    </div>
  );
}
