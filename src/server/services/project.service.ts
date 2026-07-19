import { db } from '@/server/db';
import { projects, workspaceMembers } from '@/server/db/schema';
import { eq, and, ilike, or, sql, lt } from 'drizzle-orm';
import { createAuditLog } from './audit.service';

export async function getProjects(
  workspaceId: string,
  userId: string,
  search?: string,
  cursor?: string | null,
  limit = 10
) {
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });
  if (!member) throw new Error('Unauthorized');

  const conditions = [eq(projects.workspaceId, workspaceId)];
  if (search) {
    conditions.push(
      or(
        ilike(projects.name, `%${search}%`),
        ilike(projects.description, `%${search}%`)
      )!
    );
  }

  if (cursor) {
    conditions.push(lt(projects.createdAt, new Date(cursor)));
  }

  const data = await db.query.projects.findMany({
    where: and(...conditions),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    limit: limit + 1, // Fetch one extra to determine if there's a next page
  });

  let nextCursor: string | null = null;
  if (data.length > limit) {
    const nextItem = data.pop(); // Remove the extra item
    if (nextItem) {
      nextCursor = nextItem.createdAt.toISOString();
    }
  }

  const countConditions = [eq(projects.workspaceId, workspaceId)];
  if (search) {
    countConditions.push(
      or(
        ilike(projects.name, `%${search}%`),
        ilike(projects.description, `%${search}%`)
      )!
    );
  }

  const [countResult] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(projects)
    .where(and(...countConditions));

  return { data, total: countResult.count, nextCursor };
}

export async function getProject(projectId: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) throw new Error('Project not found');

  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, project.workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });
  if (!member) throw new Error('Unauthorized');

  return project;
}

export async function createProject(
  workspaceId: string,
  name: string,
  description: string | undefined | null,
  userId: string
) {
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });
  if (!member || member.role === 'VIEWER') throw new Error('Unauthorized');

  const [project] = await db
    .insert(projects)
    .values({
      workspaceId,
      name,
      description,
    })
    .returning();

  await createAuditLog({
    workspaceId,
    userId,
    action: 'CREATE_PROJECT',
    metadata: { projectId: project.id, name: project.name },
  });

  return project;
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string;
    description?: string | null;
    status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  },
  userId: string
) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) throw new Error('Project not found');

  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, project.workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });
  if (!member || member.role === 'VIEWER') throw new Error('Unauthorized');

  const [updated] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  await createAuditLog({
    workspaceId: project.workspaceId,
    userId,
    action: 'UPDATE_PROJECT',
    metadata: { projectId: project.id, changes: data },
  });

  return updated;
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) throw new Error('Project not found');

  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, project.workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });
  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error('Unauthorized to delete project');
  }

  await db.delete(projects).where(eq(projects.id, projectId));

  await createAuditLog({
    workspaceId: project.workspaceId,
    userId,
    action: 'DELETE_PROJECT',
    metadata: { projectId },
  });

  return true;
}
