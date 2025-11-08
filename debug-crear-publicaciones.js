/**
 * Script de debug para crear publicaciones
 */

const http = require('http');

// Configuración
const BASE_URL = 'localhost';
const PORT = 3000;

// Datos de prueba
const testUser = {
  email: 'test@test.com', // Usuario recién creado
  password: 'Test123@'
};

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

// Función de login
async function login() {
  console.log('🔐 Intentando login con:', testUser.email);
  
  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, testUser);
    console.log('📊 Respuesta login:', {
      statusCode: response.statusCode,
      body: response.body
    });
    
    if (response.statusCode === 200) {
      const token = response.body.access_token;
      console.log('✅ Login exitoso, token obtenido');
      return token;
    } else {
      throw new Error(`Login falló: ${response.statusCode} - ${JSON.stringify(response.body)}`);
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    throw error;
  }
}

// Función para crear publicación
async function crearPublicacion(token, publicacionData) {
  console.log('📝 Creando publicación:', publicacionData.titulo);
  console.log('📋 Datos a enviar:', JSON.stringify(publicacionData, null, 2));
  
  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: '/api/publicaciones',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await makeRequest(options, publicacionData);
    console.log('📊 Respuesta creación:', {
      statusCode: response.statusCode,
      body: response.body
    });
    return response;
  } catch (error) {
    console.error('❌ Error creando publicación:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🔍 DEBUG: CREANDO PUBLICACIONES DE PRUEBA');
  console.log('==========================================');
  
  try {
    // Login
    const token = await login();
    
    // Una publicación simple de prueba
    const publicacion = {
      titulo: 'Guitarra de Prueba',
      descripcion: 'Guitarra para testing del sistema',
      categoria: 'GUITARRAS',
      marca: 'TestMarca',
      modelo: 'TestModelo',
      anioFabricacion: 2020,
      precioPorDia: 25.00,
      precioPorSemana: 150.00,
      direccion: 'Dirección de prueba 123',
      ciudad: 'Lima',
      departamento: 'Lima',
      codigoPostal: '15001',
      estadoEquipo: 'Excelente',
      entregaDomicilio: true,
      retiroLocal: true
    };

    console.log('\n🚀 Creando publicación de prueba...');
    const response = await crearPublicacion(token, publicacion);
    
    if (response.statusCode === 201 || response.statusCode === 200) {
      console.log('✅ Publicación creada exitosamente!');
      console.log('📋 ID:', response.body.data?.id || response.body.id || 'No disponible');
    } else {
      console.log('❌ Error al crear publicación');
      console.log('📋 Detalles del error:', response.body);
    }
    
    // Verificar que se creó listando las publicaciones
    console.log('\n🔍 Verificando publicaciones creadas...');
    const listOptions = {
      hostname: BASE_URL,
      port: PORT,
      path: '/api/publicaciones',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const listResponse = await makeRequest(listOptions);
    console.log('📊 Publicaciones en BD:', {
      statusCode: listResponse.statusCode,
      total: listResponse.body.paginacion?.totalElementos || 0,
      publicaciones: listResponse.body.publicaciones?.length || 0
    });
    
    if (listResponse.body.publicaciones && listResponse.body.publicaciones.length > 0) {
      console.log('📋 Títulos encontrados:');
      listResponse.body.publicaciones.forEach((pub, index) => {
        console.log(`   ${index + 1}. ${pub.titulo} (ID: ${pub.id})`);
      });
    }
    
    console.log('\n✅ DEBUG COMPLETADO');
    console.log('===================');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

// Ejecutar
main();