import { db } from '@/server/db';
import { workspaces, workspaceMembers } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getUserWorkspaces(userId: string) {
  // Get workspaces where the user is a member
  const members = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, userId),
    with: {
      workspace: true,
    },
  });

  return members.map((m) => m.workspace);
}

export async function createWorkspace(userId: string, name: string) {
  return await db.transaction(async (tx) => {
    // 1. Create workspace
    const [workspace] = await tx
      .insert(workspaces)
      .values({
        name,
        ownerId: userId,
      })
      .returning();

    // 2. Add owner as member with OWNER role
    await tx.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: userId,
      role: 'OWNER',
    });

    return workspace;
  });
}

export async function updateWorkspace(
  workspaceId: string,
  name: string,
  userId: string
) {
  // Basic validation (must be owner/admin ideally, but keeping it simple for now)
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const [updated] = await db
    .update(workspaces)
    .set({ name, updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId))
    .returning();

  return updated;
}

export async function deleteWorkspace(workspaceId: string, userId: string) {
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (!member || member.role !== 'OWNER') {
    throw new Error('Only the owner can delete the workspace');
  }

  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  return true;
}
