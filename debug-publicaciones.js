/**
 * Script para debuggear las publicaciones y sus propietarios
 */

const BASE_URL = 'http://localhost:3000/api';

async function debugPublicaciones() {
  console.log('🔍 Investigando publicaciones en la base de datos...\n');

  try {
    // 1. Login con Federico
    console.log('1️⃣ Autenticando con Federico...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'gtbump2012@gmail.com',
        password: 'FedericoTest2024!'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    const federicoId = loginData.user.id;
    
    console.log(`✅ Federico ID: ${federicoId}\n`);

    // 2. Obtener TODAS las publicaciones
    console.log('2️⃣ Obteniendo TODAS las publicaciones...');
    const todasResponse = await fetch(`${BASE_URL}/publicaciones`);
    const todasData = await todasResponse.json();
    
    console.log('📊 Respuesta completa:', JSON.stringify(todasData, null, 2));
    
    // Verificar si es un array o un objeto con datos
    const todasPublicaciones = Array.isArray(todasData) ? todasData : (todasData.data || todasData.publicaciones || []);
    
    console.log(`📊 Total de publicaciones en la BD: ${todasPublicaciones.length}`);
    if (todasPublicaciones.length > 0) {
      todasPublicaciones.forEach((pub, index) => {
        console.log(`   ${index + 1}. "${pub.titulo}" - Propietario ID: ${pub.propietarioId}`);
      });
    }
    console.log('');

    // 3. Obtener publicaciones de Federico específicamente
    console.log('3️⃣ Obteniendo publicaciones de Federico...');
    const misPublicacionesResponse = await fetch(`${BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${federicoId}`);
    const misPublicaciones = await misPublicacionesResponse.json();
    
    console.log(`📊 Publicaciones de Federico: ${misPublicaciones.length}`);
    misPublicaciones.forEach((pub, index) => {
      console.log(`   ${index + 1}. "${pub.titulo}" - Propietario ID: ${pub.propietarioId}`);
      console.log(`      ¿Es de Federico? ${pub.propietarioId === federicoId ? '✅ SÍ' : '❌ NO'}`);
    });
    console.log('');

    // 4. Verificar otros usuarios
    console.log('4️⃣ Verificando otros usuarios...');
    
    // Login con Juan
    const juanLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'juan@test.com',
        password: 'JuanTest2024!'
      })
    });
    
    if (juanLogin.ok) {
      const juanData = await juanLogin.json();
      const juanId = juanData.user.id;
      console.log(`👤 Juan ID: ${juanId}`);
      
      const juanPublicaciones = await fetch(`${BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${juanId}`);
      const juanPubs = await juanPublicaciones.json();
      console.log(`📊 Publicaciones de Juan: ${juanPubs.length}`);
    }

    // Login con María
    const mariaLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'maria@test.com',
        password: 'MariaTest2024!'
      })
    });
    
    if (mariaLogin.ok) {
      const mariaData = await mariaLogin.json();
      const mariaId = mariaData.user.id;
      console.log(`👤 María ID: ${mariaId}`);
      
      const mariaPublicaciones = await fetch(`${BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${mariaId}`);
      const mariaPubs = await mariaPublicaciones.json();
      console.log(`📊 Publicaciones de María: ${mariaPubs.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugPublicaciones();