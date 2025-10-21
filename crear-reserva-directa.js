const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crearReservaDirecta() {
  try {
    console.log('🔧 Creando reserva directa en la base de datos...');

    // 1. Obtener usuarios
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, email: true, nombre: true }
    });
    console.log('👥 Usuarios disponibles:', usuarios);

    // 2. Obtener publicaciones
    const publicaciones = await prisma.publicacion.findMany({
      select: { id: true, titulo: true, propietarioId: true }
    });
    console.log('📋 Publicaciones disponibles:', publicaciones);

    if (usuarios.length < 2 || publicaciones.length === 0) {
      console.log('❌ No hay suficientes usuarios o publicaciones');
      return;
    }

    // 3. Buscar usuario test@test.com
    const usuarioTest = usuarios.find(u => u.email === 'test@test.com');
    if (!usuarioTest) {
      console.log('❌ Usuario test@test.com no encontrado');
      return;
    }

    // 4. Buscar una publicación que NO sea del usuario test
    const publicacion = publicaciones.find(p => p.propietarioId !== usuarioTest.id);
    if (!publicacion) {
      console.log('❌ No hay publicaciones de otros usuarios');
      return;
    }

    console.log(`✅ Usando publicación: ${publicacion.titulo} (ID: ${publicacion.id})`);
    console.log(`✅ Usuario solicitante: ${usuarioTest.email} (ID: ${usuarioTest.id})`);

    // 5. Crear reserva en estado CONFIRMADA
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 1); // Mañana
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 2); // Pasado mañana

    const reserva = await prisma.reserva.create({
      data: {
        publicacionId: publicacion.id,
        usuarioId: usuarioTest.id,
        propietarioId: publicacion.propietarioId,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        estado: 'CONFIRMADA',
        notasUsuario: 'Reserva de prueba para testing de activación',
        precioTotal: 100.00,
        comisionPlataforma: 10.00,
        tipoEntrega: 'RETIRO_LOCAL',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    });

    console.log('✅ Reserva creada exitosamente:', {
      id: reserva.id,
      estado: reserva.estado,
      fechaInicio: reserva.fechaInicio,
      fechaFin: reserva.fechaFin
    });

    console.log('\n🎯 Ahora puedes ejecutar el test de activación!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearReservaDirecta();