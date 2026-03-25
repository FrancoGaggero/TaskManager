import express from 'express';
import { register, login, createUser, getAllUsers, deleteUser } from '../controllers/auth.controller.js';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, createUserSchema } from '../validations/schemas.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Rutas protegidas (requieren autenticación)
router.post('/create-user', authMiddleware, isAdmin, validate(createUserSchema), createUser);
router.get('/users', authMiddleware, isAdmin, getAllUsers);
router.delete('/users/:userId', authMiddleware, isAdmin, deleteUser);

export default router;

