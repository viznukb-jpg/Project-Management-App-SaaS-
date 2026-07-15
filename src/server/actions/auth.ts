'use server';

import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { registerSchema, RegisterInput } from '@/features/auth/schemas';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

export async function registerUser(input: RegisterInput) {
  try {
    const validatedData = registerSchema.parse(input);

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      return { error: 'User with this email already exists' };
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    await db.insert(users).values({
      id: uuidv4(),
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong during registration' };
  }
}
