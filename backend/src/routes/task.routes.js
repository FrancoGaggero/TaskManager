import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/task.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../validations/schemas.js';

const router = express.Router();

// Todas las rutas de tareas requieren autenticación
router.use(authMiddleware);

// Obtener tareas (del usuario autenticado o todas si es admin)
router.get('/', getTasks);

// Crear tarea
router.post('/', validate(createTaskSchema), createTask);

// Actualizar tarea
router.put('/:taskId', validate(updateTaskSchema), updateTask);

// Eliminar tarea
router.delete('/:taskId', deleteTask);

export default router;

