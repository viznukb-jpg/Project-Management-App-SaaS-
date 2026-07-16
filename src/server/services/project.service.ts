import { db } from '@/server/db';
import { projects, workspaceMembers } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getProjects(workspaceId: string, userId: string) {
  // Ensure user is part of the workspace
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });
  if (!member) throw new Error('Unauthorized');

  return await db.query.projects.findMany({
    where: eq(projects.workspaceId, workspaceId),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });
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
  description: string | undefined,
  userId: string
) {
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });
  // Only owners, admins, and members can create projects. Viewers cannot.
  if (!member || member.role === 'VIEWER') throw new Error('Unauthorized');

  const [project] = await db
    .insert(projects)
    .values({
      workspaceId,
      name,
      description,
    })
    .returning();
  return project;
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string;
    description?: string;
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
  // Only owners and admins can delete projects
  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error('Unauthorized to delete project');
  }

  await db.delete(projects).where(eq(projects.id, projectId));
  return true;
}
