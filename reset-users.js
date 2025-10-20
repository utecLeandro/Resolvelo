const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3000/api';

async function eliminarUsuarios() {
  try {
    console.log('🗑️ Eliminando usuarios existentes...');
    
    // Eliminar reservas primero (por las relaciones)
    await prisma.reserva.deleteMany({});
    console.log('✅ Reservas eliminadas');
    
    // Eliminar publicaciones
    await prisma.publicacion.deleteMany({});
    console.log('✅ Publicaciones eliminadas');
    
    // Eliminar usuarios
    await prisma.usuario.deleteMany({
      where: {
        email: {
          in: ['federico@test.com', 'maria@test.com']
        }
      }
    });
    console.log('✅ Usuarios eliminados');
    
  } catch (error) {
    console.error('❌ Error eliminando usuarios:', error);
  }
}

async function registrarUsuario(userData) {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log(`✅ Usuario ${userData.email} registrado exitosamente`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`ℹ️ Usuario ${userData.email} ya existe`);
      return { email: userData.email };
    }
    console.error(`❌ Error al registrar ${userData.email}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🔄 Reiniciando usuarios de prueba...\n');
  
  // 1. Eliminar usuarios existentes
  await eliminarUsuarios();
  
  console.log('\n📝 Registrando usuarios nuevamente...\n');
  
  // 2. Registrar Federico
  console.log('1. Registrando Federico...');
  const federico = await registrarUsuario({
    nombre: 'Federico',
    apellido: 'García',
    email: 'federico@test.com',
    password: 'Federico123!',
    telefono: '+51987654321',
    documentoIdentidad: '12345678'
  });
  
  // 3. Registrar María
  console.log('2. Registrando María...');
  const maria = await registrarUsuario({
    nombre: 'María',
    apellido: 'López',
    email: 'maria@test.com',
    password: 'Maria123!',
    telefono: '+51987654322',
    documentoIdentidad: '87654321'
  });
  
  if (federico && maria) {
    console.log('\n✅ Usuarios reiniciados correctamente');
    console.log('📧 Federico: federico@test.com / Federico123!');
    console.log('📧 María: maria@test.com / Maria123!');
  } else {
    console.log('\n❌ Error al reiniciar usuarios');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);