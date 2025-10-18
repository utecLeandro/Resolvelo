/**
 * Script para probar la protección JWT en rutas protegidas
 * Verifica que las rutas requieren autenticación válida
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

// Función para probar acceso sin token
async function testSinToken() {
  console.log('\n🔒 === PRUEBAS SIN TOKEN JWT ===');
  
  const rutasProtegidas = [
    { method: 'GET', path: '/api/usuarios/reservas/listar', description: 'Listar reservas' },
    { method: 'POST', path: '/api/usuarios/reservas/crear', description: 'Crear reserva' },
    { method: 'GET', path: '/api/usuarios/reservas/123', description: 'Obtener reserva por ID' },
    { method: 'PATCH', path: '/api/usuarios/reservas/123', description: 'Actualizar reserva' },
    { method: 'PATCH', path: '/api/usuarios/reservas/123/cancelar', description: 'Cancelar reserva' },
    { method: 'POST', path: '/api/publicaciones', description: 'Crear publicación' },
    { method: 'GET', path: '/api/publicaciones/mis-publicaciones', description: 'Mis publicaciones' },
    { method: 'PATCH', path: '/api/publicaciones/123', description: 'Actualizar publicación' },
    { method: 'DELETE', path: '/api/publicaciones/123', description: 'Eliminar publicación' }
  ];

  for (const ruta of rutasProtegidas) {
    try {
      const options = {
        hostname: BASE_URL,
        port: PORT,
        path: ruta.path,
        method: ruta.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await makeRequest(options, ruta.method === 'POST' || ruta.method === 'PATCH' ? {} : null);
      
      if (response.statusCode === 401) {
        console.log(`✅ ${ruta.description}: Correctamente protegida (401 Unauthorized)`);
      } else {
        console.log(`❌ ${ruta.description}: NO protegida (${response.statusCode})`);
        console.log(`   Respuesta: ${JSON.stringify(response.body)}`);
      }
    } catch (error) {
      console.log(`⚠️  ${ruta.description}: Error en petición - ${error.message}`);
    }
  }
}

// Función para probar acceso con token inválido
async function testTokenInvalido() {
  console.log('\n🔒 === PRUEBAS CON TOKEN INVÁLIDO ===');
  
  const tokenInvalido = 'Bearer token_invalido_123';
  
  const rutasProtegidas = [
    { method: 'GET', path: '/api/usuarios/reservas/listar', description: 'Listar reservas' },
    { method: 'GET', path: '/api/publicaciones/mis-publicaciones', description: 'Mis publicaciones' }
  ];

  for (const ruta of rutasProtegidas) {
    try {
      const options = {
        hostname: BASE_URL,
        port: PORT,
        path: ruta.path,
        method: ruta.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenInvalido
        }
      };

      const response = await makeRequest(options);
      
      if (response.statusCode === 401) {
        console.log(`✅ ${ruta.description}: Token inválido rechazado correctamente (401)`);
      } else {
        console.log(`❌ ${ruta.description}: Token inválido aceptado (${response.statusCode})`);
        console.log(`   Respuesta: ${JSON.stringify(response.body)}`);
      }
    } catch (error) {
      console.log(`⚠️  ${ruta.description}: Error en petición - ${error.message}`);
    }
  }
}

// Función para probar acceso con token válido
async function testTokenValido() {
  console.log('\n🔒 === PRUEBAS CON TOKEN VÁLIDO ===');
  
  // Primero hacer login para obtener token válido
  const loginOptions = {
    hostname: BASE_URL,
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginData = {
    email: 'maria@test.com',
    password: 'MariaTest2024!'
  };

  try {
    const loginResponse = await makeRequest(loginOptions, loginData);
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ No se pudo obtener token válido para las pruebas');
      console.log(`   Login falló: ${JSON.stringify(loginResponse.body)}`);
      return;
    }

    const token = `Bearer ${loginResponse.body.access_token}`;
    console.log('✅ Token válido obtenido');

    // Probar rutas protegidas con token válido
    const rutasProtegidas = [
      { method: 'GET', path: '/api/usuarios/reservas/listar', description: 'Listar reservas' },
      { method: 'GET', path: '/api/publicaciones/mis-publicaciones', description: 'Mis publicaciones' }
    ];

    for (const ruta of rutasProtegidas) {
      try {
        const options = {
          hostname: BASE_URL,
          port: PORT,
          path: ruta.path,
          method: ruta.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        };

        const response = await makeRequest(options);
        
        if (response.statusCode === 200) {
          console.log(`✅ ${ruta.description}: Acceso autorizado correctamente (200)`);
        } else {
          console.log(`⚠️  ${ruta.description}: Respuesta inesperada (${response.statusCode})`);
          console.log(`   Respuesta: ${JSON.stringify(response.body)}`);
        }
      } catch (error) {
        console.log(`⚠️  ${ruta.description}: Error en petición - ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ Error en login: ${error.message}`);
  }
}

// Función principal
async function main() {
  console.log('🔐 INICIANDO PRUEBAS DE PROTECCIÓN JWT');
  console.log('=====================================');
  
  try {
    await testSinToken();
    await testTokenInvalido();
    await testTokenValido();
    
    console.log('\n✅ PRUEBAS DE PROTECCIÓN JWT COMPLETADAS');
    console.log('=========================================');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Ejecutar las pruebas
main();