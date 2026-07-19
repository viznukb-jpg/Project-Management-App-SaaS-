import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import {
  getAttachments,
  createAttachment,
} from '@/server/services/attachment.service';

export const GET = withRouteHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId)
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

  const data = await getAttachments(taskId, session.user.id);
  return NextResponse.json(data);
});

export const POST = withRouteHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.taskId || !body.fileName || !body.fileUrl) {
    return NextResponse.json(
      { error: 'Task ID, fileName and fileUrl required' },
      { status: 400 }
    );
  }

  const data = await createAttachment(body.taskId, session.user.id, {
    fileName: body.fileName,
    fileUrl: body.fileUrl,
    fileSize: body.fileSize,
  });
  return NextResponse.json(data);
});
