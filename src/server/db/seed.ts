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

  // 1. Create 5 Users
  console.log('Creating users...');
  const users = await db
    .insert(schema.users)
    .values([
      {
        id: uuidv4(),
        name: 'Alice',
        email: 'alice@example.com',
        passwordHash: 'hashed_password',
      },
      {
        id: uuidv4(),
        name: 'Bob',
        email: 'bob@example.com',
        passwordHash: 'hashed_password',
      },
      {
        id: uuidv4(),
        name: 'Charlie',
        email: 'charlie@example.com',
        passwordHash: 'hashed_password',
      },
      {
        id: uuidv4(),
        name: 'David',
        email: 'david@example.com',
        passwordHash: 'hashed_password',
      },
      {
        id: uuidv4(),
        name: 'Eve',
        email: 'eve@example.com',
        passwordHash: 'hashed_password',
      },
    ])
    .returning();

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
        status: i % 3 === 0 ? 'COMPLETED' : 'ACTIVE',
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
        position: i % 5,
      }))
    )
    .returning();

  // 6. Create Comments
  console.log('Creating comments...');
  await db.insert(schema.comments).values(
    Array.from({ length: 20 }).map((_, i) => ({
      taskId: tasks[i % 50].id,
      userId: users[i % 5].id,
      content: `This is comment ${i + 1} on task.`,
    }))
  );

  // 7. Create Notifications
  console.log('Creating notifications...');
  await db.insert(schema.notifications).values(
    Array.from({ length: 15 }).map((_, i) => ({
      userId: users[i % 5].id,
      type: 'TASK_ASSIGNED',
      message: `You have been assigned to Task ${i + 1}`,
      read: i % 2 === 0,
    }))
  );

  console.log('Database seeding completed successfully!');
  await client.end();
}

seed().catch((err) => {
  console.error('Failed to seed database', err);
  process.exit(1);
});
