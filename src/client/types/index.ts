export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId?: string;
  createdAt: string;
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  projectId: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: FieldError[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
