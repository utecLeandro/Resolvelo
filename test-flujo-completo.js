const axios = require('axios');

// API_BASE configurable vía entorno; por defecto usa el backend dist en 127.0.0.1:3006
const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3006/api').trim();

// Función para hacer login
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    return null;
  }
}

// Función para obtener información del usuario autenticado
async function obtenerInfoUsuario(token) {
  try {
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener info del usuario:', error.response?.data || error.message);
    return null;
  }
}

// Función para obtener solicitudes pendientes
async function obtenerSolicitudesPendientes(token) {
  try {
    const response = await axios.get(`${API_BASE}/usuarios/reservas/mis-solicitudes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error.response?.data || error.message);
    return [];
  }
}

// Función para obtener mis reservas
async function obtenerMisReservas(token) {
  try {
    const response = await axios.get(`${API_BASE}/usuarios/reservas/mis-reservas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error al obtener mis reservas:', error.response?.data || error.message);
    return [];
  }
}

// Función para obtener publicaciones (paginadas) y filtrar por propietario si se requiere
async function obtenerPublicaciones(token, page = 1, limit = 20) {
  try {
    // Algunos backends no aceptan paginación por query; usamos la ruta base
    const response = await axios.get(`${API_BASE}/publicaciones`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = response.data.data || response.data;
    // Normalizamos por si la API devuelve { data, meta }
    return Array.isArray(data) ? data : (data.items || []);
  } catch (error) {
    console.error('Error al obtener publicaciones:', error.response?.data || error.message);
    return [];
  }
}

// Función para crear una reserva
async function crearReserva(token, datosReserva) {
  try {
    const response = await axios.post(`${API_BASE}/usuarios/reservas/crear`, datosReserva, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear reserva:', error.response?.data || error.message);
    return null;
  }
}

// Función para aceptar una solicitud
async function aceptarSolicitud(token, reservaId) {
  try {
    const response = await axios.patch(`${API_BASE}/usuarios/reservas/${reservaId}/aceptar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al aceptar solicitud:', error.response?.data || error.message);
    return null;
  }
}

// Función para rechazar una solicitud
async function rechazarSolicitud(token, reservaId) {
  try {
    const response = await axios.patch(`${API_BASE}/usuarios/reservas/${reservaId}/rechazar`, {
      motivoRechazo: 'Fechas no disponibles - Prueba automatizada'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al rechazar solicitud:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🧪 Iniciando pruebas del flujo completo de reservas...\n');

  // 1. Login de Federico (propietario)
  console.log('1. Login de Federico (propietario)...');
  const tokenFederico = await login('gtbump2012@gmail.com', 'FedericoTest2024!');
  if (!tokenFederico) {
    console.log('❌ Error en login de Federico');
    return;
  }
  console.log('✅ Federico logueado exitosamente\n');

  // 2. Login de María (arrendataria)
  console.log('2. Login de María (arrendataria)...');
  const tokenMaria = await login('maria@test.com', 'MariaTest2024!');
  if (!tokenMaria) {
    console.log('❌ Error en login de María');
    return;
  }
  console.log('✅ María logueada exitosamente\n');

  // 3. Obtener información de los usuarios
  console.log('3. Obteniendo información de los usuarios...');
  const infoFederico = await obtenerInfoUsuario(tokenFederico);
  const infoMaria = await obtenerInfoUsuario(tokenMaria);
  
  if (!infoFederico || !infoMaria) {
    console.log('❌ Error al obtener información de los usuarios');
    return;
  }
  console.log(`✅ Información obtenida - Federico: ${infoFederico.nombre} ${infoFederico.apellido}, María: ${infoMaria.nombre} ${infoMaria.apellido}\n`);

  // 4. María crea dos nuevas reservas
  console.log('4. María crea dos nuevas reservas...');

  // Obtener publicaciones disponibles y elegir una del propietario Federico
  const publicaciones = await obtenerPublicaciones(tokenMaria, 1, 50);
  const publicacionFederico = publicaciones.find(p => {
    // Algunos backends devuelven p.propietarioId directamente; otros devuelven p.propietario?.id
    return p.propietarioId || (p.propietario && p.propietario.email === 'gtbump2012@gmail.com');
  });

  if (!publicacionFederico) {
    console.log('❌ No se encontró una publicación de Federico en la lista');
    return;
  }

  const publicacion = publicacionFederico;

  const precioTotal = publicacion.precioPorDia * 2;
  const comisionPlataforma = Math.round(precioTotal * 0.1);

  // Primera reserva
  const datosReserva1 = {
    usuarioId: infoMaria.id,
    publicacionId: publicacion.id,
    propietarioId: publicacion.propietarioId || (publicacion.propietario?.id),
    fechaInicio: '2026-06-15',
    fechaFin: '2026-06-17',
    precioTotal: precioTotal,
    comisionPlataforma: comisionPlataforma,
    tipoEntrega: 'RETIRO',
    direccionEntrega: 'Dirección de retiro',
    telefonoContacto: '987654321',
    notasUsuario: 'Primera reserva de prueba'
  };

  // Segunda reserva
  const datosReserva2 = {
    usuarioId: infoMaria.id,
    publicacionId: publicacion.id,
    propietarioId: publicacion.propietarioId || (publicacion.propietario?.id),
    fechaInicio: '2026-07-15',
    fechaFin: '2026-07-17',
    precioTotal: precioTotal,
    comisionPlataforma: comisionPlataforma,
    tipoEntrega: 'RETIRO',
    direccionEntrega: 'Dirección de retiro',
    telefonoContacto: '987654321',
    notasUsuario: 'Segunda reserva de prueba'
  };

  const reserva1 = await crearReserva(tokenMaria, datosReserva1);
  const reserva2 = await crearReserva(tokenMaria, datosReserva2);

  if (!reserva1 || !reserva2) {
    console.log('❌ Error al crear las reservas');
    return;
  }

  console.log(`✅ Primera reserva creada: ${reserva1?.data?.id || reserva1?.id || 'ID no disponible'}`);
  console.log(`✅ Segunda reserva creada: ${reserva2?.data?.id || reserva2?.id || 'ID no disponible'}\n`);

  // 5. Verificar solicitudes pendientes de Federico
  console.log('5. Verificando solicitudes pendientes de Federico...');
  const solicitudesPendientes = await obtenerSolicitudesPendientes(tokenFederico);
  console.log(`📋 Federico tiene ${solicitudesPendientes.length} solicitudes pendientes\n`);

  // 6. Federico acepta la primera solicitud
  console.log('6. Federico acepta la primera solicitud...');
  const idReserva1 = reserva1?.data?.id || reserva1?.id;
  const resultadoAceptar = await aceptarSolicitud(tokenFederico, idReserva1);
  if (resultadoAceptar) {
    console.log('✅ Primera solicitud aceptada exitosamente\n');
  } else {
    console.log('❌ Error al aceptar la primera solicitud\n');
  }

  // 7. Federico rechaza la segunda solicitud
  console.log('7. Federico rechaza la segunda solicitud...');
  const idReserva2 = reserva2?.data?.id || reserva2?.id;
  const resultadoRechazar = await rechazarSolicitud(tokenFederico, idReserva2);
  if (resultadoRechazar) {
    console.log('✅ Segunda solicitud rechazada exitosamente\n');
  } else {
    console.log('❌ Error al rechazar la segunda solicitud\n');
  }

  // 8. Verificar estado final de las reservas de María
  console.log('8. Verificando estado final de las reservas de María...');
  const reservasFinales = await obtenerMisReservas(tokenMaria);
  console.log(`📋 María tiene ${reservasFinales.length} reservas`);
  
  const reserva1Final = reservasFinales.find(r => r.id === reserva1.id);
  const reserva2Final = reservasFinales.find(r => r.id === reserva2.id);
  
  if (reserva1Final) {
    console.log(`   - Reserva 1 (${reserva1.id}): ${reserva1Final.estado}`);
  }
  if (reserva2Final) {
    console.log(`   - Reserva 2 (${reserva2.id}): ${reserva2Final.estado}`);
  }

  // 9. Verificar solicitudes pendientes finales de Federico
  console.log('\n9. Verificando solicitudes pendientes finales de Federico...');
  const solicitudesFinales = await obtenerSolicitudesPendientes(tokenFederico);
  console.log(`📋 Federico tiene ${solicitudesFinales.length} solicitudes pendientes\n`);

  console.log('🎉 Pruebas del flujo completo completadas!');
}

main().catch(console.error);