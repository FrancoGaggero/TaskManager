import express from 'express';
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns
} from '../controllers/column.controller.js';
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks
} from '../controllers/task.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createColumnSchema,
  updateColumnSchema,
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  reorderSchema
} from '../validations/schemas.js';

const router = express.Router();

router.use(authMiddleware);

// Columnas de un proyecto
router.get('/project/:projectId', getColumns);
router.post('/project/:projectId', validate(createColumnSchema), createColumn);
router.put('/:columnId', validate(updateColumnSchema), updateColumn);
router.delete('/:columnId', deleteColumn);
router.put('/project/:projectId/reorder', validate(reorderSchema), reorderColumns);

// Tareas dentro de columnas
router.post('/:columnId/tasks', validate(createTaskSchema), createTask);
router.put('/tasks/:taskId', validate(updateTaskSchema), updateTask);
router.delete('/tasks/:taskId', deleteTask);
router.put('/tasks/:taskId/move', validate(moveTaskSchema), moveTask);
router.put('/:columnId/tasks/reorder', validate(reorderSchema), reorderTasks);

export default router;
