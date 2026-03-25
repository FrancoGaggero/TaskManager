import 'dotenv/config';
import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (en orden por foreign keys)
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.project.deleteMany();
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

  // Crear proyecto de ejemplo para el usuario regular
  const userProject = await prisma.project.create({
    data: {
      name: 'Mi Primer Proyecto',
      userId: user.id,
      columns: {
        create: [
          { name: 'Por Hacer', order: 0 },
          { name: 'En Progreso', order: 1 },
          { name: 'Completado', order: 2 }
        ]
      }
    },
    include: { columns: { orderBy: { order: 'asc' } } }
  });

  // Crear tareas de ejemplo en las columnas
  await prisma.task.createMany({
    data: [
      { title: 'Diseñar la interfaz', columnId: userProject.columns[0].id, order: 0 },
      { title: 'Configurar el backend', columnId: userProject.columns[0].id, order: 1 },
      { title: 'Implementar autenticación', columnId: userProject.columns[1].id, order: 0 },
      { title: 'Crear base de datos', columnId: userProject.columns[2].id, order: 0, completed: true }
    ]
  });

  // Crear proyecto de ejemplo para el admin
  const adminProject = await prisma.project.create({
    data: {
      name: 'Proyecto Admin',
      userId: admin.id,
      columns: {
        create: [
          { name: 'Pendiente', order: 0 },
          { name: 'En Curso', order: 1 },
          { name: 'Hecho', order: 2 }
        ]
      }
    },
    include: { columns: { orderBy: { order: 'asc' } } }
  });

  await prisma.task.createMany({
    data: [
      { title: 'Revisar permisos', columnId: adminProject.columns[0].id, order: 0 },
      { title: 'Gestionar usuarios', columnId: adminProject.columns[1].id, order: 0 }
    ]
  });

  console.log('✅ Proyectos, columnas y tareas creadas');
  console.log('');
  console.log('📋 Credenciales:');
  console.log('   Admin: admin@admin.com / admin123');
  console.log('   Usuario: user@user.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
