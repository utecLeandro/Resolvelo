const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testActivarReserva() {
  try {
    console.log('🧪 Probando endpoint de activación de reserva...');

    // 1. Login
    console.log('\n1. Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'Test123@'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso');

    // 2. Obtener reservas del usuario
    console.log('\n2. Obteniendo reservas...');
    const reservasResponse = await axios.get(`${BASE_URL}/api/usuarios/reservas/mis-reservas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const reservas = reservasResponse.data.data || reservasResponse.data;
    console.log(`✅ Encontradas ${reservas.length} reservas`);

    if (reservas.length === 0) {
      console.log('❌ No hay reservas para probar');
      return;
    }

    // Buscar una reserva en estado CONFIRMADA
    const reservaConfirmada = reservas.find(r => r.estado === 'CONFIRMADA');
    if (!reservaConfirmada) {
      console.log('❌ No se encontró ninguna reserva en estado CONFIRMADA');
      console.log('Estados disponibles:', reservas.map(r => `${r.id}: ${r.estado}`));
      return;
    }

    console.log(`✅ Reserva encontrada: ${reservaConfirmada.id} (Estado: ${reservaConfirmada.estado})`);

    // 3. Activar la reserva
    console.log('\n3. Activando reserva...');
    const activarResponse = await axios.post(
      `${BASE_URL}/api/usuarios/reservas/${reservaConfirmada.id}/activar`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Reserva activada exitosamente');
    console.log('📄 Respuesta:', activarResponse.data);

    // 4. Verificar cambio de estado
    console.log('\n4. Verificando cambio de estado...');
    const reservaActualizadaResponse = await axios.get(
      `${BASE_URL}/api/usuarios/reservas/mis-reservas`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const reservasActualizadas = reservaActualizadaResponse.data.data || reservaActualizadaResponse.data;
    const reservaActualizada = reservasActualizadas.find(r => r.id === reservaConfirmada.id);
    if (reservaActualizada && reservaActualizada.estado === 'EN_CURSO') {
      console.log('✅ Estado actualizado correctamente a EN_CURSO');
    } else {
      console.log(`❌ Estado no cambió. Estado actual: ${reservaActualizada?.estado || 'No encontrada'}`);
    }

    console.log('\n🎉 Prueba completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testActivarReserva();