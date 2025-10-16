const BASE_URL = 'http://localhost:3000/api';

async function testMariaPublicacion() {
  console.log('🔍 Probando creación de publicación con María García...\n');
  
  try {
    // 1. Login con María García
    console.log('1️⃣ Autenticando María García...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'maria@test.com',
        password: 'MariaTest2024!'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Error en login:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    const userData = loginData.user;
    
    console.log('✅ Login exitoso:', {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email
    });

    // 2. Obtener perfil
    console.log('\n2️⃣ Obteniendo perfil...');
    const perfilResponse = await fetch(`${BASE_URL}/auth/perfil`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!perfilResponse.ok) {
      console.log('❌ Error al obtener perfil:', await perfilResponse.text());
      return;
    }

    const perfilData = await perfilResponse.json();
    console.log('✅ Perfil obtenido:', perfilData);

    // 3. Crear publicación
    console.log('\n3️⃣ Creando publicación...');
    const publicacionData = {
      titulo: 'Violín Stradivarius (Réplica)',
      descripcion: 'Hermosa réplica de violín Stradivarius en excelente estado',
      categoria: 'CUERDAS',
      marca: 'Stradivarius',
      modelo: 'Replica 1721',
      anioFabricacion: 2018,
      precioPorDia: 120.00,
      direccion: 'Av. 18 de Julio 1234',
      ciudad: 'Montevideo',
      departamento: 'Montevideo',
      estadoEquipo: 'Excelente'
    };

    const createResponse = await fetch(`${BASE_URL}/publicaciones?usuarioId=${perfilData.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(publicacionData)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log('❌ Error al crear publicación:', errorText);
      return;
    }

    const publicacionCreada = await createResponse.json();
    console.log('✅ Publicación creada exitosamente:', {
      id: publicacionCreada.id,
      titulo: publicacionCreada.titulo,
      propietarioId: publicacionCreada.propietarioId,
      propietario: publicacionCreada.propietario
    });

    // 4. Verificar mis publicaciones
    console.log('\n4️⃣ Verificando mis publicaciones...');
    const misPublicacionesResponse = await fetch(`${BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${perfilData.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (misPublicacionesResponse.ok) {
      const misPublicaciones = await misPublicacionesResponse.json();
      console.log(`✅ María ahora tiene ${misPublicaciones.length} publicaciones:`);
      misPublicaciones.forEach((pub, index) => {
        console.log(`   ${index + 1}. ${pub.titulo} - $${pub.precioPorDia}/día`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testMariaPublicacion();