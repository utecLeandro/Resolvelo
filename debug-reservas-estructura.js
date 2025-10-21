const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugReservas() {
  try {
    console.log('🔍 Verificando estructura de respuesta de reservas...');

    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'Test123@'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso');

    // 2. Obtener reservas
    const reservasResponse = await axios.get(`${BASE_URL}/api/usuarios/reservas/mis-reservas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📄 Respuesta completa:', JSON.stringify(reservasResponse.data, null, 2));
    console.log('📄 Tipo de datos:', typeof reservasResponse.data);
    console.log('📄 Es array:', Array.isArray(reservasResponse.data));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugReservas();