const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function obtenerIds() {
  try {
    console.log('🔍 Obteniendo IDs reales...');

    // Obtener usuarios
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, email: true, nombre: true }
    });
    console.log('\n👥 Usuarios:');
    usuarios.forEach(u => {
      console.log(`  ${u.email}: ${u.id}`);
    });

    // Obtener publicaciones
    const publicaciones = await prisma.publicacion.findMany({
      select: { id: true, titulo: true, propietarioId: true }
    });
    console.log('\n📋 Publicaciones:');
    publicaciones.forEach(p => {
      console.log(`  ${p.titulo}: ${p.id} (propietario: ${p.propietarioId})`);
    });

    // Buscar usuario test@test.com
    const usuarioTest = usuarios.find(u => u.email === 'test@test.com');
    if (usuarioTest) {
      console.log(`\n✅ Usuario test@test.com encontrado: ${usuarioTest.id}`);
      
      // Buscar una publicación que NO sea del usuario test
      const publicacionDisponible = publicaciones.find(p => p.propietarioId !== usuarioTest.id);
      if (publicacionDisponible) {
        console.log(`✅ Publicación disponible: ${publicacionDisponible.titulo} (${publicacionDisponible.id})`);
        console.log(`✅ Propietario: ${publicacionDisponible.propietarioId}`);
        
        console.log('\n📝 Datos para el script:');
        console.log(`usuarioId: '${usuarioTest.id}'`);
        console.log(`publicacionId: '${publicacionDisponible.id}'`);
        console.log(`propietarioId: '${publicacionDisponible.propietarioId}'`);
      } else {
        console.log('❌ No hay publicaciones de otros usuarios');
      }
    } else {
      console.log('❌ Usuario test@test.com no encontrado');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

obtenerIds();