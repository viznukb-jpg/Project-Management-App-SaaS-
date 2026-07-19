import { db } from '@/server/db';
import { tasks, projects, workspaceMembers } from '@/server/db/schema';
import { eq, and, or, ilike, gt } from 'drizzle-orm';
import { createAuditLog } from './audit.service';
import { enqueueNotification } from './notification.service';

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

export async function getTasks(
  projectId: string,
  userId: string,
  search = '',
  cursor?: string | null,
  limit = 20
) {
  await checkProjectAccess(projectId, userId);

  const conditions = [eq(tasks.projectId, projectId)];

  if (search) {
    conditions.push(
      or(
        ilike(tasks.title, `%${search}%`),
        ilike(tasks.description, `%${search}%`)
      )!
    );
  }

  if (cursor) {
    conditions.push(gt(tasks.position, Number(cursor)));
  }

  const data = await db.query.tasks.findMany({
    where: and(...conditions),
    orderBy: (tasks, { asc }) => [asc(tasks.position)],
    limit: limit + 1,
  });

  let nextCursor: string | null = null;
  if (data.length > limit) {
    const nextItem = data.pop();
    if (nextItem) {
      nextCursor = nextItem.position.toString();
    }
  }

  return { data, nextCursor };
}

export async function createTask(
  projectId: string,
  userId: string,
  data: {
    title: string;
    description?: string | null;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId?: string | null;
    status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
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
      status: data.status || 'TODO',
      position: maxPosition + 1024,
    })
    .returning();

  await createAuditLog({
    workspaceId: project.workspaceId,
    userId,
    action: 'CREATE_TASK',
    metadata: { taskId: task.id, title: task.title },
  });

  if (data.assigneeId && data.assigneeId !== userId) {
    await enqueueNotification(
      data.assigneeId,
      'TASK_ASSIGNED',
      `You have been assigned a new task: ${task.title}`
    );
  }

  return task;
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId?: string | null;
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

  if (
    data.assigneeId &&
    data.assigneeId !== task.assigneeId &&
    data.assigneeId !== userId
  ) {
    await enqueueNotification(
      data.assigneeId,
      'TASK_ASSIGNED',
      `You have been assigned to task: ${updated.title}`
    );
  }

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
