import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import {
  getUserWorkspaces,
  createWorkspace,
} from '@/server/services/workspace.service';

export const GET = withRouteHandler(async (_req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaces = await getUserWorkspaces(session.user.id);
  return NextResponse.json(workspaces);
});

export const POST = withRouteHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const workspace = await createWorkspace(session.user.id, name);
  return NextResponse.json(workspace);
});
