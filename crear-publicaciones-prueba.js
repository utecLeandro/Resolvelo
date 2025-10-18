/**
 * Script para crear publicaciones de prueba
 */

const http = require('http');

// Configuración
const BASE_URL = 'localhost';
const PORT = 3000;

// Datos de prueba
const testUser = {
  email: 'maria@test.com',
  password: 'MariaTest2024!'
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

// Función para hacer login y obtener token
async function login() {
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
    if (response.statusCode === 200) {
      const token = response.body.access_token;
      console.log('✅ Login exitoso');
      return token;
    } else {
      throw new Error(`Login falló: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    throw error;
  }
}

// Función para crear publicación
async function crearPublicacion(token, publicacionData) {
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
    return response;
  } catch (error) {
    console.error('❌ Error creando publicación:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('📦 CREANDO PUBLICACIONES DE PRUEBA');
  console.log('==================================');
  
  try {
    // Login
    const token = await login();
    
    // Publicaciones de prueba
    const publicaciones = [
      {
        titulo: 'Guitarra Acústica Yamaha',
        descripcion: 'Guitarra acústica en excelente estado, ideal para principiantes y profesionales.',
        categoria: 'GUITARRAS',
        marca: 'Yamaha',
        modelo: 'FG800',
        anioFabricacion: 2020,
        precioPorDia: 25.00,
        precioPorSemana: 150.00,
        direccion: 'Av. Universitaria 1801',
        ciudad: 'Lima',
        departamento: 'Lima',
        codigoPostal: '15088',
        estadoEquipo: 'Excelente',
        entregaDomicilio: true,
        retiroLocal: true
      },
      {
        titulo: 'Piano Digital Casio',
        descripcion: 'Piano digital con 88 teclas pesadas, perfecto para práctica y presentaciones.',
        categoria: 'TECLADOS',
        marca: 'Casio',
        modelo: 'CDP-S110',
        anioFabricacion: 2021,
        precioPorDia: 35.00,
        precioPorSemana: 200.00,
        direccion: 'Jr. de la Unión 1234',
        ciudad: 'Lima',
        departamento: 'Lima',
        codigoPostal: '15001',
        estadoEquipo: 'Muy bueno',
        entregaDomicilio: false,
        retiroLocal: true
      },
      {
        titulo: 'Batería Acústica Pearl',
        descripcion: 'Batería acústica completa con platillos, ideal para ensayos y grabaciones.',
        categoria: 'BATERIAS',
        marca: 'Pearl',
        modelo: 'Export Series',
        anioFabricacion: 2019,
        precioPorDia: 45.00,
        precioPorSemana: 280.00,
        direccion: 'Av. Arequipa 2850',
        ciudad: 'Lima',
        departamento: 'Lima',
        codigoPostal: '15047',
        estadoEquipo: 'Bueno',
        entregaDomicilio: true,
        retiroLocal: true,
        deposito: 100.00
      }
    ];

    console.log(`\nCreando ${publicaciones.length} publicaciones...`);
    
    for (let i = 0; i < publicaciones.length; i++) {
      const publicacion = publicaciones[i];
      console.log(`\n${i + 1}. Creando: ${publicacion.titulo}`);
      
      try {
        const response = await crearPublicacion(token, publicacion);
        
        if (response.statusCode === 201 || response.statusCode === 200) {
          console.log(`   ✅ Creada exitosamente (ID: ${response.body.data?.id || 'N/A'})`);
        } else {
          console.log(`   ❌ Error al crear (${response.statusCode}): ${response.body.message || 'Error desconocido'}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error en petición: ${error.message}`);
      }
    }
    
    console.log('\n✅ PROCESO DE CREACIÓN COMPLETADO');
    console.log('=================================');
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
  }
}

// Ejecutar
main();