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

// Función para hacer login y obtener token
async function hacerLogin() {
  const loginData = {
    email: 'maria@test.com',
    password: 'MariaTest2024!'
  };

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(loginData))
    }
  };

  try {
    const response = await hacerSolicitud(options, loginData);
    console.log('🔐 Login Response:', response.statusCode);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Login exitoso');
      return response.body.access_token;
    } else {
      console.log('❌ Login falló:', response.body);
      return null;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

// Función para probar el endpoint mis-solicitudes
async function probarMisSolicitudes(token) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/usuarios/reservas/mis-solicitudes',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await hacerSolicitud(options);
    console.log('\n📋 Mis Solicitudes Response:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('✅ Endpoint mis-solicitudes funciona correctamente');
      console.log('📊 Datos recibidos:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Error en mis-solicitudes:', response.body);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error en mis-solicitudes:', error.message);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🧪 Iniciando pruebas del endpoint mis-solicitudes...\n');

  // 1. Hacer login
  console.log('1️⃣ Haciendo login...');
  const token = await hacerLogin();
  
  if (!token) {
    console.log('❌ No se pudo obtener token de autenticación');
    return;
  }

  console.log('✅ Token obtenido exitosamente');

  // 2. Probar endpoint mis-solicitudes
  console.log('\n2️⃣ Probando endpoint mis-solicitudes...');
  const solicitudesResponse = await probarMisSolicitudes(token);

  if (solicitudesResponse) {
    console.log('\n🎉 Pruebas completadas exitosamente');
  } else {
    console.log('\n❌ Las pruebas fallaron');
  }
}

// Ejecutar las pruebas
main().catch(console.error);