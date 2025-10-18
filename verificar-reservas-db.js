const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarReservas() {
  console.log('🔍 Verificando reservas en la base de datos...');

  try {
    // Obtener todas las reservas
    const todasLasReservas = await prisma.reserva.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        publicacion: {
          select: {
            id: true,
            titulo: true,
            propietarioId: true
          }
        }
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    });

    console.log(`📋 Total de reservas: ${todasLasReservas.length}`);

    if (todasLasReservas.length > 0) {
      console.log('\n📝 Últimas reservas:');
      todasLasReservas.slice(0, 3).forEach((reserva, index) => {
        console.log(`\n${index + 1}. Reserva ID: ${reserva.id}`);
        console.log(`   Usuario: ${reserva.usuario.nombre} ${reserva.usuario.apellido} (${reserva.usuario.email})`);
        console.log(`   Publicación: ${reserva.publicacion.titulo}`);
        console.log(`   Propietario ID: ${reserva.propietarioId}`);
        console.log(`   Estado: ${reserva.estado}`);
        console.log(`   Fecha creación: ${reserva.fechaCreacion}`);
      });
    }

    // Verificar reservas pendientes para Juan (propietario)
    const juanId = 'cmgv4890t0000133izvwqlfdt';
    console.log(`\n🔍 Buscando reservas pendientes para Juan (${juanId})...`);
    
    const reservasPendientesJuan = await prisma.reserva.findMany({
      where: {
        propietarioId: juanId,
        estado: 'PENDIENTE'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        publicacion: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    console.log(`📋 Reservas pendientes para Juan: ${reservasPendientesJuan.length}`);
    
    if (reservasPendientesJuan.length > 0) {
      reservasPendientesJuan.forEach((reserva, index) => {
        console.log(`\n${index + 1}. Reserva pendiente:`);
        console.log(`   ID: ${reserva.id}`);
        console.log(`   Usuario: ${reserva.usuario.nombre} ${reserva.usuario.apellido}`);
        console.log(`   Publicación: ${reserva.publicacion.titulo}`);
        console.log(`   Estado: ${reserva.estado}`);
      });
    } else {
      console.log('❌ No hay reservas pendientes para Juan');
    }

  } catch (error) {
    console.error('❌ Error al verificar reservas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarReservas();