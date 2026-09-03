import type { User, Project, Task } from '../types';

export const initialUser: User = {
  id: 'usr_1',
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
};

export const initialProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Backend API Development',
    description: 'Express + Prisma + JWT Authentication service',
    ownerId: 'usr_1',
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'proj_2',
    name: 'Frontend Portal',
    description: 'React + TypeScript task manager dashboard',
    ownerId: 'usr_1',
    createdAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'proj_3',
    name: 'DevOps & Infrastructure',
    description: 'CI/CD pipeline and Docker setup',
    ownerId: 'usr_1',
    createdAt: '2026-08-03T11:00:00.000Z',
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task_1',
    title: 'Implement JWT refresh token rotation',
    description: 'Store hashed refresh tokens in Prisma DB and invalidate old ones on refresh request.',
    status: 'IN_PROGRESS',
    dueDate: '2026-08-10',
    projectId: 'proj_1',
    createdAt: '2026-08-04T08:30:00.000Z',
  },
  {
    id: 'task_2',
    title: 'Create Zod input validation schemas',
    description: 'Validate req.body, req.params, and req.query for all project and task endpoints.',
    status: 'DONE',
    dueDate: '2026-08-03',
    projectId: 'proj_1',
    createdAt: '2026-08-01T14:20:00.000Z',
  },
  {
    id: 'task_3',
    title: 'Set up Centralized Error Handler',
    description: 'Catch typed AppErrors (NotFoundError, ValidationError) and format uniform JSON responses.',
    status: 'DONE',
    dueDate: '2026-08-02',
    projectId: 'proj_1',
    createdAt: '2026-08-01T15:00:00.000Z',
  },
  {
    id: 'task_4',
    title: 'Design responsive task dashboard',
    description: 'Build React UI with sidebar project filtering, search bar, and task cards.',
    status: 'IN_PROGRESS',
    dueDate: '2026-08-12',
    projectId: 'proj_2',
    createdAt: '2026-08-04T11:00:00.000Z',
  },
  {
    id: 'task_5',
    title: 'Integrate Tailwind CSS v4',
    description: 'Configure @tailwindcss/vite plugin for fast utility styling.',
    status: 'DONE',
    dueDate: '2026-08-05',
    projectId: 'proj_2',
    createdAt: '2026-08-05T09:00:00.000Z',
  },
  {
    id: 'task_6',
    title: 'Configure GitHub Actions CI workflow',
    description: 'Automate linting, TypeScript build, and integration tests on push.',
    status: 'TODO',
    dueDate: '2026-08-20',
    projectId: 'proj_3',
    createdAt: '2026-08-05T10:00:00.000Z',
  },
];
