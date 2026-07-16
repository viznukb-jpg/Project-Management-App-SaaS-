import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { z } from 'zod';

const updateNameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = updateNameSchema.parse(body);

    await db
      .update(users)
      .set({ name, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, name });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: (error as z.ZodError).errors[0].message },
        { status: 400 }
      );
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Since onDelete: 'cascade' is set on session and account in schema,
    // and potentially other tables, deleting the user directly from DB
    await db.delete(users).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
