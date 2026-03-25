import { z } from 'zod';

// Schema para registro de usuario
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  role: z.enum(['admin', 'usuario']).optional()
});

// Schema para login
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  password: z.string()
    .min(1, 'La contraseña es requerida')
});

// Schema para creación de usuario por admin
export const createUserSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .toLowerCase(),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  role: z.enum(['admin', 'usuario']).default('usuario')
});

// Schema para creación de proyecto
export const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
});

// Schema para actualización de proyecto
export const updateProjectSchema = z.object({
  name: z.string()
    .min(1, 'El nombre no puede estar vacío')
    .max(100, 'El nombre no puede exceder 100 caracteres')
});

// Schema para creación de columna
export const createColumnSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
});

// Schema para actualización de columna
export const updateColumnSchema = z.object({
  name: z.string()
    .min(1, 'El nombre no puede estar vacío')
    .max(100, 'El nombre no puede exceder 100 caracteres')
});

// Schema para creación de tarea
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres')
});

// Schema para actualización de tarea
export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, 'El título no puede estar vacío')
    .max(200, 'El título no puede exceder 200 caracteres')
    .optional(),
  completed: z.boolean().optional()
}).refine(data => data.title !== undefined || data.completed !== undefined, {
  message: 'Debe proporcionar al menos un campo para actualizar'
});

// Schema para mover tarea
export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1, 'El ID de columna destino es requerido'),
  order: z.number().int().min(0).optional()
});

// Schema para reordenar (columnas o tareas)
export const reorderSchema = z.object({
  columnIds: z.array(z.string()).optional(),
  taskIds: z.array(z.string()).optional()
}).refine(data => data.columnIds || data.taskIds, {
  message: 'Debe proporcionar columnIds o taskIds'
});
