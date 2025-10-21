const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testFrontendBackend() {
  try {
    console.log('🔧 Probando comunicación frontend-backend...');
    
    // 1. Login para obtener token
    console.log('1. Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'Test123@'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso, token obtenido');
    console.log('🔑 Token (primeros 50 chars):', token.substring(0, 50) + '...');
    
    // 2. Probar endpoint con token
    const reservaId = 'cmh05wkgs0005umr85c4qfjom';
    console.log(`2. Probando endpoint con token...`);
    
    // Simular la llamada exacta que hace el frontend
    const frontendResponse = await axios.get(
      `${BASE_URL}/api/usuarios/reservas/${reservaId}`,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      }
    );
    
    console.log('✅ Respuesta del endpoint:');
    console.log('📊 Status:', frontendResponse.status);
    console.log('📋 Headers:', frontendResponse.headers);
    console.log('💾 Data:', JSON.stringify(frontendResponse.data, null, 2));
    console.log('🔍 Tipo de data:', typeof frontendResponse.data);
    console.log('🔍 Tiene success?', 'success' in frontendResponse.data);
    console.log('🔍 Tiene data?', 'data' in frontendResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
  }
}

testFrontendBackend();