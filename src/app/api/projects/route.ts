import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { getProjects, createProject } from '@/server/services/project.service';

export const GET = withRouteHandler(async (req: NextRequest) => {
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
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '12', 10);

  const data = await getProjects(
    workspaceId,
    session.user.id,
    search,
    cursor,
    limit
  );
  return NextResponse.json(data);
});

import { createProjectSchema } from '@/features/projects';
import { AppError } from '@/shared/utils/errors';

export const POST = withRouteHandler(async (req: NextRequest) => {
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

  try {
    const data = await createProject(
      parsed.data.workspaceId,
      parsed.data.name,
      parsed.data.description,
      session.user.id
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    // Unique constraint: project name already exists in workspace
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new AppError('Project name already exists in this workspace', 409);
    }
    throw error; // re-throw; withRouteHandler will produce a safe 500
  }
});
