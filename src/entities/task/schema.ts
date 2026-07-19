import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from '../project/schema';
import { users } from '../user/schema';
import { comments } from '../comment/schema';

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
