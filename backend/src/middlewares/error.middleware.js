import { Prisma } from '@prisma/client';

// Middleware para manejar errores globalmente
export const errorHandler = (err, req, res, next) => {
  // Log del error (en producción podrías usar un logger profesional)
  console.error('Error:', err);

  // Errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Violación de constraint único (ej: email duplicado)
        return res.status(400).json({
          error: 'Registro duplicado',
          message: `El valor ya existe en el sistema`
        });
      
      case 'P2025':
        // Registro no encontrado
        return res.status(404).json({
          error: 'Recurso no encontrado',
          message: 'El recurso solicitado no existe'
        });
      
      case 'P2003':
        // Violación de foreign key
        return res.status(400).json({
          error: 'Referencia inválida',
          message: 'La referencia proporcionada no existe'
        });
      
      default:
        return res.status(500).json({
          error: 'Error de base de datos',
          message: 'Ocurrió un error al procesar la solicitud'
        });
    }
  }

  // Error de validación de Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      message: 'Los datos proporcionados no son válidos'
    });
  }

  // Errores personalizados con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message || 'Error en la solicitud'
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Ocurrió un error inesperado'
  });
};

// Middleware para rutas no encontradas
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.url} no existe`
  });
};

// Clase para crear errores personalizados
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
