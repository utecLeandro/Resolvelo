/**
 * Script para probar las operaciones CRUD de reservas con autenticación JWT
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

// Simulación de localStorage
const localStorage = {
  data: {},
  setItem(key, value) {
    this.data[key] = value;
  },
  getItem(key) {
    return this.data[key] || null;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// Función para hacer requests HTTP
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Añadir token JWT si está disponible
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
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
async function login() {
  console.log('🔐 Haciendo login...');
  try {
    const response = await makeRequest('POST', '/auth/login', testUser);
    
    if (response.status === 200 && response.data.access_token) {
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      console.log('✅ Login exitoso');
      return token;
    } else {
      console.log('❌ Login falló:', response.status, response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error en login:', error.message);
    return null;
  }
}

// Función para obtener el perfil del usuario
async function obtenerPerfil(token) {
  console.log('👤 Obteniendo perfil del usuario...');
  try {
    const response = await makeRequest('GET', '/auth/profile', null, token);
    
    if (response.status === 200) {
      const usuario = response.data;
      console.log(`✅ Usuario: ${usuario.nombre} ${usuario.apellido} (ID: ${usuario.id})`);
      return usuario;
    } else {
      console.log('❌ Error obteniendo perfil:', response.status, response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error obteniendo perfil:', error.message);
    return null;
  }
}

// Función para obtener publicaciones disponibles
async function obtenerPublicaciones(token) {
  console.log('📋 Obteniendo publicaciones disponibles...');
  try {
    const response = await makeRequest('GET', '/publicaciones', null, token);
    
    if (response.status === 200) {
      const publicaciones = response.data.publicaciones || response.data.data || response.data;
      const paginacion = response.data.paginacion || {};
      const total = paginacion.totalElementos || publicaciones.length;
      console.log(`✅ Se encontraron ${publicaciones.length} publicaciones (Total: ${total})`);
      return publicaciones;
    } else {
      console.log('❌ Error obteniendo publicaciones:', response.status, response.data);
      return [];
    }
  } catch (error) {
    console.log('❌ Error obteniendo publicaciones:', error.message);
    return [];
  }
}

// Función para crear una reserva
async function crearReserva(token, publicacion, usuarioId) {
  console.log('📝 Creando nueva reserva...');
  
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() + 1); // Mañana
  
  const fechaFin = new Date();
  fechaFin.setDate(fechaFin.getDate() + 3); // Pasado mañana
  
  const reservaData = {
    usuarioId: usuarioId,
    publicacionId: publicacion.id,
    propietarioId: publicacion.propietario.id,
    fechaInicio: fechaInicio.toISOString(),
    fechaFin: fechaFin.toISOString(),
    precioTotal: publicacion.precioPorDia * 2,
    comisionPlataforma: (publicacion.precioPorDia * 2) * 0.1,
    tipoEntrega: 'DOMICILIO',
    direccionEntrega: 'Av. Principal 123',
    telefonoContacto: '+51987654321',
    notasUsuario: 'Reserva de prueba desde script'
  };

  try {
    const response = await makeRequest('POST', '/usuarios/reservas/crear', reservaData, token);
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Reserva creada exitosamente');
      const reservaData = response.data.data || response.data;
      console.log('   ID:', reservaData.id || 'No disponible');
      console.log('   Estado:', reservaData.estado || 'No disponible');
      return reservaData;
    } else {
      console.log('❌ Error creando reserva:', response.status, response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creando reserva:', error.message);
    return null;
  }
}

// Función para obtener mis reservas
async function obtenerMisReservas(token) {
  console.log('📋 Obteniendo mis reservas...');
  try {
    const response = await makeRequest('GET', '/usuarios/reservas/listar', null, token);
    
    if (response.status === 200) {
      const reservas = response.data.data || response.data;
      const count = Array.isArray(reservas) ? reservas.length : (response.data.count || 0);
      console.log(`✅ Se encontraron ${count} reservas`);
      return reservas;
    } else {
      console.log('❌ Error obteniendo reservas:', response.status, response.data);
      return [];
    }
  } catch (error) {
    console.log('❌ Error obteniendo reservas:', error.message);
    return [];
  }
}

// Función para actualizar una reserva
async function actualizarReserva(token, reservaId) {
  console.log('✏️ Actualizando reserva...');
  
  const updateData = {
    comentarios: 'Comentarios actualizados desde script de prueba'
  };

  try {
    const response = await makeRequest('PATCH', `/usuarios/reservas/${reservaId}`, updateData, token);
    
    if (response.status === 200) {
      console.log('✅ Reserva actualizada exitosamente');
      return response.data;
    } else {
      console.log('❌ Error actualizando reserva:', response.status, response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error actualizando reserva:', error.message);
    return null;
  }
}

// Función para cancelar una reserva
async function cancelarReserva(token, reservaId) {
  console.log('❌ Cancelando reserva...');
  
  try {
    const response = await makeRequest('PATCH', `/usuarios/reservas/${reservaId}/cancelar`, {}, token);
    
    if (response.status === 200) {
      console.log('✅ Reserva cancelada exitosamente');
      return response.data;
    } else {
      console.log('❌ Error cancelando reserva:', response.status, response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error cancelando reserva:', error.message);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas CRUD de reservas\n');

  // 1. Login
  const token = await login();
  if (!token) {
    console.log('❌ No se pudo obtener token. Terminando pruebas.');
    return;
  }

  console.log('');

  // 2. Obtener perfil del usuario
  const usuario = await obtenerPerfil(token);
  if (!usuario) {
    console.log('❌ No se pudo obtener el perfil del usuario. Terminando pruebas.');
    return;
  }

  console.log('');

  // 3. Obtener publicaciones
  const publicaciones = await obtenerPublicaciones(token);
  if (publicaciones.length === 0) {
    console.log('❌ No hay publicaciones disponibles. Terminando pruebas.');
    return;
  }

  console.log('');

  // 4. Crear reserva
  const primeraPublicacion = publicaciones[0];
  console.log(`📝 Usando publicación: ${primeraPublicacion.titulo} (ID: ${primeraPublicacion.id})`);
  const nuevaReserva = await crearReserva(token, primeraPublicacion, usuario.id);
  
  if (!nuevaReserva) {
    console.log('❌ No se pudo crear reserva. Terminando pruebas.');
    return;
  }

  console.log('');

  // 5. Obtener mis reservas
  await obtenerMisReservas(token);

  console.log('');

  // 6. Actualizar reserva
  await actualizarReserva(token, nuevaReserva.id);

  console.log('');

  // 7. Cancelar reserva
  await cancelarReserva(token, nuevaReserva.id);

  console.log('');

  // 8. Verificar estado final
  console.log('🔍 Verificando estado final...');
  await obtenerMisReservas(token);

  console.log('\n✅ Pruebas CRUD de reservas completadas');
}

// Ejecutar pruebas
main().catch(console.error);