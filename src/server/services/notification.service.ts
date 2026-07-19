import { UnauthorizedError, NotFoundError } from '@/shared/utils/errors';
import { notificationQueue } from '../queue';
import { db } from '@/server/db';
import { notifications } from '@/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function enqueueNotification(
  userId: string,
  type: string,
  message: string
) {
  await notificationQueue.add(type, { userId, type, message });
}

export async function getUnreadNotifications(userId: string) {
  return await db.query.notifications.findMany({
    where: and(eq(notifications.userId, userId), eq(notifications.read, false)),
    orderBy: [desc(notifications.createdAt)],
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  const notif = await db.query.notifications.findFirst({
    where: eq(notifications.id, notificationId),
  });
  if (!notif || notif.userId !== userId) throw new UnauthorizedError();

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
  return true;
}
