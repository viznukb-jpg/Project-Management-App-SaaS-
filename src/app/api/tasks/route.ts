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

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body.projectId || !body.title) {
      return NextResponse.json(
        { error: 'Project ID and title required' },
        { status: 400 }
      );
    }

    const data = await createTask(body.projectId, session.user.id, {
      title: body.title,
      description: body.description,
      priority: body.priority,
      assigneeId: body.assigneeId,
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
