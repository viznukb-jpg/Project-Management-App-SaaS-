import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import {
  getWorkspaceMembers,
  inviteMember,
} from '@/server/services/member.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cursor = req.nextUrl.searchParams.get('cursor') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);

    const members = await getWorkspaceMembers((await params).id, cursor, limit);
    return NextResponse.json(members);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
