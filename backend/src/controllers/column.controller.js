import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

// Obtener columnas de un proyecto
export const getColumns = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Proyecto no encontrado', 404);
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('No tenés permiso', 403);
    }

    const columns = await prisma.column.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
      include: {
        tasks: { orderBy: { order: 'asc' } }
      }
    });

    res.json({ count: columns.length, columns });
  } catch (error) {
    next(error);
  }
};

// Crear columna en un proyecto
export const createColumn = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Proyecto no encontrado', 404);
    if (project.userId !== req.user.id) throw new AppError('No tenés permiso', 403);

    // Obtener el orden más alto
    const maxOrder = await prisma.column.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const column = await prisma.column.create({
      data: {
        name,
        order: (maxOrder?.order ?? -1) + 1,
        projectId
      },
      include: { tasks: true }
    });

    res.status(201).json(column);
  } catch (error) {
    next(error);
  }
};

// Actualizar columna (nombre)
export const updateColumn = async (req, res, next) => {
  try {
    const { columnId } = req.params;
    const { name } = req.body;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { project: true }
    });
    if (!column) throw new AppError('Columna no encontrada', 404);
    if (column.project.userId !== req.user.id) throw new AppError('No tenés permiso', 403);

    const updated = await prisma.column.update({
      where: { id: columnId },
      data: { name }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Eliminar columna
export const deleteColumn = async (req, res, next) => {
  try {
    const { columnId } = req.params;

    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { project: true }
    });
    if (!column) throw new AppError('Columna no encontrada', 404);
    if (column.project.userId !== req.user.id) throw new AppError('No tenés permiso', 403);

    await prisma.column.delete({ where: { id: columnId } });

    res.json({ message: 'Columna eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

// Reordenar columnas
export const reorderColumns = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { columnIds } = req.body; // Array de IDs en el nuevo orden

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Proyecto no encontrado', 404);
    if (project.userId !== req.user.id) throw new AppError('No tenés permiso', 403);

    // Actualizar el orden de cada columna
    const updates = columnIds.map((id, index) =>
      prisma.column.update({
        where: { id },
        data: { order: index }
      })
    );

    await prisma.$transaction(updates);

    const columns = await prisma.column.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
      include: { tasks: { orderBy: { order: 'asc' } } }
    });

    res.json({ columns });
  } catch (error) {
    next(error);
  }
};
