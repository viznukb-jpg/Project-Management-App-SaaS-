import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { db } from '@/server/db';
import { workspaceMembers, projects, tasks } from '@/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workspaceId } = await params;

    // 1. Verify user's role in this workspace
    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!member || (member.role !== 'ADMIN' && member.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Query statistics
    // Users count in the workspace
    const membersList = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));
    const usersCount = membersList.length;

    // Projects count in the workspace
    const projectsList = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));
    const projectsCount = projectsList.length;

    // Tasks count in the workspace's projects
    let tasksCount = 0;
    if (projectsList.length > 0) {
      const projectIds = projectsList.map((p) => p.id);
      const tasksList = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(inArray(tasks.projectId, projectIds));
      tasksCount = tasksList.length;
    }

    // Active workspaces (total workspaces the user belongs to)
    const userWorkspaces = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, session.user.id));
    const activeWorkspacesCount = userWorkspaces.length;

    return NextResponse.json({
      usersCount,
      projectsCount,
      tasksCount,
      activeWorkspacesCount,
    });
  } catch (error: unknown) {
    console.error('Failed to fetch workspace stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
