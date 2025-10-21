const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugPublicaciones() {
  try {
    console.log('🔍 Verificando estructura de respuesta de publicaciones...');

    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'Test123@'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso');

    // 2. Obtener publicaciones
    const publicacionesResponse = await axios.get(`${BASE_URL}/api/publicaciones`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📄 Respuesta completa:', JSON.stringify(publicacionesResponse.data, null, 2));
    console.log('📄 Tipo de datos:', typeof publicacionesResponse.data);
    console.log('📄 Es array:', Array.isArray(publicacionesResponse.data));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugPublicaciones();