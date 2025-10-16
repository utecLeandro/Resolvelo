const API_BASE_URL = 'http://localhost:3000/api';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.response = { status: response.status, data: await response.text() };
    throw error;
  }
  
  return response.json();
}

async function testEliminarPublicacion() {
  try {
    console.log('🧪 Iniciando prueba de eliminación de publicaciones...\n');

    // 1. Login con Federico
    console.log('1. 🔐 Haciendo login con Federico...');
    const loginData = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'federico@test.com',
        password: 'FedericoTest2024!'
      })
    });

    const token = loginData.access_token;
    const userId = loginData.user.id;
    console.log('✅ Login exitoso. User ID:', userId);

    // 2. Obtener publicaciones de Federico
    console.log('\n2. 📋 Obteniendo publicaciones de Federico...');
    const publicaciones = await makeRequest(
      `${API_BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log(`✅ Publicaciones encontradas: ${publicaciones.length}`);
    
    if (publicaciones.length === 0) {
      console.log('⚠️ No hay publicaciones para eliminar. Creando una publicación de prueba...');
      
      // Crear una publicación de prueba
      const nuevaPublicacion = await makeRequest(
        `${API_BASE_URL}/publicaciones?usuarioId=${userId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            titulo: 'Publicación de Prueba para Eliminar',
            descripcion: 'Esta es una publicación creada para probar la funcionalidad de eliminación',
            categoria: 'GUITARRA',
            precioPorDia: 50,
            diasMinimoAlquiler: 1,
            direccion: 'Dirección de prueba',
            ciudad: 'Montevideo',
            departamento: 'Montevideo',
            entregaDomicilio: true,
            retiroLocal: true,
            estadoEquipo: 'EXCELENTE'
          })
        }
      );
      
      console.log('✅ Publicación de prueba creada:', nuevaPublicacion.titulo);
      
      // Actualizar la lista de publicaciones
      const publicacionesActualizadas = await makeRequest(
        `${API_BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      publicaciones.push(...publicacionesActualizadas);
    }

    // 3. Intentar eliminar la primera publicación
    const publicacionAEliminar = publicaciones[0];
    console.log(`\n3. 🗑️ Intentando eliminar publicación: "${publicacionAEliminar.titulo}"`);
    console.log(`   ID: ${publicacionAEliminar.id}`);

    await makeRequest(
      `${API_BASE_URL}/publicaciones/${publicacionAEliminar.id}?usuarioId=${userId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Publicación eliminada exitosamente');

    // 4. Verificar que la publicación ya no existe en la lista
    console.log('\n4. 🔍 Verificando que la publicación fue eliminada...');
    const publicacionesFinales = await makeRequest(
      `${API_BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const publicacionEliminada = publicacionesFinales.find(p => p.id === publicacionAEliminar.id);
    
    if (!publicacionEliminada) {
      console.log('✅ Verificación exitosa: La publicación ya no aparece en la lista');
    } else {
      console.log('❌ Error: La publicación aún aparece en la lista');
    }

    // 5. Intentar acceder directamente a la publicación eliminada
    console.log('\n5. 🔍 Verificando que la publicación no es accesible directamente...');
    try {
      await makeRequest(`${API_BASE_URL}/publicaciones/${publicacionAEliminar.id}`);
      console.log('❌ Error: La publicación eliminada aún es accesible');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Verificación exitosa: La publicación eliminada no es accesible (404)');
      } else {
        console.log('⚠️ Error inesperado al verificar acceso:', error.message);
      }
    }

    console.log('\n🎉 ¡Prueba de eliminación completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testEliminarPublicacion();