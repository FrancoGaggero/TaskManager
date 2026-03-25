import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado. Acceso denegado.' 
      });
    }

    // Extraer el token 
    const token = authHeader.substring(7);

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adjuntar datos del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: 'Error al verificar el token' });
  }
};

// Middleware opcional para verificar si el usuario es admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  
  next();
};
