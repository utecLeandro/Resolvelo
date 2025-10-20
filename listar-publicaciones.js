const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.access_token;
  } catch (error) {
    console.log('Error en login:', error.response?.data || error.message);
    return null;
  }
}

async function listarPublicaciones(token) {
  try {
    const response = await axios.get(`${BASE_URL}/publicaciones`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.log('Error al listar publicaciones:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Listando publicaciones disponibles...\n');

  // Login con Federico
  const federicoToken = await login('gtbump2012@gmail.com', 'FedericoTest2024!');
  if (!federicoToken) {
    console.log('❌ Error al hacer login con Federico');
    return;
  }
  console.log('✅ Federico logueado exitosamente\n');

  // Listar publicaciones
  const publicaciones = await listarPublicaciones(federicoToken);
  if (!publicaciones) {
    console.log('❌ Error al obtener publicaciones');
    return;
  }

  // Si la respuesta tiene una propiedad publicaciones que contiene el array
  const listaPublicaciones = publicaciones.publicaciones || publicaciones.data || publicaciones;
  
  if (Array.isArray(listaPublicaciones)) {
    console.log(`📋 Se encontraron ${listaPublicaciones.length} publicaciones:`);
    listaPublicaciones.forEach((pub, index) => {
      console.log(`  ${index + 1}. ID: ${pub.id}`);
      console.log(`     Título: ${pub.titulo}`);
      console.log(`     Propietario: ${pub.propietario?.nombre} ${pub.propietario?.apellido}`);
      console.log(`     Estado: ${pub.estado}`);
      console.log('');
    });
    
    // Mostrar IDs para copiar fácilmente
    console.log('🔗 IDs de publicaciones para usar en scripts:');
    listaPublicaciones.forEach((pub, index) => {
      console.log(`  ${pub.titulo}: '${pub.id}'`);
    });
  } else {
    console.log('❌ La respuesta no contiene un array de publicaciones');
    console.log('Estructura de la respuesta:');
    console.log(JSON.stringify(publicaciones, null, 2));
  }
}

main().catch(console.error);