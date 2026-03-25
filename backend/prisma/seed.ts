import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { codigo: 'users:create', descripcion: 'Crear usuarios' },
  { codigo: 'users:read', descripcion: 'Leer usuarios' },
  { codigo: 'users:update', descripcion: 'Actualizar usuarios' },
  { codigo: 'users:delete', descripcion: 'Eliminar usuarios' },
  { codigo: 'permissions:read', descripcion: 'Leer permisos y roles' },
  { codigo: 'permissions:update', descripcion: 'Actualizar permisos y roles' },
  { codigo: 'assets:upload', descripcion: 'Subir archivos' },
];

const ROLES = [
  {
    codigo: 'ADMIN',
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    permissions: [
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'permissions:read',
      'permissions:update',
      'assets:upload',
    ],
  },
  {
    codigo: 'EDITOR',
    nombre: 'Editor',
    descripcion: 'Puede crear y editar contenido',
    permissions: [
      'users:read',
      'users:update',
      'permissions:read',
      'assets:upload',
    ],
  },
  {
    codigo: 'VIEWER',
    nombre: 'Visualizador',
    descripcion: 'Solo puede leer contenido',
    permissions: ['users:read', 'permissions:read'],
  },
];

async function main() {
  console.log('Iniciando seed...');

  // 1. Crear permisos
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { codigo: perm.codigo },
      update: { descripcion: perm.descripcion },
      create: { codigo: perm.codigo, descripcion: perm.descripcion },
    });
  }
  console.log(`✓ ${PERMISSIONS.length} permisos creados`);

  // 2. Crear roles y asignar permisos
  for (const rolData of ROLES) {
    const { permissions, ...roleInfo } = rolData;

    const role = await prisma.role.upsert({
      where: { codigo: roleInfo.codigo },
      update: { nombre: roleInfo.nombre, descripcion: roleInfo.descripcion },
      create: { ...roleInfo },
    });

    // Limpiar y reasignar permisos al rol
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    for (const permCodigo of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { codigo: permCodigo },
      });
      if (permission) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permission.id },
        });
      }
    }
  }
  console.log(`✓ ${ROLES.length} roles creados con permisos`);

  // 3. Crear usuarios de prueba
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@example.com',
      nombre: 'Administrador',
      password: passwordHash,
      isSuperAdmin: true,
      rolCodigo: 'ADMIN',
    },
    {
      email: 'editor@example.com',
      nombre: 'Editor',
      password: passwordHash,
      isSuperAdmin: false,
      rolCodigo: 'EDITOR',
    },
    {
      email: 'viewer@example.com',
      nombre: 'Visualizador',
      password: passwordHash,
      isSuperAdmin: false,
      rolCodigo: 'VIEWER',
    },
  ];

  for (const userData of users) {
    const { rolCodigo, ...userInfo } = userData;

    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: { nombre: userInfo.nombre },
      create: { ...userInfo },
    });

    // Asignar rol al usuario
    const role = await prisma.role.findUnique({ where: { codigo: rolCodigo } });
    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }
  }
  console.log(`✓ ${users.length} usuarios de prueba creados`);
  console.log('');
  console.log('Usuarios disponibles:');
  console.log('  admin@example.com   | password123 | SuperAdmin');
  console.log('  editor@example.com  | password123 | Editor');
  console.log('  viewer@example.com  | password123 | Viewer');
  console.log('');
  console.log('Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
