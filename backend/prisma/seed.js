import 'dotenv/config';
import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Datos existentes eliminados');

  // Crear usuarios
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@admin.com',
      password: adminPassword,
      role: 'admin'
    }
  });

  const user = await prisma.user.create({
    data: {
      name: 'Usuario Regular',
      email: 'user@user.com',
      password: userPassword,
      role: 'usuario'
    }
  });

  console.log('✅ Usuarios creados');

  // Crear tareas
  await prisma.task.createMany({
    data: [
      {
        title: 'Tarea del admin',
        completed: false,
        userId: admin.id
      },
      {
        title: 'Otra tarea del admin',
        completed: true,
        userId: admin.id
      },
      {
        title: 'Tarea del usuario regular',
        completed: false,
        userId: user.id
      },
      {
        title: 'Tarea completada del usuario',
        completed: true,
        userId: user.id
      }
    ]
  });

 
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
