import { z } from 'zod';

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    description: z.string().max(1000).optional().nullable(),
    workspaceId: z.string().min(1, 'Workspace ID is required'),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100).optional(),
    description: z.string().max(1000).optional().nullable(),
    status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
