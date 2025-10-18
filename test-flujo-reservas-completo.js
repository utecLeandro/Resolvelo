const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function probarFlujoReservas() {
  console.log('🧪 Iniciando prueba del flujo completo de reservas...\n');

  try {
    // 1. Iniciar sesión como María para reservar una publicación de otro usuario
    console.log('1. 🔐 Iniciando sesión como maria@test.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'maria@test.com',
      password: 'MariaTest2024!'
    });
    
    const token = loginResponse.data.access_token;
    const usuarioMaria = loginResponse.data.user;
    console.log(`   ✅ Login exitoso. Usuario ID: ${usuarioMaria.id}`);

    // 2. Obtener publicaciones
    console.log('\n2. 📋 Obteniendo publicaciones...');
    const publicacionesResponse = await axios.get(`${BASE_URL}/publicaciones`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const responseData = publicacionesResponse.data;
    const publicaciones = responseData.publicaciones || responseData.data || responseData;
    
    if (!Array.isArray(publicaciones) || publicaciones.length === 0) {
      throw new Error('No hay publicaciones disponibles');
    }
    
    const publicacionSeleccionada = publicaciones[0];
    console.log(`   ✅ Usando publicación: "${publicacionSeleccionada.titulo}" (ID: ${publicacionSeleccionada.id})`);
    console.log(`   📍 Propietario ID: ${publicacionSeleccionada.propietarioId}`);

    // 3. Crear reserva
    console.log('\n3. 📝 Creando solicitud de reserva...');
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 30); // En 30 días
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 32); // En 32 días

    const datosReserva = {
      usuarioId: usuarioMaria.id,
      publicacionId: publicacionSeleccionada.id,
      propietarioId: publicacionSeleccionada.propietarioId,
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0],
      precioTotal: publicacionSeleccionada.precioPorDia * 2, // 2 días
      comisionPlataforma: Math.round(publicacionSeleccionada.precioPorDia * 2 * 0.1),
      tipoEntrega: 'DOMICILIO',
      direccionEntrega: usuarioMaria.direccion || 'Por definir',
      telefonoContacto: usuarioMaria.telefono || 'Por definir',
      notasUsuario: 'Solicitud de prueba para verificar funcionalidad'
    };

    const reservaResponse = await axios.post(
      `${BASE_URL}/usuarios/reservas/crear`,
      datosReserva,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('   📋 Respuesta de reserva:', JSON.stringify(reservaResponse.data, null, 2));
    const reservaId = reservaResponse.data.id || reservaResponse.data.reserva?.id || 'ID no disponible';
    console.log(`   ✅ Reserva creada exitosamente. ID: ${reservaId}`);
    console.log(`   📅 Fechas: ${datosReserva.fechaInicio} a ${datosReserva.fechaFin}`);
    console.log(`   💰 Precio total: $${datosReserva.precioTotal}`);

    // 4. Login como propietario (Federico) para verificar solicitudes
    console.log('\n4. 🔐 Iniciando sesión como propietario (gtbump2012@gmail.com)...');
    const loginPropietario = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'gtbump2012@gmail.com',
      password: 'FedericoTest2024!'
    });
    
    const tokenPropietario = loginPropietario.data.access_token;
    console.log('   ✅ Login exitoso como propietario');

    // 5. Verificar solicitudes pendientes
    console.log('\n5. 📬 Verificando solicitudes de alquiler pendientes...');
    const solicitudesResponse = await axios.get(
      `${BASE_URL}/usuarios/reservas/mis-solicitudes`,
      {
        headers: {
          'Authorization': `Bearer ${tokenPropietario}`
        }
      }
    );

    const solicitudes = Array.isArray(solicitudesResponse.data) ? solicitudesResponse.data : solicitudesResponse.data.data || [];
    console.log(`   📊 Total de solicitudes encontradas: ${solicitudes.length}`);
    console.log('   📋 Estructura de respuesta:', JSON.stringify(solicitudesResponse.data, null, 2));

    const solicitudCreada = solicitudes.find(s => s.id === reservaId);
    if (solicitudCreada) {
      console.log('   ✅ ¡Solicitud encontrada en la lista del propietario!');
      console.log(`   📋 Detalles de la solicitud:`);
      console.log(`      - ID: ${solicitudCreada.id}`);
      console.log(`      - Usuario: ${solicitudCreada.usuario.email}`);
      console.log(`      - Publicación: ${solicitudCreada.publicacion.titulo}`);
      console.log(`      - Estado: ${solicitudCreada.estado}`);
      console.log(`      - Fechas: ${solicitudCreada.fechaInicio} a ${solicitudCreada.fechaFin}`);
      console.log(`      - Precio: $${solicitudCreada.precioTotal}`);
    } else {
      console.log('   ❌ La solicitud NO aparece en la lista del propietario');
    }

    // 6. Verificar en base de datos
    console.log('\n6. 🗄️ Verificando reservas en base de datos...');
    const todasReservas = await axios.get(`${BASE_URL}/reservas/mis-solicitudes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   📊 Total de reservas en BD: ${todasReservas.data.length}`);
    
    const reservaEnBD = todasReservas.data.find(r => r.id === reservaId);
    if (reservaEnBD) {
      console.log('   ✅ Reserva confirmada en base de datos');
    } else {
      console.log('   ❌ Reserva NO encontrada en base de datos');
    }

    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('   Detalles:', error.response.data.details);
    }
  }
}

// Ejecutar la prueba
probarFlujoReservas();