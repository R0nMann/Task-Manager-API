import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import validate from '../middleware/validate';
import * as projectController from '../controllers/project.controller';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from '../schemas/project.schema';

const router = Router();

router.use(authenticate);

router.get('/', projectController.listProjects);

router.post('/', validate({ body: createProjectSchema }), projectController.createProject);

router.get('/:id', validate({ params: projectIdSchema }), projectController.getProject);

router.patch(
  '/:id',
  validate({ params: projectIdSchema, body: updateProjectSchema }),
  projectController.updateProject,
);

router.delete('/:id', validate({ params: projectIdSchema }), projectController.deleteProject);

export default router;
