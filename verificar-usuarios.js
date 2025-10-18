const http = require('http');

// Función para realizar solicitudes HTTP
function hacerSolicitud(options, data = null) {
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
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Función para obtener usuarios
async function obtenerUsuarios() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/usuarios',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await hacerSolicitud(options);
    console.log('👥 Usuarios Response:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('✅ Usuarios obtenidos exitosamente');
      console.log('📊 Usuarios disponibles:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Error al obtener usuarios:', response.body);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🔍 Verificando usuarios disponibles...\n');
  await obtenerUsuarios();
}

// Ejecutar la verificación
main().catch(console.error);