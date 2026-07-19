import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { getProjects, createProject } from '@/server/services/project.service';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const workspaceId = req.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID required' },
        { status: 400 }
      );
    }

    const search = req.nextUrl.searchParams.get('search') || undefined;
    const cursor = req.nextUrl.searchParams.get('cursor') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);

    const data = await getProjects(
      workspaceId,
      session.user.id,
      search,
      cursor,
      limit
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { createProjectSchema } from '@/features/projects/schemas';

// (skip to POST method)
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = await createProject(
      parsed.data.workspaceId,
      parsed.data.name,
      parsed.data.description,
      session.user.id
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      return NextResponse.json(
        { error: 'Project name already exists in this workspace' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
