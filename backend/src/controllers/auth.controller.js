import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/error.middleware.js';

// Función auxiliar para generar JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Registro de usuario
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'usuario'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generar token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login de usuario
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar token
    const token = generateToken(user);

    // Remover password de la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Crear usuario (solo admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar que quien crea es admin (ya validado por middleware)
    if (req.user.role !== 'admin') {
      throw new AppError('No tienes permisos para crear usuarios', 403);
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'usuario'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los usuarios (solo admin)
export const getAllUsers = async (req, res, next) => {
  try {
    // Verificar que quien consulta es admin
    if (req.user.role !== 'admin') {
      throw new AppError('No tienes permisos para ver todos los usuarios', 403);
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { projects: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar usuario (solo admin)
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verificar que quien elimina es admin
    if (req.user.role !== 'admin') {
      throw new AppError('No tienes permisos para eliminar usuarios', 403);
    }

    // Verificar que no se elimine a sí mismo
    if (req.user.id === userId) {
      throw new AppError('No puedes eliminar tu propio usuario', 400);
    }

    // Eliminar usuario (Prisma eliminará las tareas automáticamente por onDelete: Cascade)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

