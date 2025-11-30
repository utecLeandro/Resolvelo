const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // 1. Obtener credenciales de variables de entorno (SIN valores por defecto para seguridad)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('❌ Error: SEED_ADMIN_ON_START está activo pero faltan ADMIN_EMAIL o ADMIN_PASSWORD.');
    process.exit(1);
  }

  console.log(`🛡️ Iniciando seed de Admin de Producción para: ${adminEmail}`);

  // 2. Verificar si el usuario ya existe
  const existingUser = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log(`ℹ️ El usuario ${adminEmail} ya existe. Verificando rol de administrador...`);
    
    // Asegurar que tenga el rol correcto si ya existe
    if (existingUser.rol !== 'SUPER_ADMIN' && existingUser.rol !== 'ADMINISTRADOR') {
      console.log(`⚠️ Actualizando rol de usuario existente a SUPER_ADMIN`);
      await prisma.usuario.update({
        where: { id: existingUser.id },
        data: { rol: 'SUPER_ADMIN' }
      });
    }

    // Asegurar registro en tabla Administradores
    await prisma.administrador.upsert({
      where: { usuarioId: existingUser.id },
      update: { activo: true },
      create: {
        usuarioId: existingUser.id,
        activo: true,
        motivoAsignacion: 'Admin Existente Promovido (Auto-Seed)',
      },
    });

    console.log(`✅ Admin verificado y actualizado correctamente.`);
    return;
  }

  // 3. Si no existe, crearlo desde cero
  console.log(`✨ Creando nuevo usuario Super Admin...`);
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(adminPassword, salt);

  // Nota: Usamos BigInt para IDs según el esquema actual, pero Prisma maneja la conversión
  // al crear si dejamos que la BD genere el ID (autoincrement).
  const newUser = await prisma.usuario.create({
    data: {
      nombre: 'Super',
      apellido: 'Admin',
      email: adminEmail,
      passwordHash: hash,
      passwordSalt: salt,
      documentoIdentidad: '0.000.000-1', // Valor reservado para el sistema
      telefono: '+000000000',
      estadoVerificacion: 'VERIFICADA',
      emailVerificado: true,
      rol: 'SUPER_ADMIN',
      fechaAsignacionRol: new Date(),
      asignadoPor: 'SYSTEM',
      motivoRol: 'Admin Inicial del Sistema (Auto-Seed)',
      primerLoginPendiente: false, // Ya está verificado
      // Datos obligatorios adicionales según schema
      activo: true
    },
  });

  // Crear entrada en tabla Administradores
  await prisma.administrador.create({
    data: {
      usuarioId: newUser.id,
      activo: true,
      motivoAsignacion: 'Admin Inicial Automático',
    },
  });

  console.log(`✅ Usuario Super Admin creado exitosamente con ID: ${newUser.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error crítico en seed de producción:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
