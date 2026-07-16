import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { workspaceMembers } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuditLogs } from '@/server/services/audit.service';
import { headers } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workspaceId } = await params;

    // Verify membership
    const member = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const logs = await getAuditLogs(workspaceId);
    return NextResponse.json(logs);
  } catch (error: unknown) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
