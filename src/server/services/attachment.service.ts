import { UnauthorizedError, NotFoundError } from '@/shared/utils/errors';
import { db } from '@/server/db';
import { taskAttachments, tasks, workspaceMembers } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function checkTaskAccess(taskId: string, userId: string) {
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

export async function getAttachments(taskId: string, userId: string) {
  await checkTaskAccess(taskId, userId);

  return await db.query.taskAttachments.findMany({
    where: eq(taskAttachments.taskId, taskId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: (attachments, { desc }) => [desc(attachments.createdAt)],
  });
}

export async function createAttachment(
  taskId: string,
  userId: string,
  data: { fileName: string; fileUrl: string; fileSize?: number }
) {
  const { member } = await checkTaskAccess(taskId, userId);

  if (member.role === 'VIEWER') {
    throw new UnauthorizedError();
  }

  const [attachment] = await db
    .insert(taskAttachments)
    .values({
      taskId,
      userId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
    })
    .returning();

  return attachment;
}

export async function deleteAttachment(attachmentId: string, userId: string) {
  const attachment = await db.query.taskAttachments.findFirst({
    where: eq(taskAttachments.id, attachmentId),
  });
  if (!attachment) throw new NotFoundError('Attachment not found');

  const { member } = await checkTaskAccess(attachment.taskId, userId);

  if (
    attachment.userId !== userId &&
    member.role !== 'OWNER' &&
    member.role !== 'ADMIN'
  ) {
    throw new UnauthorizedError();
  }

  await db.delete(taskAttachments).where(eq(taskAttachments.id, attachmentId));
  return true;
}

export async function getAttachment(attachmentId: string, userId: string) {
  const attachment = await db.query.taskAttachments.findFirst({
    where: eq(taskAttachments.id, attachmentId),
  });
  if (!attachment) throw new NotFoundError('Attachment not found');

  await checkTaskAccess(attachment.taskId, userId);
  return attachment;
}
