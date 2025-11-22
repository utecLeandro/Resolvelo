const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data.access_token;
  } catch (error) {
    console.log("Error en login:", error.response?.data || error.message);
    return null;
  }
}

async function listarPublicacionesAdmin(
  token,
  incluirTodosEstadosModeracion = true,
) {
  try {
    const params = {};
    if (incluirTodosEstadosModeracion)
      params.incluirTodosEstadosModeracion = true;
    const response = await axios.get(`${BASE_URL}/admin/publicaciones`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.log(
      "Error al listar publicaciones admin:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function main() {
  console.log(
    "🔍 Listando publicaciones de administración (Todos los estados de moderación)...\n",
  );

  // Login con Federico (admin)
  const adminToken = await login("gtbump2012@gmail.com", "FedericoTest2024!");
  if (!adminToken) {
    console.log("❌ Error al hacer login con el administrador");
    return;
  }
  console.log("✅ Administrador logueado exitosamente\n");

  // Listar publicaciones en vista admin con "Todos"
  const publicaciones = await listarPublicacionesAdmin(adminToken, true);
  if (!publicaciones) {
    console.log("❌ Error al obtener publicaciones admin");
    return;
  }

  const listaPublicaciones =
    publicaciones.publicaciones || publicaciones.data || publicaciones;
  if (Array.isArray(listaPublicaciones)) {
    console.log(
      `📋 Se encontraron ${listaPublicaciones.length} publicaciones:`,
    );
    listaPublicaciones.forEach((pub, index) => {
      console.log(`  ${index + 1}. ID: ${pub.id}`);
      console.log(`     Título: ${pub.titulo}`);
      console.log(`     Estado: ${pub.estado}`);
      console.log(`     Estado moderación: ${pub.estadoModeracion}`);
      console.log("");
    });
  } else {
    console.log("❌ La respuesta no contiene un array de publicaciones");
    console.log("Estructura de la respuesta:");
    console.log(JSON.stringify(publicaciones, null, 2));
  }
}

main().catch(console.error);
