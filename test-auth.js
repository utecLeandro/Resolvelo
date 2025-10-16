// Script de prueba para verificar la autenticación
const API_BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
  console.log('🔍 Probando autenticación con diferentes usuarios...\n');

  // Usuarios de prueba (del seed)
  const usuarios = [
    { email: 'juan@test.com', password: 'JuanTest2024!' },
    { email: 'maria@test.com', password: 'MariaTest2024!' },
    { email: 'lolo@test.com', password: 'LoloTest2024!' }
  ];

  for (const usuario of usuarios) {
    try {
      console.log(`📧 Probando login con: ${usuario.email}`);
      
      // Hacer login
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
      });
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        console.log(`❌ Login fallido para ${usuario.email}:`, loginData.message);
        console.log('\n' + '='.repeat(80) + '\n');
        continue;
      }
      
      console.log(`✅ Login exitoso para ${usuario.email}`);
      console.log(`📋 Respuesta completa del login:`, JSON.stringify(loginData, null, 2));
      
      const { access_token, user } = loginData;
      console.log(`🎫 Token: ${access_token}`);
      console.log(`👤 Usuario ID: ${user?.id}`);
      console.log(`📛 Nombre: ${user?.nombre} ${user?.apellido}`);
      
      // Verificar perfil con el token
      const perfilResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      const perfilData = await perfilResponse.json();
      
      console.log(`🔍 Perfil obtenido:`);
      console.log(`   ID: ${perfilData.id}`);
      console.log(`   Email: ${perfilData.email}`);
      console.log(`   Nombre: ${perfilData.nombre} ${perfilData.apellido}`);
      
      // Verificar mis publicaciones
      const publicacionesResponse = await fetch(`${API_BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      const publicacionesData = await publicacionesResponse.json();
      
      console.log(`📋 Mis publicaciones (${publicacionesData.length} encontradas):`);
      publicacionesData.forEach((pub, index) => {
        console.log(`   ${index + 1}. ${pub.titulo} (ID: ${pub.id}, Propietario: ${pub.propietarioId})`);
      });
      
      console.log('\n' + '='.repeat(80) + '\n');
      
    } catch (error) {
      console.error(`❌ Error con ${usuario.email}:`, error.message);
      console.log('\n' + '='.repeat(80) + '\n');
    }
  }
}

testAuth().catch(console.error);