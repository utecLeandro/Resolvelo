/**
 * Script de prueba completa para la funcionalidad de eliminación de publicaciones
 * 1. Registra un usuario de prueba
 * 2. Hace login
 * 3. Crea una publicación
 * 4. Verifica que existe
 * 5. La elimina
 * 6. Verifica que ya no existe
 */

const BASE_URL = "http://localhost:3000/api";

// Función helper para hacer requests
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.text();
  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch {
    parsedData = data;
  }

  if (!response.ok) {
    console.error(`Error ${response.status}:`, parsedData);
    throw new Error(JSON.stringify(parsedData));
  }

  return parsedData;
}

async function testEliminacionCompleta() {
  try {
    console.log(
      "🧪 Iniciando prueba completa de eliminación de publicaciones...\n",
    );

    // 1. Registrar un usuario de prueba
    console.log("1. 👤 Registrando usuario de prueba...");
    const timestamp = Date.now();
    const nuevoUsuario = {
      nombre: "Federico",
      apellido: "Gutiérrez",
      email: `federico.test.${timestamp}@example.com`,
      password: "FedericoTest2024!",
      telefono: "+59899123456",
      documentoIdentidad: `${timestamp.toString().slice(-8)}`,
    };

    await makeRequest(`${BASE_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(nuevoUsuario),
    });
    console.log("✅ Usuario registrado exitosamente\n");

    // 2. Hacer login
    console.log("2. 🔐 Haciendo login...");
    const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
      }),
    });
    const token = loginResponse.access_token;
    const userId = loginResponse.user.id;
    console.log(`✅ Login exitoso. User ID: ${userId}\n`);

    // 3. Crear una publicación de prueba
    console.log("3. 📝 Creando publicación de prueba...");
    const nuevaPublicacion = {
      titulo: "Guitarra Acústica de Prueba",
      descripcion:
        "Guitarra acústica en excelente estado para pruebas de eliminación",
      categoria: "GUITARRAS",
      precioPorDia: 25.0,
      direccion: "Av. 18 de Julio 1234",
      ciudad: "Montevideo",
      departamento: "Montevideo",
      estadoEquipo: "Excelente",
    };

    const publicacionCreada = await makeRequest(
      `${BASE_URL}/publicaciones?usuarioId=${userId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaPublicacion),
      },
    );

    const publicacionId = publicacionCreada.id;
    console.log(`✅ Publicación creada con ID: ${publicacionId}\n`);

    // 4. Verificar que la publicación existe en la lista del usuario
    console.log("4. 🔍 Verificando que la publicación existe...");
    const publicacionesUsuario = await makeRequest(
      `${BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const publicacionEncontrada = publicacionesUsuario.find(
      (p) => p.id === publicacionId,
    );
    if (!publicacionEncontrada) {
      throw new Error("La publicación no se encontró en la lista del usuario");
    }
    console.log("✅ Publicación encontrada en la lista del usuario\n");

    // 5. Eliminar la publicación
    console.log("5. 🗑️ Eliminando la publicación...");
    await makeRequest(
      `${BASE_URL}/publicaciones/${publicacionId}?usuarioId=${userId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("✅ Publicación eliminada exitosamente\n");

    // 6. Verificar que ya no existe en la lista del usuario
    console.log("6. ✅ Verificando que la publicación ya no existe...");
    const publicacionesActualizadas = await makeRequest(
      `${BASE_URL}/publicaciones/mis-publicaciones?usuarioId=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const publicacionEliminada = publicacionesActualizadas.find(
      (p) => p.id === publicacionId,
    );
    if (publicacionEliminada) {
      throw new Error("La publicación aún existe en la lista del usuario");
    }
    console.log("✅ La publicación ya no aparece en la lista del usuario\n");

    // 7. Verificar que no es accesible directamente
    console.log(
      "7. 🔒 Verificando que la publicación no es accesible directamente...",
    );
    try {
      await makeRequest(`${BASE_URL}/publicaciones/${publicacionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      throw new Error("La publicación aún es accesible directamente");
    } catch (error) {
      if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        console.log("✅ La publicación ya no es accesible directamente\n");
      } else {
        throw error;
      }
    }

    console.log(
      "🎉 ¡Prueba completa exitosa! La funcionalidad de eliminación funciona correctamente.",
    );
  } catch (error) {
    console.error("❌ Error en la prueba:", error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testEliminacionCompleta();
