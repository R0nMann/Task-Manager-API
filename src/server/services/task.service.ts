import { prisma } from '../config/prisma';
import NotFoundError from '../errors/NotFoundError';
import { toPrismaPagination } from '../utils/pagination';
import type { PaginationParams } from '../utils/pagination';
import type { TaskStatus } from '../../../prisma/generated/client.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from '../schemas/task.schema';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  projectId: true,
  createdAt: true,
} as const;

/** Tasks have no ownerId of their own — ownership is proven through the project. */
const ownedTask = (id: string, ownerId: string) => ({
  id,
  project: { ownerId },
});

/** Create has no task to check yet, so the target project is verified instead. */
const assertProjectOwned = async (projectId: string, ownerId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
    select: { id: true },
  });

  if (!project) throw new NotFoundError('Project not found');
};

export const listTasks = async (query: ListTasksQuery, ownerId: string) => {
  const { status, projectId, search, page, limit, sortBy, order } = query;
  const params: PaginationParams = { page, limit };

  const where = {
    project: { ownerId },
    ...(status && { status }),
    ...(projectId && { projectId }),
    ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
  };

  const [tasks, totalItems] = await Promise.all([
    prisma.task.findMany({
      where,
      select: taskSelect,
      orderBy: { [sortBy]: order },
      ...toPrismaPagination(params),
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, totalItems, params };
};

export const getTask = async (id: string, ownerId: string) => {
  const task = await prisma.task.findFirst({
    where: ownedTask(id, ownerId),
    select: taskSelect,
  });

  if (!task) throw new NotFoundError('Task not found');
  return task;
};

export const createTask = async (data: CreateTaskInput, ownerId: string) => {
  await assertProjectOwned(data.projectId, ownerId);

  return prisma.task.create({ data, select: taskSelect });
};

export const updateTask = async (id: string, data: UpdateTaskInput, ownerId: string) => {
  await getTask(id, ownerId);

  return prisma.task.update({ where: { id }, data, select: taskSelect });
};

export const setTaskStatus = async (id: string, status: TaskStatus, ownerId: string) => {
  await getTask(id, ownerId);

  return prisma.task.update({ where: { id }, data: { status }, select: taskSelect });
};

export const deleteTask = async (id: string, ownerId: string) => {
  await getTask(id, ownerId);
  await prisma.task.delete({ where: { id } });
};
