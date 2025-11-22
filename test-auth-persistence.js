/**
 * Script de prueba para verificar la persistencia del token JWT
 * y el comportamiento de autenticación en ReSolVelo
 */

const http = require("http");

const API_BASE_URL = "http://localhost:3000";

// Función helper para hacer requests HTTP
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: parsedBody,
            headers: res.headers,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Función para hacer login y obtener token
async function testLogin() {
  try {
    console.log("🔐 Probando login...");
    const response = await makeRequest("POST", "/auth/login", {
      email: "maria@test.com",
      password: "MariaTest2024!",
    });

    if (response.status === 200 || response.status === 201) {
      console.log("✅ Login exitoso");
      console.log("Token recibido:", response.data.access_token ? "SÍ" : "NO");
      console.log("Datos del usuario:", response.data.user ? "SÍ" : "NO");
      return response.data.access_token;
    } else {
      console.error("❌ Error en login:", response.status, response.data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    return null;
  }
}

// Función para probar una ruta protegida
async function testProtectedRoute(token) {
  try {
    console.log("\n🔒 Probando ruta protegida con token...");
    const response = await makeRequest("GET", "/auth/profile", null, {
      Authorization: `Bearer ${token}`,
    });

    if (response.status === 200) {
      console.log("✅ Acceso a ruta protegida exitoso");
      console.log(
        "Perfil obtenido:",
        response.data.nombre,
        response.data.apellido,
      );
      return true;
    } else {
      console.error(
        "❌ Error en ruta protegida:",
        response.status,
        response.data,
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Error en ruta protegida:", error.message);
    return false;
  }
}

// Función para probar ruta protegida sin token
async function testProtectedRouteWithoutToken() {
  try {
    console.log("\n🚫 Probando ruta protegida sin token...");
    const response = await makeRequest("GET", "/auth/profile");

    if (response.status === 401) {
      console.log("✅ Acceso denegado correctamente (401)");
      return true;
    } else {
      console.log("⚠️ Acceso sin token permitido (esto no debería pasar)");
      return false;
    }
  } catch (error) {
    console.error("❌ Error inesperado:", error.message);
    return false;
  }
}

// Función para simular el comportamiento del frontend
async function simulateFrontendBehavior() {
  console.log("\n🌐 Simulando comportamiento del frontend...");

  // Simular localStorage
  let localStorage = {};

  // 1. Login y guardar token
  const token = await testLogin();
  if (!token) return;

  localStorage["access_token"] = token;
  localStorage["userData"] = JSON.stringify({
    nombre: "María",
    apellido: "González",
    email: "maria@test.com",
  });

  console.log("💾 Token guardado en localStorage simulado");

  // 2. Verificar que el token funciona
  const tokenWorks = await testProtectedRoute(token);
  if (!tokenWorks) return;

  // 3. Simular navegación (el token debería persistir)
  console.log("\n🧭 Simulando navegación entre páginas...");
  const persistedToken = localStorage["access_token"];
  const persistedUserData = localStorage["userData"];

  if (persistedToken && persistedUserData) {
    console.log("✅ Token y datos de usuario persisten en localStorage");

    // Verificar que el token persistido sigue funcionando
    const persistedTokenWorks = await testProtectedRoute(persistedToken);
    if (persistedTokenWorks) {
      console.log("✅ Token persistido funciona correctamente");
    } else {
      console.log("❌ Token persistido no funciona");
    }
  } else {
    console.log("❌ Token o datos de usuario se perdieron");
  }

  // 4. Simular logout
  console.log("\n🚪 Simulando logout...");
  delete localStorage["access_token"];
  delete localStorage["userData"];
  console.log("🗑️ Token y datos eliminados del localStorage");

  // 5. Verificar que no se puede acceder a rutas protegidas
  await testProtectedRouteWithoutToken();
}

// Función principal
async function main() {
  console.log("🚀 Iniciando pruebas de persistencia de autenticación\n");

  try {
    await simulateFrontendBehavior();
    console.log("\n✅ Pruebas completadas");
  } catch (error) {
    console.error("\n❌ Error en las pruebas:", error.message);
  }
}

// Ejecutar pruebas
main();
