import { db } from '@/server/db';
import { workspaceMembers, projects, tasks } from '@/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { UnauthorizedError } from '@/shared/utils/errors';

export async function getWorkspaceStats(workspaceId: string, userId: string) {
  // 1. Verify user's role in this workspace
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (!member || (member.role !== 'ADMIN' && member.role !== 'OWNER')) {
    throw new UnauthorizedError('Forbidden');
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
    .where(eq(workspaceMembers.userId, userId));
  const activeWorkspacesCount = userWorkspaces.length;

  return {
    usersCount,
    projectsCount,
    tasksCount,
    activeWorkspacesCount,
  };
}
