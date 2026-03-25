import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

// Obtener proyectos del usuario autenticado
export const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { tasks: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};

// Obtener un proyecto por ID (con columnas y tareas)
export const getProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: { orderBy: { order: 'asc' } }
          }
        }
      }
    });

    if (!project) {
      throw new AppError('Proyecto no encontrado', 404);
    }

    // Solo el dueño o un admin puede ver el proyecto
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('No tenés permiso para ver este proyecto', 403);
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Crear proyecto
export const createProject = async (req, res, next) => {
  try {
    const { name } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        userId: req.user.id,
        columns: {
          create: [
            { name: 'Por Hacer', order: 0 },
            { name: 'En Progreso', order: 1 },
            { name: 'Completado', order: 2 }
          ]
        }
      },
      include: {
        columns: { orderBy: { order: 'asc' } }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// Actualizar proyecto (nombre)
export const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) throw new AppError('Proyecto no encontrado', 404);
    if (existing.userId !== req.user.id) throw new AppError('No tenés permiso', 403);

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name }
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Eliminar proyecto
export const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) throw new AppError('Proyecto no encontrado', 404);
    if (existing.userId !== req.user.id) throw new AppError('No tenés permiso', 403);

    await prisma.project.delete({ where: { id: projectId } });

    res.json({ message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

// Admin: obtener todos los proyectos de todos los usuarios
export const getAllProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        columns: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { tasks: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ count: projects.length, projects });
  } catch (error) {
    next(error);
  }
};
