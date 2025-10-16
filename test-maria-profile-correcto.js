const API_BASE_URL = 'http://localhost:3000/api';

async function testMariaGarciaCompleto() {
  try {
    console.log('🧪 Iniciando prueba completa de María García...\n');

    // 1. Login de María García
    console.log('1️⃣ Intentando login de María García...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'maria@test.com',
        password: 'MariaTest2024!'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso:', {
      userId: loginData.user.id,
      nombre: loginData.user.nombre,
      email: loginData.user.email
    });

    const token = loginData.access_token;
    const userId = loginData.user.id;

    // 2. Obtener perfil usando el endpoint correcto
    console.log('\n2️⃣ Obteniendo perfil con endpoint correcto...');
    const perfilResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!perfilResponse.ok) {
      throw new Error(`Profile failed: ${perfilResponse.status} ${perfilResponse.statusText}`);
    }

    const perfilData = await perfilResponse.json();
    console.log('✅ Perfil obtenido exitosamente:', {
      id: perfilData.id,
      nombre: perfilData.nombre,
      apellido: perfilData.apellido,
      email: perfilData.email
    });

    // 3. Verificar publicaciones existentes
    console.log('\n3️⃣ Verificando publicaciones existentes de María...');
    const misPublicacionesResponse = await fetch(`${API_BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userId}`);
    
    if (!misPublicacionesResponse.ok) {
      throw new Error(`Get publications failed: ${misPublicacionesResponse.status} ${misPublicacionesResponse.statusText}`);
    }

    const misPublicacionesData = await misPublicacionesResponse.json();
    console.log(`📋 María tiene ${misPublicacionesData.length} publicaciones:`);
    misPublicacionesData.forEach((pub, index) => {
      console.log(`   ${index + 1}. "${pub.titulo}" (ID: ${pub.id})`);
    });

    // 4. Crear nueva publicación
    console.log('\n4️⃣ Creando nueva publicación...');
    const nuevaPublicacion = {
      titulo: 'Micrófono Shure SM58 Nuevo',
      descripcion: 'Micrófono dinámico profesional Shure SM58 en excelente estado',
      categoria: 'AUDIO_PA',
      marca: 'Shure',
      modelo: 'SM58',
      precioPorDia: 25,
      direccion: 'Av. 18 de Julio 1234',
      ciudad: 'Montevideo',
      departamento: 'Montevideo',
      estadoEquipo: 'EXCELENTE',
      entregaDomicilio: true,
      retiroLocal: true
    };

    const crearResponse = await fetch(`${API_BASE_URL}/publicaciones?usuarioId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevaPublicacion)
    });
    
    if (!crearResponse.ok) {
      const errorText = await crearResponse.text();
      throw new Error(`Create publication failed: ${crearResponse.status} ${crearResponse.statusText} - ${errorText}`);
    }

    const crearData = await crearResponse.json();
    console.log('✅ Publicación creada exitosamente:', {
      id: crearData.id,
      titulo: crearData.titulo,
      propietarioId: crearData.propietarioId
    });

    // 5. Verificar publicaciones después de crear
    console.log('\n5️⃣ Verificando publicaciones después de crear...');
    const misPublicacionesFinalesResponse = await fetch(`${API_BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userId}`);
    
    if (!misPublicacionesFinalesResponse.ok) {
      throw new Error(`Get final publications failed: ${misPublicacionesFinalesResponse.status} ${misPublicacionesFinalesResponse.statusText}`);
    }

    const misPublicacionesFinalesData = await misPublicacionesFinalesResponse.json();
    console.log(`📋 María ahora tiene ${misPublicacionesFinalesData.length} publicaciones:`);
    misPublicacionesFinalesData.forEach((pub, index) => {
      console.log(`   ${index + 1}. "${pub.titulo}" (ID: ${pub.id})`);
    });

    console.log('\n🎉 ¡Prueba completa exitosa! María García puede crear publicaciones correctamente.');

  } catch (error) {
    console.error('❌ Error en la prueba:', {
      message: error.message
    });
  }
}

testMariaGarciaCompleto();