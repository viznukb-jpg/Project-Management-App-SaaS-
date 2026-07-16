import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  pgEnum,
  jsonb,
  integer,
  primaryKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---- ENUMS ----
export const roleEnum = pgEnum('role', ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
export const projectStatusEnum = pgEnum('project_status', [
  'ACTIVE',
  'ARCHIVED',
  'COMPLETED',
]);
export const taskStatusEnum = pgEnum('task_status', [
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'DONE',
]);
export const taskPriorityEnum = pgEnum('task_priority', [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]);

// ---- USERS (Better-Auth compatible) ----
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const verificationTokens = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

// ---- WORKSPACES ----
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  ownerId: text('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: roleEnum('role').default('MEMBER').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [unique('ws_member_uq').on(t.workspaceId, t.userId)]
);

// ---- PROJECTS ----
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: projectStatusEnum('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- TASKS ----
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('TODO').notNull(),
  priority: taskPriorityEnum('priority').default('MEDIUM').notNull(),
  assigneeId: text('assignee_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  position: integer('position').default(0).notNull(), // Required for Kanban Drag & Drop ordering
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- COMMENTS ----
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- NOTIFICATIONS ----
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // E.g., 'TASK_ASSIGNED', 'PROJECT_UPDATED'
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---- AUDIT LOGS ----
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    action: text('action').notNull(),
    metadata: jsonb('metadata'), // Extra payload about the action
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('audit_log_user_date_idx').on(t.userId, t.createdAt)]
);

// ---- TASK ATTACHMENTS (Bonus) ----
export const taskAttachments = pgTable('task_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---- RELATIONS ----
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  workspaceMembers: many(workspaceMembers),
  tasksAssigned: many(tasks),
  comments: many(comments),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  taskAttachments: many(taskAttachments),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  projects: many(projects),
  auditLogs: many(auditLogs),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceMembers.userId],
      references: [users.id],
    }),
  })
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  comments: many(comments),
  attachments: many(taskAttachments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [auditLogs.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const taskAttachmentsRelations = relations(
  taskAttachments,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskAttachments.taskId],
      references: [tasks.id],
    }),
    user: one(users, {
      fields: [taskAttachments.userId],
      references: [users.id],
    }),
  })
);
