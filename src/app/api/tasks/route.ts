import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { getTasks, createTask } from '@/server/services/task.service';

export const GET = withRouteHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get('projectId');
  if (!projectId)
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });

  const search = req.nextUrl.searchParams.get('search') || '';
  const cursor = req.nextUrl.searchParams.get('cursor') || undefined;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);

  const data = await getTasks(
    projectId,
    session.user.id,
    search,
    cursor,
    limit
  );
  return NextResponse.json(data);
});

import { createTaskSchema } from '@/features/tasks';

// (skip to POST method)
export const POST = withRouteHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = await createTask(parsed.data.projectId, session.user.id, {
    title: parsed.data.title,
    description: parsed.data.description,
    priority: parsed.data.priority,
    assigneeId: parsed.data.assigneeId,
    status: parsed.data.status,
  });
  return NextResponse.json(data);
});
