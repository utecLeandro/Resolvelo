/**
 * Script para verificar las publicaciones disponibles
 */

const http = require('http');

// Configuración
const BASE_URL = 'localhost';
const PORT = 3000;

// Función para hacer peticiones HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Función principal
async function main() {
  console.log('🔍 VERIFICANDO PUBLICACIONES DISPONIBLES');
  console.log('========================================');
  
  try {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: '/api/publicaciones',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);
    
    console.log(`Status: ${response.statusCode}`);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.statusCode === 200) {
      const publicaciones = response.body.data || response.body;
      console.log(`\n📊 Total de publicaciones: ${Array.isArray(publicaciones) ? publicaciones.length : 'No es array'}`);
      
      if (Array.isArray(publicaciones) && publicaciones.length > 0) {
        console.log('\n📋 Publicaciones encontradas:');
        publicaciones.forEach((pub, index) => {
          console.log(`${index + 1}. ${pub.titulo} (ID: ${pub.id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
main();