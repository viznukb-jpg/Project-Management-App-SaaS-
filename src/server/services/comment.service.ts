import { UnauthorizedError, NotFoundError } from '@/shared/utils/errors';
import { db } from '@/server/db';
import { comments, tasks, workspaceMembers } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

async function checkTaskAccess(taskId: string, userId: string) {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      project: true,
    },
  });
  if (!task) throw new NotFoundError('Task not found');

  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, task.project.workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });
  if (!member) throw new UnauthorizedError();

  return { task, member };
}

export async function getComments(taskId: string, userId: string) {
  await checkTaskAccess(taskId, userId);

  return await db.query.comments.findMany({
    where: eq(comments.taskId, taskId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (comments, { asc }) => [asc(comments.createdAt)],
  });
}

export async function createComment(
  taskId: string,
  userId: string,
  content: string
) {
  const { member } = await checkTaskAccess(taskId, userId);

  if (member.role === 'VIEWER') {
    throw new UnauthorizedError();
  }

  const [comment] = await db
    .insert(comments)
    .values({
      taskId,
      userId,
      content,
    })
    .returning();

  return comment;
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });
  if (!comment) throw new NotFoundError('Comment not found');

  // Can only delete own comment (or if ADMIN/OWNER of workspace)
  const { member } = await checkTaskAccess(comment.taskId, userId);

  if (
    comment.userId !== userId &&
    member.role !== 'OWNER' &&
    member.role !== 'ADMIN'
  ) {
    throw new UnauthorizedError();
  }

  await db.delete(comments).where(eq(comments.id, commentId));
  return true;
}
