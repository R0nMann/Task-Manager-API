import type { RequestHandler } from 'express';
import * as projectService from '../services/project.service';
import type { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

type IdParams = { id: string };

export const listProjects: RequestHandler = async (req, res) => {
  const data = await projectService.listProjects(req.user!.id);
  res.status(200).json({ success: true, data });
};

export const createProject: RequestHandler<unknown, unknown, CreateProjectInput> = async (
  req,
  res,
) => {
  const data = await projectService.createProject(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
};

export const getProject: RequestHandler<IdParams> = async (req, res) => {
  const data = await projectService.getProject(req.params.id, req.user!.id);
  res.status(200).json({ success: true, data });
};

export const updateProject: RequestHandler<IdParams, unknown, UpdateProjectInput> = async (
  req,
  res,
) => {
  const data = await projectService.updateProject(req.params.id, req.body, req.user!.id);
  res.status(200).json({ success: true, data });
};

export const deleteProject: RequestHandler<IdParams> = async (req, res) => {
  await projectService.deleteProject(req.params.id, req.user!.id);
  res.status(204).send();
};
