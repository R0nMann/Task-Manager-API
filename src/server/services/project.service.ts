import { prisma } from '../config/prisma';
import NotFoundError from '../errors/NotFoundError';
import type { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

const projectSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
} as const;

export const listProjects = (ownerId: string) =>
  prisma.project.findMany({
    where: { ownerId },
    select: { ...projectSelect, _count: { select: { tasks: true } } },
    orderBy: { createdAt: 'desc' },
  });

export const getProject = async (id: string, ownerId: string) => {
  const project = await prisma.project.findFirst({
    where: { id, ownerId },
    select: { ...projectSelect, _count: { select: { tasks: true } } },
  });

  if (!project) throw new NotFoundError('Project not found');
  return project;
};

export const createProject = (data: CreateProjectInput, ownerId: string) =>
  prisma.project.create({
    data: { ...data, ownerId },
    select: projectSelect,
  });

export const updateProject = async (id: string, data: UpdateProjectInput, ownerId: string,) => {
  await getProject(id, ownerId);

  return prisma.project.update({
    where: { id },
    data,
    select: projectSelect,
  });
};

export const deleteProject = async (id: string, ownerId: string) => {
  await getProject(id, ownerId);
  // Tasks go with it: the relation declares onDelete: Cascade.
  await prisma.project.delete({ where: { id } });
};
