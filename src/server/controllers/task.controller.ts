import type { RequestHandler } from 'express';
import * as taskService from '../services/task.service';
import { paginated } from '../utils/pagination';
import type { TaskStatus } from '../../../prisma/generated/client.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from '../schemas/task.schema';

type IdParams = { id: string };

export const listTasks: RequestHandler = async (
  req,
  res,
) => {
  const query = req.query as unknown as ListTasksQuery;
  const { tasks, totalItems, params } = await taskService.listTasks(query, req.user!.id);
  res.status(200).json(paginated(tasks, params, totalItems));
};

export const createTask: RequestHandler<unknown, unknown, CreateTaskInput> = async (
  req,
  res,
) => {
  const data = await taskService.createTask(req.body, req.user!.id);
  res.status(201).json({ success: true, data });
};

export const getTask: RequestHandler<IdParams> = async (req, res) => {
  const data = await taskService.getTask(req.params.id, req.user!.id);
  res.status(200).json({ success: true, data });
};

export const updateTask: RequestHandler<IdParams, unknown, UpdateTaskInput> = async (
  req,
  res,
) => {
  const data = await taskService.updateTask(req.params.id, req.body, req.user!.id);
  res.status(200).json({ success: true, data });
};

export const setTaskStatus: RequestHandler<IdParams, unknown, { status: TaskStatus }> = async (
  req,
  res,
) => {
  const data = await taskService.setTaskStatus(req.params.id, req.body.status, req.user!.id);
  res.status(200).json({ success: true, data });
};

export const deleteTask: RequestHandler<IdParams> = async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user!.id);
  res.status(204).send();
};
