import { ZodError } from 'zod';

// Middleware genérico para validar con schemas de Zod
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validar el body de la request
      const validatedData = schema.parse(req.body);
      
      // Reemplazar el body con los datos validados y sanitizados
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatear errores de validación
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Validación fallida',
          details: errors
        });
      }
      
      next(error);
    }
  };
};
