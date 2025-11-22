const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugSolicitudesUsuario() {
  try {
    console.log("🔍 Debuggeando solicitudes por usuario...");

    // Obtener todos los usuarios
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, email: true, nombre: true },
    });
    console.log("\n👥 Usuarios disponibles:");
    usuarios.forEach((u) => console.log(`  - ${u.email} (${u.id})`));

    // Obtener todas las publicaciones
    const publicaciones = await prisma.publicacion.findMany({
      select: {
        id: true,
        titulo: true,
        propietarioId: true,
        propietario: { select: { email: true } },
      },
    });
    console.log("\n📋 Publicaciones disponibles:");
    publicaciones.forEach((p) =>
      console.log(
        `  - "${p.titulo}" del propietario ${p.propietario.email} (${p.propietarioId})`,
      ),
    );

    // Obtener todas las reservas
    const reservas = await prisma.reserva.findMany({
      include: {
        usuario: { select: { email: true } },
        propietario: { select: { email: true } },
        publicacion: { select: { titulo: true } },
      },
    });

    console.log("\n📊 Reservas por propietario:");
    const reservasPorPropietario = {};

    reservas.forEach((r) => {
      const propietarioEmail = r.propietario.email;
      if (!reservasPorPropietario[propietarioEmail]) {
        reservasPorPropietario[propietarioEmail] = {
          propietarioId: r.propietarioId,
          total: 0,
          pendientes: 0,
          confirmadas: 0,
          rechazadas: 0,
          reservas: [],
        };
      }

      reservasPorPropietario[propietarioEmail].total++;
      reservasPorPropietario[propietarioEmail].reservas.push({
        id: r.id,
        estado: r.estado,
        publicacion: r.publicacion.titulo,
        usuario: r.usuario.email,
      });

      switch (r.estado) {
        case "PENDIENTE":
          reservasPorPropietario[propietarioEmail].pendientes++;
          break;
        case "CONFIRMADA":
          reservasPorPropietario[propietarioEmail].confirmadas++;
          break;
        case "RECHAZADA":
          reservasPorPropietario[propietarioEmail].rechazadas++;
          break;
      }
    });

    Object.entries(reservasPorPropietario).forEach(([email, data]) => {
      console.log(`\n📧 ${email} (ID: ${data.propietarioId}):`);
      console.log(
        `  Total: ${data.total} | Pendientes: ${data.pendientes} | Confirmadas: ${data.confirmadas} | Rechazadas: ${data.rechazadas}`,
      );
      console.log("  Detalle de reservas:");
      data.reservas.forEach((r) => {
        console.log(
          `    - ${r.estado}: "${r.publicacion}" solicitada por ${r.usuario} (ID: ${r.id})`,
        );
      });
    });

    // Verificar específicamente para el usuario federico@test.com
    const federico = usuarios.find((u) => u.email === "federico@test.com");
    if (federico) {
      console.log(
        `\n🎯 Análisis específico para federico@test.com (${federico.id}):`,
      );

      const publicacionesFederico = publicaciones.filter(
        (p) => p.propietarioId === federico.id,
      );
      console.log(`  Publicaciones: ${publicacionesFederico.length}`);
      publicacionesFederico.forEach((p) => console.log(`    - "${p.titulo}"`));

      const solicitudesFederico = reservas.filter(
        (r) => r.propietarioId === federico.id,
      );
      console.log(`  Solicitudes recibidas: ${solicitudesFederico.length}`);
      solicitudesFederico.forEach((s) => {
        console.log(
          `    - ${s.estado}: "${s.publicacion.titulo}" por ${s.usuario.email}`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSolicitudesUsuario();
