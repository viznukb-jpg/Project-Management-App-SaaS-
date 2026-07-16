import { db } from '@/server/db';
import { auditLogs } from '@/server/db/schema';

export async function createAuditLog(data: {
  workspaceId: string;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    workspaceId: data.workspaceId,
    userId: data.userId,
    action: data.action,
    metadata: data.metadata || null,
  });
}

export async function getAuditLogs(workspaceId: string, limit = 50) {
  return await db.query.auditLogs.findMany({
    where: (logs, { eq }) => eq(logs.workspaceId, workspaceId),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
      },
    },
  });
}
