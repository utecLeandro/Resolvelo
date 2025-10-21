const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testReservasActivasEHistorial() {
  try {
    console.log('🧪 === PRUEBA DE RESERVAS ACTIVAS E HISTORIAL ===\n');

    // 1. Login como propietario (Federico)
    console.log('1. 🔐 Iniciando sesión como propietario...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'gtbump2012@gmail.com',
      password: 'FedericoTest2024!'
    });
    
    const token = loginResponse.data.access_token;
    console.log('   ✅ Login exitoso');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Probar endpoint de reservas activas
    console.log('\n2. 📋 Probando endpoint de reservas activas...');
    try {
      const reservasActivasResponse = await axios.get(
        `${BASE_URL}/usuarios/reservas/mis-reservas-activas`,
        { headers }
      );
      
      console.log('   ✅ Endpoint de reservas activas funciona');
      console.log(`   📊 Reservas activas encontradas: ${reservasActivasResponse.data.count || 0}`);
      
      if (reservasActivasResponse.data.data && reservasActivasResponse.data.data.length > 0) {
        console.log('   📋 Primeras reservas activas:');
        reservasActivasResponse.data.data.slice(0, 2).forEach((reserva, index) => {
          console.log(`      ${index + 1}. ${reserva.publicacion?.titulo} - Estado: ${reserva.estado}`);
          console.log(`         Fechas: ${new Date(reserva.fechaInicio).toLocaleDateString()} - ${new Date(reserva.fechaFin).toLocaleDateString()}`);
          console.log(`         Arrendatario: ${reserva.usuario?.nombre} ${reserva.usuario?.apellido}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error en endpoint de reservas activas:', error.response?.data?.message || error.message);
    }

    // 3. Probar endpoint de historial
    console.log('\n3. 📚 Probando endpoint de historial de reservas...');
    try {
      const historialResponse = await axios.get(
        `${BASE_URL}/usuarios/reservas/mi-historial-reservas`,
        { headers }
      );
      
      console.log('   ✅ Endpoint de historial funciona');
      console.log(`   📊 Reservas en historial: ${historialResponse.data.count || 0}`);
      
      if (historialResponse.data.data && historialResponse.data.data.length > 0) {
        console.log('   📋 Primeras reservas del historial:');
        historialResponse.data.data.slice(0, 2).forEach((reserva, index) => {
          console.log(`      ${index + 1}. ${reserva.publicacion?.titulo} - Estado: ${reserva.estado}`);
          console.log(`         Fechas: ${new Date(reserva.fechaInicio).toLocaleDateString()} - ${new Date(reserva.fechaFin).toLocaleDateString()}`);
          console.log(`         Arrendatario: ${reserva.usuario?.nombre} ${reserva.usuario?.apellido}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error en endpoint de historial:', error.response?.data?.message || error.message);
    }

    // 4. Verificar estructura de respuesta
    console.log('\n4. 🔍 Verificando estructura de respuestas...');
    
    // Verificar que ambos endpoints devuelvan la estructura esperada
    const reservasActivasResponse = await axios.get(
      `${BASE_URL}/usuarios/reservas/mis-reservas-activas`,
      { headers }
    );
    
    const historialResponse = await axios.get(
      `${BASE_URL}/usuarios/reservas/mi-historial-reservas`,
      { headers }
    );

    console.log('   ✅ Estructura de respuesta de reservas activas:');
    console.log(`      - success: ${reservasActivasResponse.data.success}`);
    console.log(`      - data: ${Array.isArray(reservasActivasResponse.data.data) ? 'Array' : 'No es array'}`);
    console.log(`      - count: ${reservasActivasResponse.data.count}`);
    console.log(`      - timestamp: ${reservasActivasResponse.data.timestamp ? 'Presente' : 'Ausente'}`);

    console.log('   ✅ Estructura de respuesta de historial:');
    console.log(`      - success: ${historialResponse.data.success}`);
    console.log(`      - data: ${Array.isArray(historialResponse.data.data) ? 'Array' : 'No es array'}`);
    console.log(`      - count: ${historialResponse.data.count}`);
    console.log(`      - timestamp: ${historialResponse.data.timestamp ? 'Presente' : 'Ausente'}`);

    console.log('\n🎉 === PRUEBA COMPLETADA EXITOSAMENTE ===');

  } catch (error) {
    console.error('❌ Error general en la prueba:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testReservasActivasEHistorial();