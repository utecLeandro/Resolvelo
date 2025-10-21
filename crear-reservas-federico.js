const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crearReservasFederico() {
  try {
    console.log('🎯 Creando reservas para Federico...');

    // Buscar a Federico
    const federico = await prisma.usuario.findUnique({
      where: { email: 'federico@test.com' }
    });

    if (!federico) {
      console.log('❌ No se encontró el usuario federico@test.com');
      return;
    }

    console.log(`✅ Federico encontrado: ${federico.id}`);

    // Buscar las publicaciones de Federico
    const publicacionesFederico = await prisma.publicacion.findMany({
      where: { propietarioId: federico.id }
    });

    console.log(`📋 Publicaciones de Federico: ${publicacionesFederico.length}`);
    publicacionesFederico.forEach(p => console.log(`  - "${p.titulo}" (${p.id})`));

    if (publicacionesFederico.length === 0) {
      console.log('❌ Federico no tiene publicaciones');
      return;
    }

    // Buscar otros usuarios para hacer las reservas
    const otrosUsuarios = await prisma.usuario.findMany({
      where: { 
        email: { not: 'federico@test.com' }
      },
      take: 3
    });

    console.log(`👥 Otros usuarios disponibles: ${otrosUsuarios.length}`);
    otrosUsuarios.forEach(u => console.log(`  - ${u.email} (${u.id})`));

    // Crear reservas para cada publicación de Federico
    const reservasCreadas = [];
    
    for (const publicacion of publicacionesFederico) {
      console.log(`\n🔄 Creando reservas para "${publicacion.titulo}"...`);
      
      // Crear una reserva PENDIENTE
      const reservaPendiente = await prisma.reserva.create({
        data: {
          fechaInicio: new Date('2024-02-15'),
          fechaFin: new Date('2024-02-20'),
          estado: 'PENDIENTE',
          precioTotal: 150.00,
          deposito: 50.00,
          comisionPlataforma: 15.00,
          tipoEntrega: 'DOMICILIO',
          usuarioId: otrosUsuarios[0].id,
          publicacionId: publicacion.id,
          propietarioId: federico.id
        }
      });
      reservasCreadas.push(reservaPendiente);
      console.log(`  ✅ Reserva PENDIENTE creada (${reservaPendiente.id}) por ${otrosUsuarios[0].email}`);

      // Crear una reserva CONFIRMADA
      const reservaConfirmada = await prisma.reserva.create({
        data: {
          fechaInicio: new Date('2024-02-25'),
          fechaFin: new Date('2024-03-01'),
          estado: 'CONFIRMADA',
          precioTotal: 200.00,
          deposito: 75.00,
          comisionPlataforma: 20.00,
          tipoEntrega: 'PUNTO_ENCUENTRO',
          usuarioId: otrosUsuarios[1].id,
          publicacionId: publicacion.id,
          propietarioId: federico.id
        }
      });
      reservasCreadas.push(reservaConfirmada);
      console.log(`  ✅ Reserva CONFIRMADA creada (${reservaConfirmada.id}) por ${otrosUsuarios[1].email}`);

      // Crear una reserva RECHAZADA
      const reservaRechazada = await prisma.reserva.create({
        data: {
          fechaInicio: new Date('2024-03-05'),
          fechaFin: new Date('2024-03-10'),
          estado: 'RECHAZADA',
          precioTotal: 180.00,
          deposito: 60.00,
          comisionPlataforma: 18.00,
          tipoEntrega: 'DOMICILIO',
          usuarioId: otrosUsuarios[2] ? otrosUsuarios[2].id : otrosUsuarios[0].id,
          publicacionId: publicacion.id,
          propietarioId: federico.id
        }
      });
      reservasCreadas.push(reservaRechazada);
      console.log(`  ✅ Reserva RECHAZADA creada (${reservaRechazada.id}) por ${otrosUsuarios[2] ? otrosUsuarios[2].email : otrosUsuarios[0].email}`);
    }

    console.log(`\n🎉 Total de reservas creadas para Federico: ${reservasCreadas.length}`);

    // Verificar el resultado
    const solicitudesFederico = await prisma.reserva.findMany({
      where: { propietarioId: federico.id },
      include: {
        usuario: { select: { email: true } },
        publicacion: { select: { titulo: true } }
      }
    });

    console.log('\n📊 Resumen de solicitudes para Federico:');
    const conteos = {
      PENDIENTE: 0,
      CONFIRMADA: 0,
      RECHAZADA: 0
    };

    solicitudesFederico.forEach(s => {
      conteos[s.estado]++;
      console.log(`  - ${s.estado}: "${s.publicacion.titulo}" por ${s.usuario.email}`);
    });

    console.log(`\n📈 Conteos finales:`);
    console.log(`  Pendientes: ${conteos.PENDIENTE}`);
    console.log(`  Confirmadas: ${conteos.CONFIRMADA}`);
    console.log(`  Rechazadas: ${conteos.RECHAZADA}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearReservasFederico();