import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { CommentList } from '@/features/comments';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default async function TaskCommentsPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const { id: projectId, taskId } = await params;

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 mt-6 h-full flex flex-col">
      <div className="mb-6 flex-none">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Kanban
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex-none">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Comments for: {task.title}
        </h1>
        {task.description && (
          <p className="text-slate-600 bg-slate-50 p-4 rounded-md">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <CommentList taskId={task.id} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
