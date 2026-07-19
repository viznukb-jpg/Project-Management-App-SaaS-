import { UnauthorizedError, NotFoundError } from '@/shared/utils/errors';
import { db } from '@/server/db';
import { workspaces, workspaceMembers } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { createAuditLog } from './audit.service';

export async function getUserWorkspaces(userId: string) {
  // Get workspaces where the user is a member
  const members = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, userId),
    with: {
      workspace: true,
    },
  });

  return members.map((m) => ({ ...m.workspace, role: m.role }));
}

export async function createWorkspace(userId: string, name: string) {
  const result = await db.transaction(async (tx) => {
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

  await createAuditLog({
    workspaceId: result.id,
    userId,
    action: `Created workspace "${name}"`,
  });

  return result;
}

export async function updateWorkspace(
  workspaceId: string,
  name: string,
  userId: string
) {
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    throw new UnauthorizedError();
  }

  const [updated] = await db
    .update(workspaces)
    .set({ name, updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId))
    .returning();

  await createAuditLog({
    workspaceId,
    userId,
    action: `Updated workspace name to "${name}"`,
  });

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
    throw new UnauthorizedError('Only the owner can delete the workspace');
  }

  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  return true;
}

export async function leaveWorkspace(workspaceId: string, userId: string) {
  const member = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (!member) {
    throw new NotFoundError('You are not a member of this workspace');
  }

  if (member.role === 'OWNER') {
    throw new UnauthorizedError(
      'Owner cannot leave the workspace. Delete it instead or transfer ownership.'
    );
  }

  await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    );

  await createAuditLog({
    workspaceId,
    userId,
    action: `Left the workspace`,
  });

  return true;
}
