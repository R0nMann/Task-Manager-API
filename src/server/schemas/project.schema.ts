import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(100),
  description: z.string().trim().max(500).optional(),
});

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const projectIdSchema = z.object({
  id: z.cuid2('Invalid project id'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;