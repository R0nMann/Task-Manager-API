import { z } from 'zod';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../utils/pagination';

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

const taskFields = {
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional(),
  status: taskStatusSchema,
  dueDate: z.coerce.date().optional(),
  projectId: z.cuid2('Invalid project id'),
};

export const createTaskSchema = z.object(taskFields).extend({
  status: taskStatusSchema.default('TODO'),
});

export const updateTaskSchema = z
  .object(taskFields)
  .omit({ projectId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

export const taskIdSchema = z.object({
  id: z.cuid2('Invalid task id'),
});

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  projectId: z.cuid2().optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  sortBy: z.enum(['createdAt', 'dueDate', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
