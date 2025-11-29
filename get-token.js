const axios = require('axios');

// Usar el backend en el puerto 3001, que es el configurado en .env y en el proxy de Vite
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3001/api';

async function getToken(email = 'maria@test.com', password = 'MariaTest2024!') {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    }, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      timeout: 10000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    console.log('Login OK:', { status: response.status, user: response.data?.user });
    console.log('Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error('Error al obtener token:', {
      status,
      data,
      message: error.message,
    });
    return null;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  getToken();
}