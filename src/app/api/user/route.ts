import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { updateNameSchema } from '@/features/profile';
import { updateUserName, deleteUser } from '@/server/services/user.service';
import { withRouteHandler } from '@/shared/utils/handleRoute';

export const PATCH = withRouteHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name } = updateNameSchema.parse(body);

  await updateUserName(session.user.id, name);

  return NextResponse.json({ success: true, name });
});

export const DELETE = withRouteHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await deleteUser(session.user.id);

  return NextResponse.json({ success: true });
});
