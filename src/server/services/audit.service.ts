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
