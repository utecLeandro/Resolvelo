const axios = require('axios');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWd6azEzYjcwMDAwZHJ3MTJpY3hrMXc2IiwiZW1haWwiOiJmZWRlcmljb0B0ZXN0LmNvbSIsImlhdCI6MTc2MTAwNjQzOSwiZXhwIjoxNzYxMDkyODM5fQ.T9OpYrvU-Ln83oYgUZaT2z0s3Wc3rjRm6q0M8jSTFj4';

async function testEndpoint() {
  try {
    // Probar GET en el endpoint de imágenes
    const response = await axios.get('http://localhost:3000/api/imagenes/publicacion/cmgzlg2ll0005qzm8n1oy1pgy', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    console.log('✅ Endpoint GET funciona:', response.status);
    console.log('Respuesta:', response.data);
  } catch (error) {
    console.log('❌ Error en GET:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // Probar POST en el endpoint de múltiples imágenes (sin archivos para ver si la ruta existe)
    const response = await axios.post('http://localhost:3000/api/imagenes/publicacion/cmgzlg2ll0005qzm8n1oy1pgy/multiples', {}, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Endpoint POST funciona:', response.status);
  } catch (error) {
    console.log('❌ Error en POST:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.log('✅ La ruta existe pero falta el archivo (error 400 esperado)');
    }
  }
}

testEndpoint();