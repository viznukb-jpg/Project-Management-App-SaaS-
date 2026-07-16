import { db } from '@/server/db';
import { tasks, projects, workspaceMembers } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { createAuditLog } from './audit.service';

async function checkProjectAccess(
  projectId: string,
  userId: string,
  requireEdit = false
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
  if (!member) throw new Error('Unauthorized');
  if (requireEdit && member.role === 'VIEWER') {
    throw new Error('Unauthorized to edit tasks');
  }

  return project;
}

export async function getTasks(projectId: string, userId: string) {
  await checkProjectAccess(projectId, userId);

  return await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
    orderBy: (tasks, { asc }) => [asc(tasks.position)],
  });
}

export async function createTask(
  projectId: string,
  userId: string,
  data: {
    title: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId?: string;
  }
) {
  const project = await checkProjectAccess(projectId, userId, true);

  const existingTasks = await db.query.tasks.findMany({
    where: and(eq(tasks.projectId, projectId), eq(tasks.status, 'TODO')),
  });
  const maxPosition = existingTasks.reduce(
    (max, t) => Math.max(max, t.position),
    0
  );

  const [task] = await db
    .insert(tasks)
    .values({
      projectId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      assigneeId: data.assigneeId,
      status: 'TODO',
      position: maxPosition + 1024,
    })
    .returning();

  await createAuditLog({
    workspaceId: project.workspaceId,
    userId,
    action: 'CREATE_TASK',
    metadata: { taskId: task.id, title: task.title },
  });

  return task;
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId?: string;
    position?: number;
  }
) {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });
  if (!task) throw new Error('Task not found');

  const project = await checkProjectAccess(task.projectId, userId, true);

  const [updated] = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  await createAuditLog({
    workspaceId: project.workspaceId,
    userId,
    action: 'UPDATE_TASK',
    metadata: { taskId: task.id, changes: data },
  });

  return updated;
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });
  if (!task) throw new Error('Task not found');

  const project = await checkProjectAccess(task.projectId, userId, true);

  await db.delete(tasks).where(eq(tasks.id, taskId));

  await createAuditLog({
    workspaceId: project.workspaceId,
    userId,
    action: 'DELETE_TASK',
    metadata: { taskId },
  });

  return true;
}
