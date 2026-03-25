import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

// Obtener todas las tareas (para admin) o las tareas del usuario autenticado
export const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Si es admin, devolver todas las tareas con info del usuario
    if (userRole === 'admin') {
      const allTasks = await prisma.task.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.json({
        count: allTasks.length,
        tasks: allTasks
      });
    }

    // Si es usuario regular, solo sus tareas
    const userTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      count: userTasks.length,
      tasks: userTasks
    });
  } catch (error) {
    next(error);
  }
};

// Crear tarea
export const createTask = async (req, res, next) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    // Crear la tarea
    const newTask = await prisma.task.create({
      data: {
        title,
        userId
      }
    });

    res.status(201).json({
      message: 'Tarea creada exitosamente',
      task: newTask
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar tarea
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, completed } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Buscar la tarea
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new AppError('Tarea no encontrada', 404);
    }

    // Verificar permisos: admin puede editar cualquier tarea, usuario solo las suyas
    if (userRole !== 'admin' && task.userId !== userId) {
      throw new AppError('No tienes permisos para editar esta tarea', 403);
    }

    // Preparar datos para actualizar
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = completed;

    // Actualizar la tarea
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData
    });

    res.json({
      message: 'Tarea actualizada exitosamente',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar tarea
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Buscar la tarea
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new AppError('Tarea no encontrada', 404);
    }

    // Verificar permisos: admin puede eliminar cualquier tarea, usuario solo las suyas
    if (userRole !== 'admin' && task.userId !== userId) {
      throw new AppError('No tienes permisos para eliminar esta tarea', 403);
    }

    // Eliminar la tarea
    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(200).json({
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
