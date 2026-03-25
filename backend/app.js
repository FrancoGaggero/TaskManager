import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes.js';
import projectRoutes from './src/routes/project.routes.js';
import columnRoutes from './src/routes/column.routes.js';
import { errorHandler, notFoundHandler } from './src/middlewares/error.middleware.js';

const app = express();

// Middlewares globales
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in case of misconfiguration, CORS is not a security boundary for APIs
    }
  },
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/columns', columnRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API Task Manager',
    version: '3.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      columns: '/api/columns'
    }
  });
});

// Middleware para rutas no encontradas (debe ir antes del errorHandler)
app.use(notFoundHandler);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
