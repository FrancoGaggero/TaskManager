import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getAllProjects
} from '../controllers/project.controller.js';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../validations/schemas.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas del usuario
router.get('/', getProjects);

// Ruta admin: ver todos los proyectos (MUST be before /:projectId)
router.get('/admin/all', isAdmin, getAllProjects);

router.get('/:projectId', getProject);
router.post('/', validate(createProjectSchema), createProject);
router.put('/:projectId', validate(updateProjectSchema), updateProject);
router.delete('/:projectId', deleteProject);

export default router;
