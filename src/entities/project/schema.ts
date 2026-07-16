import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from '../workspace/schema';
import { tasks } from '../task/schema';

export const projectStatusEnum = pgEnum('project_status', [
  'ACTIVE',
  'ARCHIVED',
  'COMPLETED',
]);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    status: projectStatusEnum('status').default('ACTIVE').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [unique('project_name_ws_uq').on(t.workspaceId, t.name)]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  tasks: many(tasks),
}));
