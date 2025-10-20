const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Credenciales de prueba
const FEDERICO_CREDENTIALS = {
  email: 'gtbump2012@gmail.com',
  password: 'FedericoTest2024!'
};

const MARIA_CREDENTIALS = {
  email: 'maria@test.com', 
  password: 'MariaTest2024!'
};

// Función para hacer login
async function login(credentials) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return response.data.access_token;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    return null;
  }
}

// Función para obtener solicitudes pendientes
async function obtenerSolicitudesPendientes(token) {
  try {
    const response = await axios.get(`${API_BASE}/usuarios/reservas/mis-solicitudes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes:', error.response?.data || error.message);
    return null;
  }
}

// Función para obtener reservas del arrendatario
async function obtenerReservasArrendatario(token) {
  try {
    const response = await axios.get(`${API_BASE}/usuarios/reservas/mis-reservas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener reservas:', error.response?.data || error.message);
    return null;
  }
}

// Función para obtener información del usuario autenticado
async function obtenerUsuarioAutenticado(token) {
  try {
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil:', error.response?.data || error.message);
    return null;
  }
}

// Función para obtener información de una publicación
async function obtenerPublicacion(token, publicacionId) {
  try {
    const response = await axios.get(`${API_BASE}/publicaciones/${publicacionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener publicación:', error.response?.data || error.message);
    return null;
  }
}

// Función para crear una nueva reserva
async function crearReserva(token, publicacionId, usuarioId) {
  try {
    // Obtener información de la publicación para calcular precios
    const publicacion = await obtenerPublicacion(token, publicacionId);
    if (!publicacion || !publicacion.id) {
      throw new Error('No se pudo obtener información de la publicación');
    }

    const precioPorDia = publicacion.precioPorDia;
    const dias = 3; // 2025-10-25 a 2025-10-27 = 3 días
    const precioTotal = precioPorDia * dias;
    const comisionPlataforma = precioTotal * 0.1; // 10% de comisión

    const reservaData = {
      usuarioId: usuarioId,
      publicacionId: publicacionId,
      propietarioId: publicacion.propietarioId,
      fechaInicio: '2025-10-25',
      fechaFin: '2025-10-27',
      precioTotal: precioTotal,
      comisionPlataforma: comisionPlataforma,
      tipoEntrega: 'RETIRO',
      telefonoContacto: '+57 300 123 4567',
      notasUsuario: 'Necesito la guitarra para un evento especial'
    };

    const response = await axios.post(`${API_BASE}/usuarios/reservas/crear`, reservaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error.response?.data || error.message);
    return null;
  }
}

// Función para rechazar una solicitud
async function rechazarSolicitud(token, reservaId) {
  try {
    const response = await axios.patch(`${API_BASE}/usuarios/reservas/${reservaId}/rechazar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Función principal
async function main() {
  console.log('🧪 Iniciando pruebas de rechazar solicitudes...\n');

  // 1. Login de Federico (propietario)
  console.log('1. Login de Federico (propietario)...');
  const federicoToken = await login(FEDERICO_CREDENTIALS);
  if (!federicoToken) {
    console.log('❌ Error al hacer login de Federico');
    return;
  }
  console.log('✅ Federico logueado exitosamente\n');

  // 2. Login de María (arrendataria)
  console.log('2. Login de María (arrendataria)...');
  const mariaToken = await login(MARIA_CREDENTIALS);
  if (!mariaToken) {
    console.log('❌ Error al hacer login de María');
    return;
  }
  console.log('✅ María logueada exitosamente\n');

  // 3. Obtener información de María
  console.log('3. Obteniendo información de María...');
  const mariaInfo = await obtenerUsuarioAutenticado(mariaToken);
  if (!mariaInfo) {
    console.log('❌ Error al obtener información de María');
    return;
  }
  console.log('✅ Información de María obtenida exitosamente\n');

  // 4. María crea una nueva reserva
  console.log('4. María crea una nueva reserva...');
  const publicacionId = 'cmgxzc40c000dn4c31q3loiai'; // ID del teclado de Federico (Yamaha PSR-E373)
  const nuevaReserva = await crearReserva(mariaToken, publicacionId, mariaInfo.id);
  if (!nuevaReserva || !nuevaReserva.success) {
    console.log('❌ Error al crear nueva reserva');
    return;
  }
  console.log('✅ Nueva reserva creada exitosamente');
  console.log(`   ID de reserva: ${nuevaReserva.data.id}\n`);

  // 5. Obtener solicitudes pendientes de Federico
  console.log('5. Obteniendo solicitudes pendientes de Federico...');
  const solicitudes = await obtenerSolicitudesPendientes(federicoToken);
  if (!solicitudes || !solicitudes.success) {
    console.log('❌ Error al obtener solicitudes pendientes');
    return;
  }
  
  console.log(`📋 Federico tiene ${solicitudes.data.length} solicitudes pendientes`);
  if (solicitudes.data.length > 0) {
    console.log('Solicitudes:');
    solicitudes.data.forEach((solicitud, index) => {
      console.log(`  ${index + 1}. ID: ${solicitud.id}, Estado: ${solicitud.estado}, Arrendatario: ${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`);
    });
  }
  console.log('');

  // 6. Obtener reservas de María (antes de rechazar)
  console.log('6. Obteniendo reservas de María (antes de la acción)...');
  const reservasAntes = await obtenerReservasArrendatario(mariaToken);
  if (reservasAntes && reservasAntes.success) {
    console.log(`📋 María tiene ${reservasAntes.data.length} reservas`);
    console.log('Reservas de María (antes):');
    reservasAntes.data.forEach((reserva, index) => {
      console.log(`  ${index + 1}. ID: ${reserva.id}, Estado: ${reserva.estado}, Publicación: ${reserva.publicacion.titulo}`);
    });
  }
  console.log('');

  // 7. Federico rechaza la primera solicitud pendiente
  if (solicitudes.data.length > 0) {
    const reservaId = solicitudes.data[0].id;
    console.log(`7. Federico rechaza la solicitud ${reservaId}...`);
    
    try {
      const resultado = await rechazarSolicitud(federicoToken, reservaId);
      console.log('✅ Solicitud rechazada exitosamente');
    } catch (error) {
      console.log('Error al rechazar solicitud:', error);
      console.log('❌ Error al rechazar solicitud');
    }
    console.log('');

    // 8. Verificar reservas de María después de rechazar
    console.log('8. Verificando reservas de María después de rechazar...');
    const reservasDespues = await obtenerReservasArrendatario(mariaToken);
    if (reservasDespues && reservasDespues.success) {
      console.log(`📋 María tiene ${reservasDespues.data.length} reservas`);
      console.log('Reservas de María (después):');
      reservasDespues.data.forEach((reserva, index) => {
        console.log(`  ${index + 1}. ID: ${reserva.id}, Estado: ${reserva.estado}, Publicación: ${reserva.publicacion.titulo}`);
      });
      
      // Verificar que el estado cambió a RECHAZADA
      const reservaRechazada = reservasDespues.data.find(r => r.id === reservaId);
      if (reservaRechazada && reservaRechazada.estado === 'RECHAZADA') {
        console.log('✅ La reserva cambió correctamente a estado RECHAZADA');
      } else {
        console.log(`⚠️  La reserva tiene estado ${reservaRechazada?.estado}, se esperaba RECHAZADA`);
      }
    }
    console.log('');

    // 9. Verificar solicitudes pendientes de Federico después de la acción
    console.log('9. Verificando solicitudes pendientes de Federico después de la acción...');
    const solicitudesDespues = await obtenerSolicitudesPendientes(federicoToken);
    if (solicitudesDespues && solicitudesDespues.success) {
      console.log(`📋 Federico tiene ${solicitudesDespues.data.length} solicitudes pendientes`);
      if (solicitudesDespues.data.length > 0) {
        console.log('Solicitudes restantes:');
        solicitudesDespues.data.forEach((solicitud, index) => {
          console.log(`  ${index + 1}. ID: ${solicitud.id}, Estado: ${solicitud.estado}, Arrendatario: ${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`);
        });
      }
    }
  }

  console.log('\n🎉 Pruebas completadas!');
}

// Ejecutar las pruebas
main().catch(console.error);