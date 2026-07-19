import { db } from '@/server/db';
import { users } from '@/entities/user';
import { eq } from 'drizzle-orm';

export const updateUserName = async (userId: string, name: string) => {
  await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, userId));
};

export const deleteUser = async (userId: string) => {
  await db.delete(users).where(eq(users.id, userId));
};
