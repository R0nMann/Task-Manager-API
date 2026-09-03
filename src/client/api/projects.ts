import { api } from './client';
import type { Project } from '../types';

export interface ProjectInput {
  name: string;
  description?: string;
}

export const listProjects = () => api.get<Project[]>('/projects');

export const createProject = (input: ProjectInput) => api.post<Project>('/projects', input);

export const updateProject = (id: string, input: Partial<ProjectInput>) =>
  api.patch<Project>(`/projects/${id}`, input);

export const deleteProject = (id: string) => api.del(`/projects/${id}`);
