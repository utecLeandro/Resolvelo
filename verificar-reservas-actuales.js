const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verificarReservas() {
  try {
    console.log("🔍 Verificando reservas en la base de datos...\n");

    // Obtener todas las reservas con información completa
    const reservas = await prisma.reserva.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
          },
        },
        publicacion: {
          select: {
            id: true,
            titulo: true,
            propietarioId: true,
          },
        },
        propietario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: "desc",
      },
    });

    console.log(`📊 Total de reservas encontradas: ${reservas.length}\n`);

    if (reservas.length === 0) {
      console.log("❌ No se encontraron reservas en la base de datos.");
      return;
    }

    reservas.forEach((reserva, index) => {
      console.log(`--- Reserva ${index + 1} ---`);
      console.log(`ID: ${reserva.id}`);
      console.log(`Estado: ${reserva.estado}`);
      console.log(`Fecha creación: ${reserva.fechaCreacion}`);
      console.log(`Fecha inicio: ${reserva.fechaInicio}`);
      console.log(`Fecha fin: ${reserva.fechaFin}`);
      console.log(`Precio total: $${reserva.precioTotal}`);
      console.log(
        `Arrendatario: ${reserva.usuario.email} (${reserva.usuario.nombre} ${reserva.usuario.apellido})`,
      );
      console.log(`Publicación: "${reserva.publicacion.titulo}"`);
      console.log(
        `Propietario: ${reserva.propietario.email} (${reserva.propietario.nombre} ${reserva.propietario.apellido})`,
      );
      console.log(
        `Teléfono contacto: ${reserva.telefonoContacto || "No especificado"}`,
      );
      console.log("");
    });

    // Verificar específicamente reservas para maria@test.com
    const reservasMaria = reservas.filter(
      (r) => r.propietario.email === "maria@test.com",
    );
    console.log(`🎯 Reservas para maria@test.com: ${reservasMaria.length}`);

    if (reservasMaria.length > 0) {
      console.log("📋 Detalles de reservas para Maria:");
      reservasMaria.forEach((reserva, index) => {
        console.log(
          `  ${index + 1}. ${reserva.publicacion.titulo} - Estado: ${reserva.estado} - Solicitante: ${reserva.usuario.email}`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Error al verificar reservas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarReservas();
