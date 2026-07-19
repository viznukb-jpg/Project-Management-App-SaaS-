import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { getComments, createComment } from '@/server/services/comment.service';

export const GET = withRouteHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId)
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

  const data = await getComments(taskId, session.user.id);
  return NextResponse.json(data);
});

export const POST = withRouteHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.taskId || !body.content) {
    return NextResponse.json(
      { error: 'Task ID and content required' },
      { status: 400 }
    );
  }

  const data = await createComment(body.taskId, session.user.id, body.content);
  return NextResponse.json(data);
});
