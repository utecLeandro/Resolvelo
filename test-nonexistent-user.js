/**
 * Script para probar el usuario gtbump2012@gmail.com
 */

const BASE_URL = 'http://localhost:3000/api';

async function testGtbumpUser() {
  console.log('🧪 Probando usuario: gtbump2012@gmail.com\n');

  try {
    // 1. Intentar login con el usuario gtbump2012@gmail.com
    console.log('1️⃣ Intentando login con gtbump2012@gmail.com...');
    
    // Primero necesitamos saber cuál es la contraseña
    // Vamos a probar con algunas contraseñas comunes de prueba
    const possiblePasswords = [
      'GtbumpTest2024!',
      'FedericoTest2024!', 
      'TestPassword123!',
      'password123',
      'gtbump2012'
    ];

    let loginSuccess = false;
    let token = null;
    let userData = null;

    for (const password of possiblePasswords) {
      console.log(`   Probando contraseña: ${password}`);
      
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'gtbump2012@gmail.com',
          password: password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login exitoso!');
        console.log('Token:', loginData.access_token);
        console.log('Usuario:', loginData.user);
        
        token = loginData.access_token;
        userData = loginData.user;
        loginSuccess = true;
        break;
      } else {
        const errorData = await loginResponse.json();
        console.log(`   ❌ Falló con: ${errorData.message}`);
      }
    }

    if (!loginSuccess) {
      console.log('❌ No se pudo autenticar con ninguna contraseña de prueba');
      console.log('💡 Necesitamos verificar cuál es la contraseña correcta en el seed');
      return;
    }

    // 2. Obtener perfil del usuario
    console.log('\n2️⃣ Obteniendo perfil del usuario...');
    const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Perfil obtenido:', profileData);
    } else {
      const errorData = await profileResponse.json();
      console.log('❌ Error obteniendo perfil:', errorData);
    }

    // 3. Obtener publicaciones del usuario
    console.log('\n3️⃣ Obteniendo publicaciones del usuario...');
    const publicacionesResponse = await fetch(`${BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userData.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (publicacionesResponse.ok) {
      const publicacionesData = await publicacionesResponse.json();
      console.log(`✅ Publicaciones encontradas: ${publicacionesData.length}`);
      publicacionesData.forEach((pub, index) => {
        console.log(`   ${index + 1}. ${pub.titulo} - $${pub.precioPorDia}/día`);
      });
    } else {
      const errorData = await publicacionesResponse.json();
      console.log('❌ Error obteniendo publicaciones:', errorData);
    }

    // 4. Intentar crear una nueva publicación
    console.log('\n4️⃣ Intentando crear una nueva publicación...');
    const createResponse = await fetch(`${BASE_URL}/publicaciones?usuarioId=${userData.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo: 'Guitarra Eléctrica Fender',
        descripcion: 'Guitarra eléctrica Fender Stratocaster en excelente estado',
        categoria: 'GUITARRAS',
        marca: 'Fender',
        modelo: 'Stratocaster',
        anioFabricacion: 2020,
        precioPorDia: 75.00,
        direccion: 'Av. 8 de Octubre 1234',
        ciudad: 'Montevideo',
        departamento: 'Montevideo',
        estadoEquipo: 'Excelente'
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Publicación creada exitosamente:', createData);
    } else {
      const errorData = await createResponse.json();
      console.log('❌ Error creando publicación:', errorData);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }

  console.log('\n🏁 Pruebas completadas');
}

// Ejecutar las pruebas
testGtbumpUser();