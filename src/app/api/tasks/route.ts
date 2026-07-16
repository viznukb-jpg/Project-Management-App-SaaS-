import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { getTasks, createTask } from '@/server/services/task.service';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const projectId = req.nextUrl.searchParams.get('projectId');
    if (!projectId)
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );

    const data = await getTasks(projectId, session.user.id);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { createTaskSchema } from '@/features/tasks/schemas';

// (skip to POST method)
export async function POST(req: NextRequest) {
  try {
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
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
