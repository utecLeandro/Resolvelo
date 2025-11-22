const { PrismaClient } = require("@prisma/client");

// Uso: node promover-admin.js [email]
// Si no se pasa email por argumento, se usa el email por defecto solicitado
const DEFAULT_EMAIL = "gtbump2012@gmail.com";

async function main() {
  const prisma = new PrismaClient();
  const emailArg = process.argv[2];
  const email = emailArg || DEFAULT_EMAIL;

  console.log(`\n🚀 Promoviendo usuario a ADMINISTRADOR: ${email}`);
  try {
    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      console.error("❌ Usuario no encontrado");
      return;
    }

    // Actualizar rol a ADMINISTRADOR
    const actualizado = await prisma.usuario.update({
      where: { email },
      data: {
        rol: "ADMINISTRADOR",
        fechaAsignacionRol: new Date(),
        motivoRol: "Promoción manual mediante script",
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
      },
    });

    console.log("✅ Rol actualizado correctamente:", actualizado);

    // Crear registro en tabla Administrador si no existe (opcional)
    const adminExiste = await prisma.administrador.findUnique({
      where: { usuarioId: actualizado.id },
    });
    if (!adminExiste) {
      const admin = await prisma.administrador.create({
        data: {
          usuarioId: actualizado.id,
          activo: true,
          fechaAsignacion: new Date(),
          fechaActualizacion: new Date(),
        },
        select: {
          id: true,
          usuarioId: true,
          activo: true,
          fechaAsignacion: true,
        },
      });
      console.log("🆕 Registro de Administrador creado:", admin);
    } else {
      console.log("ℹ️ El usuario ya tiene registro en Administrador.");
    }

    console.log("\n🎯 Listo. El usuario ahora tiene rol ADMINISTRADOR.");
  } catch (error) {
    console.error("❌ Error al promover usuario:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
