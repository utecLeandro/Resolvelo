const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crearReservasPrueba() {
  try {
    console.log('🚀 Iniciando creación de reservas de prueba...');

    // Buscar usuarios existentes
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, email: true, nombre: true }
    });
    console.log('👥 Usuarios encontrados:', usuarios);

    // Buscar publicaciones existentes
    const publicaciones = await prisma.publicacion.findMany({
      select: { id: true, titulo: true, propietarioId: true }
    });
    console.log('📋 Publicaciones encontradas:', publicaciones);

    if (usuarios.length < 2) {
      console.log('❌ Se necesitan al menos 2 usuarios para crear reservas');
      return;
    }

    if (publicaciones.length === 0) {
      console.log('❌ Se necesita al menos 1 publicación para crear reservas');
      return;
    }

    const usuario1 = usuarios[0];
    const usuario2 = usuarios[1];
    const publicacion = publicaciones[0];

    // Asegurar que el usuario que hace la reserva no sea el propietario
    const usuarioReserva = publicacion.propietarioId === usuario1.id ? usuario2 : usuario1;

    console.log(`📝 Creando reservas para publicación "${publicacion.titulo}" del propietario ${publicacion.propietarioId}`);
    console.log(`👤 Usuario que hace las reservas: ${usuarioReserva.email}`);

    // Crear reserva PENDIENTE
    const reservaPendiente = await prisma.reserva.create({
      data: {
        usuarioId: usuarioReserva.id,
        propietarioId: publicacion.propietarioId,
        publicacionId: publicacion.id,
        fechaInicio: new Date('2024-01-15'),
        fechaFin: new Date('2024-01-20'),
        precioTotal: 150.00,
        comisionPlataforma: 15.00,
        estado: 'PENDIENTE',
        tipoEntrega: 'DOMICILIO',
        direccionEntrega: 'Av. Principal 123',
        telefonoContacto: '+51987654321',
        notasUsuario: 'Reserva de prueba - PENDIENTE'
      }
    });

    // Crear reserva CONFIRMADA (Aprobada)
    const reservaConfirmada = await prisma.reserva.create({
      data: {
        usuarioId: usuarioReserva.id,
        propietarioId: publicacion.propietarioId,
        publicacionId: publicacion.id,
        fechaInicio: new Date('2024-01-25'),
        fechaFin: new Date('2024-01-30'),
        precioTotal: 200.00,
        comisionPlataforma: 20.00,
        estado: 'CONFIRMADA',
        tipoEntrega: 'RECOJO',
        direccionEntrega: 'Local del propietario',
        telefonoContacto: '+51987654321',
        notasUsuario: 'Reserva de prueba - CONFIRMADA',
        notasPropietario: 'Reserva aprobada por el propietario'
      }
    });

    // Crear reserva RECHAZADA
    const reservaRechazada = await prisma.reserva.create({
      data: {
        usuarioId: usuarioReserva.id,
        propietarioId: publicacion.propietarioId,
        publicacionId: publicacion.id,
        fechaInicio: new Date('2024-02-01'),
        fechaFin: new Date('2024-02-05'),
        precioTotal: 125.00,
        comisionPlataforma: 12.50,
        estado: 'RECHAZADA',
        tipoEntrega: 'DOMICILIO',
        direccionEntrega: 'Av. Secundaria 456',
        telefonoContacto: '+51987654321',
        notasUsuario: 'Reserva de prueba - RECHAZADA',
        notasPropietario: 'Reserva rechazada - fechas no disponibles'
      }
    });

    console.log('✅ Reservas creadas exitosamente:');
    console.log(`📋 Reserva PENDIENTE: ${reservaPendiente.id}`);
    console.log(`✅ Reserva CONFIRMADA: ${reservaConfirmada.id}`);
    console.log(`❌ Reserva RECHAZADA: ${reservaRechazada.id}`);

    // Verificar las reservas creadas
    const todasLasReservas = await prisma.reserva.findMany({
      where: { propietarioId: publicacion.propietarioId },
      select: {
        id: true,
        estado: true,
        fechaInicio: true,
        fechaFin: true,
        precioTotal: true,
        usuario: { select: { email: true } },
        publicacion: { select: { titulo: true } }
      }
    });

    console.log('\n📊 Resumen de reservas por estado:');
    const resumen = todasLasReservas.reduce((acc, reserva) => {
      acc[reserva.estado] = (acc[reserva.estado] || 0) + 1;
      return acc;
    }, {});
    console.log(resumen);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearReservasPrueba();