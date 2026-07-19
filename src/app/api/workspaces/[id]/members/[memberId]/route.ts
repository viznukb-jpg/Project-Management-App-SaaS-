import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import {
  updateMemberRole,
  removeMember,
} from '@/server/services/member.service';

export const PATCH = withRouteHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
  ) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body.role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    const updated = await updateMemberRole(
      (await params).id,
      (await params).memberId,
      body.role,
      session.user.id
    );
    return NextResponse.json(updated);
  }
);

export const DELETE = withRouteHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
  ) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await removeMember(
      (await params).id,
      (await params).memberId,
      session.user.id
    );
    return NextResponse.json({ success: true });
  }
);
