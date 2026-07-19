import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { updateTask, deleteTask } from '@/server/services/task.service';

import { updateTaskSchema } from '@/features/tasks';

export const PATCH = withRouteHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = await updateTask(
      (await params).id,
      session.user.id,
      parsed.data
    );
    return NextResponse.json(data);
  }
);

export const DELETE = withRouteHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await deleteTask((await params).id, session.user.id);
    return NextResponse.json({ success: true });
  }
);
