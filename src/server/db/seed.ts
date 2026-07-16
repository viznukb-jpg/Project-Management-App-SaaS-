import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding database...');

  // Clear existing data (optional, to allow multiple runs)
  console.log(
    'Clearing old data (so you do not need to drop the DB manually)...'
  );
  await db.delete(schema.notifications);
  await db.delete(schema.comments);
  await db.delete(schema.taskAttachments);
  await db.delete(schema.tasks);
  await db.delete(schema.projects);
  await db.delete(schema.workspaceMembers);
  await db.delete(schema.workspaces);
  await db.delete(schema.sessions);
  await db.delete(schema.accounts);
  await db.delete(schema.users);

  // 1. Create 5 Users with standard passwords
  console.log('Creating users (user1 to user5)...');
  // This is 'password123' hashed using Better Auth's default crypto (scrypt)
  const password =
    'b42bfa4d826184d04a3a05c302b09da4:2c766f1281f8536d36abf14f9e1d48b9520d3998bf8fb594eb0ca694b2a9c3f9239452d21ebdb876fcaf3d8a0ac842287309e175b8338bf9383360fd2a1d393e';

  const createdUsers = [];

  for (let i = 1; i <= 5; i++) {
    const userId = uuidv4();
    const [user] = await db
      .insert(schema.users)
      .values({
        id: userId,
        name: `user${i}`,
        email: `user${i}@example.com`,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await db.insert(schema.accounts).values({
      id: uuidv4(),
      accountId: user.id,
      providerId: 'credential',
      userId: user.id,
      password: password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    createdUsers.push(user);
  }

  const users = createdUsers;

  // 2. Create 3 Workspaces
  console.log('Creating workspaces...');
  const workspaces = await db
    .insert(schema.workspaces)
    .values([
      { name: 'Alpha Workspace', ownerId: users[0].id },
      { name: 'Beta Workspace', ownerId: users[1].id },
      { name: 'Gamma Workspace', ownerId: users[2].id },
    ])
    .returning();

  // 3. Add Users to Workspaces (Workspace Members)
  console.log('Adding workspace members...');
  await db.insert(schema.workspaceMembers).values([
    { workspaceId: workspaces[0].id, userId: users[0].id, role: 'OWNER' },
    { workspaceId: workspaces[0].id, userId: users[1].id, role: 'ADMIN' },
    { workspaceId: workspaces[0].id, userId: users[2].id, role: 'MEMBER' },

    { workspaceId: workspaces[1].id, userId: users[1].id, role: 'OWNER' },
    { workspaceId: workspaces[1].id, userId: users[3].id, role: 'MEMBER' },

    { workspaceId: workspaces[2].id, userId: users[2].id, role: 'OWNER' },
    { workspaceId: workspaces[2].id, userId: users[4].id, role: 'MEMBER' },
  ]);

  // 4. Create 10 Projects
  console.log('Creating projects...');
  const projects = await db
    .insert(schema.projects)
    .values(
      Array.from({ length: 10 }).map((_, i) => ({
        workspaceId: workspaces[i % 3].id,
        name: `Project ${i + 1}`,
        description: `Description for project ${i + 1}`,
        status: (i % 3 === 0 ? 'COMPLETED' : 'ACTIVE') as
          'ACTIVE' | 'ARCHIVED' | 'COMPLETED',
      }))
    )
    .returning();

  // 5. Create 50 Tasks
  console.log('Creating tasks...');
  const statuses: ('TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE')[] = [
    'TODO',
    'IN_PROGRESS',
    'REVIEW',
    'DONE',
  ];
  const priorities: ('LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')[] = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT',
  ];

  const tasks = await db
    .insert(schema.tasks)
    .values(
      Array.from({ length: 50 }).map((_, i) => ({
        projectId: projects[i % 10].id,
        title: `Task ${i + 1}`,
        description: `This is the description for task ${i + 1}`,
        status: statuses[i % 4],
        priority: priorities[i % 4],
        assigneeId: users[i % 5].id,
        position: i * 1000,
      }))
    )
    .returning();

  console.log('Database seeding completed successfully!');
  await client.end();
}

seed().catch((err) => {
  console.error('Failed to seed database', err);
  process.exit(1);
});
