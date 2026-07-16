import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import {
  getUserWorkspaces,
  createWorkspace,
} from '@/server/services/workspace.service';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaces = await getUserWorkspaces(session.user.id);
    return NextResponse.json(workspaces);
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    try {
      const workspace = await createWorkspace(session.user.id, name);
      return NextResponse.json(workspace);
    } catch (dbError: unknown) {
      if (
        dbError &&
        typeof dbError === 'object' &&
        'code' in dbError &&
        dbError.code === '23505'
      ) {
        return NextResponse.json(
          { error: 'Workspace name already exists' },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
