/**
 * Script de debug para verificar la obtención de publicaciones
 */

const http = require("http");

// Configuración
const BASE_URL = "localhost";
const PORT = 3000;

// Función para hacer peticiones HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Función para hacer login y obtener token
async function login() {
  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const loginData = {
    email: "juan@test.com",
    password: "JuanTest2024!",
  };

  try {
    const response = await makeRequest(options, loginData);
    console.log("Login response status:", response.statusCode);
    console.log("Login response body:", JSON.stringify(response.body, null, 2));

    if (response.statusCode === 200 || response.statusCode === 201) {
      return response.body.access_token;
    } else {
      throw new Error(`Login failed: ${response.statusCode}`);
    }
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw error;
  }
}

// Función para obtener publicaciones disponibles
async function obtenerPublicaciones(token) {
  console.log("\n🔍 Obteniendo publicaciones...");
  console.log("Token:", token ? "Presente" : "Ausente");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/publicaciones",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await makeRequest(options);
    console.log("Publicaciones response status:", response.statusCode);
    console.log(
      "Publicaciones response body:",
      JSON.stringify(response.body, null, 2),
    );

    if (response.statusCode === 200) {
      console.log("Keys en response.body:", Object.keys(response.body));
      console.log("response.body.publicaciones:", response.body.publicaciones);
      console.log(
        "Tipo de response.body.publicaciones:",
        typeof response.body.publicaciones,
      );
      console.log(
        "Es array response.body.publicaciones:",
        Array.isArray(response.body.publicaciones),
      );

      const data = response.body.publicaciones || [];
      console.log("Data extraída:", data);
      console.log("Tipo de data:", typeof data);
      console.log("Es array:", Array.isArray(data));
      console.log("Longitud:", data.length);
      return data;
    } else {
      throw new Error(`Error obteniendo publicaciones: ${response.statusCode}`);
    }
  } catch (error) {
    console.error("❌ Error obteniendo publicaciones:", error.message);
    return [];
  }
}

// Función principal
async function main() {
  console.log("🔍 DEBUG: OBTENCIÓN DE PUBLICACIONES");
  console.log("====================================");

  try {
    // Login
    const token = await login();
    console.log("✅ Login exitoso");

    // Obtener publicaciones
    const publicaciones = await obtenerPublicaciones(token);

    console.log("\n📊 RESULTADO FINAL:");
    console.log("Publicaciones obtenidas:", publicaciones.length);

    if (publicaciones.length > 0) {
      console.log("\n📋 Publicaciones encontradas:");
      publicaciones.forEach((pub, index) => {
        console.log(`${index + 1}. ${pub.titulo} (ID: ${pub.id})`);
      });
    } else {
      console.log("⚠️  No se encontraron publicaciones");
    }
  } catch (error) {
    console.error("❌ Error en debug:", error);
  }
}

// Ejecutar
main();
