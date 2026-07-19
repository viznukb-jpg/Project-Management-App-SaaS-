import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { withRouteHandler } from '@/shared/utils/handleRoute';
import { getWorkspaceStats } from '@/server/services/stats.service';

export const GET = withRouteHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: workspaceId } = await params;
    const stats = await getWorkspaceStats(workspaceId, session.user.id);

    return NextResponse.json(stats);
  }
);
