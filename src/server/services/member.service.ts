import { db } from '@/server/db';
import { workspaceMembers, users } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { createAuditLog } from './audit.service';

export async function getWorkspaceMembers(workspaceId: string) {
  const members = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.workspaceId, workspaceId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return members;
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  inviterId: string,
  role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER'
) {
  // Check if inviter is OWNER or ADMIN
  const inviter = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, inviterId)
    ),
  });

  if (!inviter || (inviter.role !== 'OWNER' && inviter.role !== 'ADMIN')) {
    throw new Error('Unauthorized to invite members');
  }

  // Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error('User not found. They must register first.');
  }

  // Check if already a member
  const existingMember = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, user.id)
    ),
  });

  if (existingMember) {
    throw new Error('User is already a member of this workspace');
  }

  // Add member
  const [newMember] = await db
    .insert(workspaceMembers)
    .values({
      workspaceId,
      userId: user.id,
      role,
    })
    .returning();

  await createAuditLog({
    workspaceId,
    userId: inviterId,
    action: `Invited user ${user.name || user.email} to workspace as ${role}`,
    metadata: { newMemberId: newMember.id, role },
  });

  return newMember;
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  newRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER',
  updaterId: string
) {
  // Check updater role
  const updater = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, updaterId)
    ),
  });

  if (!updater || updater.role !== 'OWNER') {
    throw new Error('Only the owner can update roles');
  }

  const [updatedMember] = await db
    .update(workspaceMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.id, memberId)
      )
    )
    .returning();

  await createAuditLog({
    workspaceId,
    userId: updaterId,
    action: `Updated a member's role to ${newRole}`,
    metadata: { memberId, newRole },
  });

  return updatedMember;
}

export async function removeMember(
  workspaceId: string,
  memberId: string,
  removerId: string
) {
  const remover = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, removerId)
    ),
  });

  if (!remover || (remover.role !== 'OWNER' && remover.role !== 'ADMIN')) {
    throw new Error('Unauthorized to remove members');
  }

  await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.id, memberId)
      )
    );

  await createAuditLog({
    workspaceId,
    userId: removerId,
    action: `Removed a member from the workspace`,
    metadata: { memberId },
  });
}
