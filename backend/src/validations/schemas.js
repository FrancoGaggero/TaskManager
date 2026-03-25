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
