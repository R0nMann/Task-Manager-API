import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import validate from '../middleware/validate';
import * as taskController from '../controllers/task.controller';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskIdSchema,
  listTasksQuerySchema,
} from '../schemas/task.schema';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: listTasksQuerySchema }), taskController.listTasks);

router.post('/', validate({ body: createTaskSchema }), taskController.createTask);

router.get('/:id', validate({ params: taskIdSchema }), taskController.getTask);

router.patch(
  '/:id',
  validate({ params: taskIdSchema, body: updateTaskSchema }),
  taskController.updateTask,
);

router.patch(
  '/:id/status',
  validate({ params: taskIdSchema, body: updateTaskStatusSchema }),
  taskController.setTaskStatus,
);

router.delete('/:id', validate({ params: taskIdSchema }), taskController.deleteTask);

export default router;
