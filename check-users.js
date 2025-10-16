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

async function verificarUsuarios() {
  try {
    console.log('🔍 Verificando usuarios disponibles...\n');

    // Intentar login con diferentes usuarios de prueba
    const usuariosPrueba = [
      { email: 'federico@test.com', password: 'FedericoTest2024!' },
      { email: 'admin@test.com', password: 'AdminTest2024!' },
      { email: 'user@test.com', password: 'UserTest2024!' },
      { email: 'test@test.com', password: 'TestTest2024!' }
    ];

    for (const usuario of usuariosPrueba) {
      try {
        console.log(`Probando login con: ${usuario.email}`);
        const loginData = await makeRequest(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify(usuario)
        });
        
        console.log(`✅ Login exitoso con ${usuario.email}`);
        console.log(`   User ID: ${loginData.user.id}`);
        console.log(`   Nombre: ${loginData.user.nombre}`);
        console.log(`   Email: ${loginData.user.email}\n`);
        
        // Si encontramos un usuario válido, obtener sus publicaciones
        const token = loginData.access_token;
        const userId = loginData.user.id;
        
        try {
          const publicaciones = await makeRequest(
            `${API_BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          console.log(`   Publicaciones: ${publicaciones.length}`);
          if (publicaciones.length > 0) {
            console.log(`   Primera publicación: "${publicaciones[0].titulo}"`);
          }
          console.log('');
        } catch (err) {
          console.log(`   Error al obtener publicaciones: ${err.message}\n`);
        }
        
        break; // Si encontramos un usuario válido, salimos del bucle
        
      } catch (error) {
        console.log(`❌ Error con ${usuario.email}: ${error.response?.data || error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

verificarUsuarios();