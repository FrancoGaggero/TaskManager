import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

// Helper: verificar que el usuario es dueño del proyecto al que pertenece la columna
const verifyColumnOwnership = async (columnId, userId, userRole) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { project: true }
  });
  if (!column) throw new AppError('Columna no encontrada', 404);
  if (column.project.userId !== userId && userRole !== 'admin') {
    throw new AppError('No tenés permiso', 403);
  }
  return column;
};

// Crear tarea en una columna
export const createTask = async (req, res, next) => {
  try {
    const { columnId } = req.params;
    const { title } = req.body;

    const column = await verifyColumnOwnership(columnId, req.user.id, req.user.role);
    // Admin can view but not modify
    if (column.project.userId !== req.user.id) {
      throw new AppError('No tenés permiso para crear tareas en este proyecto', 403);
    }

    const maxOrder = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const task = await prisma.task.create({
      data: {
        title,
        columnId,
        order: (maxOrder?.order ?? -1) + 1
      }
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// Actualizar tarea (título, completed)
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, completed } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { project: true } } }
    });
    if (!task) throw new AppError('Tarea no encontrada', 404);
    if (task.column.project.userId !== req.user.id) {
      throw new AppError('No tenés permiso para editar esta tarea', 403);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Eliminar tarea
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { project: true } } }
    });
    if (!task) throw new AppError('Tarea no encontrada', 404);
    if (task.column.project.userId !== req.user.id) {
      throw new AppError('No tenés permiso para eliminar esta tarea', 403);
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

// Mover tarea (cambiar columna y/o reordenar) — handles full reorder in a transaction
export const moveTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { targetColumnId, order } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { project: true } } }
    });
    if (!task) throw new AppError('Tarea no encontrada', 404);
    if (task.column.project.userId !== req.user.id) {
      throw new AppError('No tenés permiso', 403);
    }

    const sourceColumnId = task.columnId;
    const isSameColumn = sourceColumnId === targetColumnId;

    // Verify target column belongs to same project
    if (!isSameColumn) {
      const targetColumn = await prisma.column.findUnique({ where: { id: targetColumnId } });
      if (!targetColumn) throw new AppError('Columna destino no encontrada', 404);
      if (targetColumn.projectId !== task.column.projectId) {
        throw new AppError('La columna destino no pertenece al mismo proyecto', 400);
      }
    }

    const targetOrder = order ?? 0;

    // Build all updates in a single transaction
    const operations = [];

    if (isSameColumn) {
      // Reorder within same column
      const tasks = await prisma.task.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { order: 'asc' }
      });
      const ids = tasks.map(t => t.id).filter(id => id !== taskId);
      ids.splice(targetOrder, 0, taskId);
      ids.forEach((id, i) => {
        operations.push(prisma.task.update({ where: { id }, data: { order: i } }));
      });
    } else {
      // Move to different column
      // 1. Remove from source and reorder source
      const sourceTasks = await prisma.task.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { order: 'asc' }
      });
      const sourceIds = sourceTasks.map(t => t.id).filter(id => id !== taskId);
      sourceIds.forEach((id, i) => {
        operations.push(prisma.task.update({ where: { id }, data: { order: i } }));
      });

      // 2. Insert into target column at position
      const targetTasks = await prisma.task.findMany({
        where: { columnId: targetColumnId },
        orderBy: { order: 'asc' }
      });
      const targetIds = targetTasks.map(t => t.id);
      targetIds.splice(targetOrder, 0, taskId);
      targetIds.forEach((id, i) => {
        operations.push(prisma.task.update({
          where: { id },
          data: { order: i, ...(id === taskId ? { columnId: targetColumnId } : {}) }
        }));
      });
    }

    await prisma.$transaction(operations);

    // Return updated columns for both source and target
    const updatedColumns = await prisma.column.findMany({
      where: { id: { in: isSameColumn ? [sourceColumnId] : [sourceColumnId, targetColumnId] } },
      include: { tasks: { orderBy: { order: 'asc' } } }
    });

    res.json({ columns: updatedColumns });
  } catch (error) {
    next(error);
  }
};

// Reordenar tareas dentro de una columna
export const reorderTasks = async (req, res, next) => {
  try {
    const { columnId } = req.params;
    const { taskIds } = req.body;

    const column = await verifyColumnOwnership(columnId, req.user.id, req.user.role);
    if (column.project.userId !== req.user.id) {
      throw new AppError('No tenés permiso', 403);
    }

    const updates = taskIds.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { order: index }
      })
    );

    await prisma.$transaction(updates);

    const tasks = await prisma.task.findMany({
      where: { columnId },
      orderBy: { order: 'asc' }
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};
