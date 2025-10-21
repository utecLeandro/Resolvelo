const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpointSolicitudes() {
  try {
    console.log('🔍 Probando endpoint de solicitudes...');
    
    // Paso 1: Login para obtener token
    console.log('📝 Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'federico@test.com',
      password: 'Federico123!'
    });

    if (!loginResponse.data.access_token) {
      console.log('❌ No se pudo obtener el token de acceso');
      return;
    }

    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso, token obtenido');

    // Paso 2: Probar endpoint de solicitudes
    console.log('🔍 Probando endpoint /api/usuarios/reservas/todas-mis-solicitudes...');
    const solicitudesResponse = await axios.get(`${BASE_URL}/api/usuarios/reservas/todas-mis-solicitudes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Respuesta del endpoint:');
    console.log('Status:', solicitudesResponse.status);
    console.log('Data:', JSON.stringify(solicitudesResponse.data, null, 2));

    if (Array.isArray(solicitudesResponse.data)) {
      console.log(`📊 Total de solicitudes: ${solicitudesResponse.data.length}`);
      
      const conteos = {
        PENDIENTE: 0,
        CONFIRMADA: 0,
        RECHAZADA: 0
      };

      solicitudesResponse.data.forEach(s => {
        conteos[s.estado]++;
        console.log(`  - ${s.estado}: "${s.publicacion?.titulo || 'Sin título'}" por ${s.usuario?.email || 'Sin email'}`);
      });

      console.log('\n📈 Conteos por estado:');
      console.log(`  Pendientes: ${conteos.PENDIENTE}`);
      console.log(`  Confirmadas: ${conteos.CONFIRMADA}`);
      console.log(`  Rechazadas: ${conteos.RECHAZADA}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    }
  }
}

testEndpointSolicitudes();