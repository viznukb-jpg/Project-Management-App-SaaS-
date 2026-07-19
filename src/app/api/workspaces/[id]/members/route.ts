import { withRouteHandler } from '@/shared/utils/handleRoute';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import {
  getWorkspaceMembers,
  inviteMember,
} from '@/server/services/member.service';

export const GET = withRouteHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cursor = req.nextUrl.searchParams.get('cursor') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);

    const members = await getWorkspaceMembers(
      (await params).id,
      session.user.id,
      cursor,
      limit
    );
    return NextResponse.json(members);
  }
);

export const POST = withRouteHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const member = await inviteMember(
      (await params).id,
      body.email,
      session.user.id,
      body.role
    );
    return NextResponse.json(member);
  }
);
