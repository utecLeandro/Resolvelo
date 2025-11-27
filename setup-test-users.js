const axios = require('axios');

// Permite configurar el puerto del backend usando la variable de entorno API_BASE
// Por defecto apunta al backend dist en 127.0.0.1:3006
const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3006/api').trim();

// Función para registrar un usuario
async function registrarUsuario(userData) {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log(`✅ Usuario ${userData.email} registrado exitosamente`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`ℹ️ Usuario ${userData.email} ya existe`);
      return { message: 'Usuario ya existe' };
    }
    console.error(`❌ Error al registrar ${userData.email}:`, error.response?.data || error.message);
    return null;
  }
}

// Función para crear una publicación
async function crearPublicacion(token, publicacionData) {
  try {
    const response = await axios.post(`${API_BASE}/publicaciones`, publicacionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Publicación "${publicacionData.titulo}" creada exitosamente`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al crear publicación:`, error.response?.data || error.message);
    return null;
  }
}

// Función para hacer login
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`❌ Error en login de ${email}:`, error.response?.data || error.message);
    return null;
  }
}

// Función para crear una reserva
async function crearReserva(token, reservaData) {
  try {
    const response = await axios.post(`${API_BASE}/usuarios/reservas/crear`, reservaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Reserva creada exitosamente`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al crear reserva:`, error.response?.data || error.message);
    return null;
  }
}

// Función para obtener el perfil del usuario
async function obtenerPerfil(token) {
  try {
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error al obtener perfil:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Configurando usuarios y datos de prueba...\n');

  // 1. Registrar Federico (propietario)
  console.log('1. Registrando Federico (propietario)...');
  const federico = await registrarUsuario({
    nombre: 'Federico',
    apellido: 'García',
    email: 'federico@test.com',
    password: 'Federico123!',
    telefono: '+51987654321',
    documentoIdentidad: '12345678'
  });

  // 2. Registrar María (arrendataria)
  console.log('2. Registrando María (arrendataria)...');
  const maria = await registrarUsuario({
    nombre: 'María',
    apellido: 'López',
    email: 'maria@test.com',
    password: 'Maria123!',
    telefono: '+51987654322',
    documentoIdentidad: '87654321'
  });

  if (!federico || !maria) {
    console.log('❌ No se pudieron registrar todos los usuarios');
    return;
  }

  // 3. Login de Federico para crear publicaciones
  console.log('\n3. Haciendo login de Federico...');
  const tokenFederico = await login('federico@test.com', 'Federico123!');
  
  if (!tokenFederico) {
    console.log('❌ No se pudo hacer login de Federico');
    return;
  }

  // 4. Crear publicación de Federico
  console.log('4. Creando publicación de guitarra...');
  const publicacion = await crearPublicacion(tokenFederico, {
    titulo: 'Guitarra Acústica Yamaha FG830',
    descripcion: 'Excelente guitarra acústica en perfecto estado, ideal para principiantes y profesionales',
    categoria: 'GUITARRAS',
    marca: 'Yamaha',
    modelo: 'FG830',
    anioFabricacion: 2020,
    precioPorDia: 25.00,
    precioPorSemana: 150.00,
    precioPorMes: 500.00,
    deposito: 100.00,
    diasMinimoAlquiler: 1,
    diasMaximoAlquiler: 30,
    direccion: 'Av. Javier Prado Este 123',
    ciudad: 'San Isidro',
    departamento: 'Lima',
    codigoPostal: '15036',
    entregaDomicilio: true,
    retiroLocal: true,
    estadoEquipo: 'Excelente'
  });

  if (!publicacion) {
    console.log('❌ No se pudo crear la publicación');
    return;
  }

  // 5. Login de María para crear reserva
  console.log('\n5. Haciendo login de María...');
  const tokenMaria = await login('maria@test.com', 'Maria123!');
  
  if (!tokenMaria) {
    console.log('❌ No se pudo hacer login de María');
    return;
  }

  // 6. Crear reserva de María
  console.log('6. Creando reserva de María...');
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() + 1); // Mañana
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + 4); // 4 días después

  // Necesitamos obtener los IDs de los usuarios
  const usuarioMaria = await obtenerPerfil(tokenMaria);
  const usuarioFederico = await obtenerPerfil(tokenFederico);
  
  if (!usuarioMaria || !usuarioFederico) {
    console.log('❌ No se pudieron obtener los perfiles de usuario');
    return;
  }

  const reserva = await crearReserva(tokenMaria, {
    usuarioId: usuarioMaria.data?.id || usuarioMaria.id,
    publicacionId: publicacion.data?.id || publicacion.id,
    propietarioId: usuarioFederico.data?.id || usuarioFederico.id,
    fechaInicio: fechaInicio.toISOString(),
    fechaFin: fechaFin.toISOString(),
    precioTotal: 100.00, // 4 días * 25/día
    comisionPlataforma: 10.00, // 10% de comisión
    tipoEntrega: 'RETIRO',
    telefonoContacto: '+51987654322',
    notasUsuario: 'Reserva de prueba para testing'
  });

  if (reserva) {
    console.log('\n✅ ¡Configuración completada exitosamente!');
    console.log('📋 Datos de prueba:');
    console.log(`   - Federico (propietario): federico@test.com / Federico123!`);
    console.log(`   - María (arrendataria): maria@test.com / Maria123!`);
    console.log(`   - Publicación ID: ${publicacion.data?.id || publicacion.id}`);
    console.log(`   - Reserva ID: ${reserva.data?.id || reserva.id}`);
    console.log('\n🧪 Ahora puedes ejecutar: node test-aceptar-rechazar.js');
  } else {
    console.log('❌ No se pudo crear la reserva');
  }
}

main().catch(console.error);