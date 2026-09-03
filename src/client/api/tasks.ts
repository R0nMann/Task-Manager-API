import { api } from './client';
import type { Task, TaskStatus } from '../types';

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
  projectId: string;
}

export interface TaskFilters {
  projectId?: string | null;
  status?: TaskStatus | 'ALL';
  search?: string;
}

/** Filtering and search run server-side — see listTasksQuerySchema. */
export const listTasks = async (filters: TaskFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.projectId) params.set('projectId', filters.projectId);
  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.search?.trim()) params.set('search', filters.search.trim());

  // No pagination controls in the UI yet, so request the server's max page.
  params.set('limit', '100');

  const envelope = await api.getPage<Task[]>(`/tasks?${params.toString()}`);
  return { tasks: envelope.data, meta: envelope.meta };
};

export const createTask = (input: TaskInput) => api.post<Task>('/tasks', input);

export const updateTask = (id: string, input: Partial<Omit<TaskInput, 'projectId'>>) =>
  api.patch<Task>(`/tasks/${id}`, input);

export const setTaskStatus = (id: string, status: TaskStatus) =>
  api.patch<Task>(`/tasks/${id}/status`, { status });

export const deleteTask = (id: string) => api.del(`/tasks/${id}`);
