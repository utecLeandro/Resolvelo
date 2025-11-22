/**
 * Script para probar casos edge de reservas
 * Verifica el manejo de errores y validaciones
 */

const http = require("http");

// Configuración
const BASE_URL = "localhost";
const PORT = 3000;

// Datos de prueba
const testUser = {
  email: "juan@test.com",
  password: "JuanTest2024!",
};

// Simulación de localStorage
const localStorage = {
  data: {},
  setItem(key, value) {
    this.data[key] = value;
  },
  getItem(key) {
    return this.data[key] || null;
  },
  removeItem(key) {
    delete this.data[key];
  },
};

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

  try {
    const response = await makeRequest(options, testUser);
    if (response.statusCode === 200) {
      const token = response.body.access_token;
      localStorage.setItem("token", token);
      console.log("✅ Login exitoso");
      return token;
    } else {
      throw new Error(`Login falló: ${response.statusCode}`);
    }
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw error;
  }
}

// Función para obtener publicaciones disponibles
async function obtenerPublicaciones(token) {
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
    if (response.statusCode === 200) {
      return response.body.publicaciones || [];
    } else {
      throw new Error(`Error obteniendo publicaciones: ${response.statusCode}`);
    }
  } catch (error) {
    console.error("❌ Error obteniendo publicaciones:", error.message);
    return [];
  }
}

// Función para crear reserva
async function crearReserva(token, reservaData) {
  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/usuarios/reservas/crear",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await makeRequest(options, reservaData);
    return response;
  } catch (error) {
    console.error("❌ Error creando reserva:", error.message);
    throw error;
  }
}

// Prueba 1: Fechas inválidas
async function testFechasInvalidas(token, publicacionId) {
  console.log("\n📅 === PRUEBAS DE FECHAS INVÁLIDAS ===");

  const casosInvalidos = [
    {
      descripcion: "Fecha de inicio en el pasado",
      data: {
        publicacionId: publicacionId,
        fechaInicio: "2020-01-01",
        fechaFin: "2025-01-02",
        mensaje: "Reserva con fecha pasada",
      },
    },
    {
      descripcion: "Fecha de fin anterior a fecha de inicio",
      data: {
        publicacionId: publicacionId,
        fechaInicio: "2025-01-02",
        fechaFin: "2025-01-01",
        mensaje: "Fechas invertidas",
      },
    },
    {
      descripcion: "Fechas iguales (mismo día)",
      data: {
        publicacionId: publicacionId,
        fechaInicio: "2025-01-01",
        fechaFin: "2025-01-01",
        mensaje: "Mismo día",
      },
    },
    {
      descripcion: "Formato de fecha inválido",
      data: {
        publicacionId: publicacionId,
        fechaInicio: "fecha-invalida",
        fechaFin: "2025-01-02",
        mensaje: "Formato inválido",
      },
    },
  ];

  for (const caso of casosInvalidos) {
    try {
      const response = await crearReserva(token, caso.data);

      if (response.statusCode >= 400) {
        console.log(
          `✅ ${caso.descripcion}: Correctamente rechazada (${response.statusCode})`,
        );
        if (response.body.message) {
          console.log(`   Mensaje: ${response.body.message}`);
        }
      } else {
        console.log(
          `❌ ${caso.descripcion}: Incorrectamente aceptada (${response.statusCode})`,
        );
      }
    } catch (error) {
      console.log(
        `⚠️  ${caso.descripcion}: Error en petición - ${error.message}`,
      );
    }
  }
}

// Prueba 2: Publicación inexistente
async function testPublicacionInexistente(token) {
  console.log("\n📦 === PRUEBAS DE PUBLICACIÓN INEXISTENTE ===");

  const publicacionInexistente = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

  const reservaData = {
    publicacionId: publicacionInexistente,
    fechaInicio: "2025-01-01",
    fechaFin: "2025-01-02",
    mensaje: "Reserva para publicación inexistente",
  };

  try {
    const response = await crearReserva(token, reservaData);

    if (response.statusCode === 404 || response.statusCode === 400) {
      console.log(
        `✅ Publicación inexistente: Correctamente rechazada (${response.statusCode})`,
      );
      if (response.body.message) {
        console.log(`   Mensaje: ${response.body.message}`);
      }
    } else {
      console.log(
        `❌ Publicación inexistente: Incorrectamente aceptada (${response.statusCode})`,
      );
    }
  } catch (error) {
    console.log(
      `⚠️  Publicación inexistente: Error en petición - ${error.message}`,
    );
  }
}

// Prueba 3: Campos faltantes
async function testCamposFaltantes(token, publicacionId) {
  console.log("\n📝 === PRUEBAS DE CAMPOS FALTANTES ===");

  const casosInvalidos = [
    {
      descripcion: "Sin publicacionId",
      data: {
        fechaInicio: "2025-01-01",
        fechaFin: "2025-01-02",
        mensaje: "Sin publicación",
      },
    },
    {
      descripcion: "Sin fechaInicio",
      data: {
        publicacionId: publicacionId,
        fechaFin: "2025-01-02",
        mensaje: "Sin fecha inicio",
      },
    },
    {
      descripcion: "Sin fechaFin",
      data: {
        publicacionId: publicacionId,
        fechaInicio: "2025-01-01",
        mensaje: "Sin fecha fin",
      },
    },
    {
      descripcion: "Objeto vacío",
      data: {},
    },
  ];

  for (const caso of casosInvalidos) {
    try {
      const response = await crearReserva(token, caso.data);

      if (response.statusCode >= 400) {
        console.log(
          `✅ ${caso.descripcion}: Correctamente rechazada (${response.statusCode})`,
        );
        if (response.body.message) {
          console.log(`   Mensaje: ${response.body.message}`);
        }
      } else {
        console.log(
          `❌ ${caso.descripcion}: Incorrectamente aceptada (${response.statusCode})`,
        );
      }
    } catch (error) {
      console.log(
        `⚠️  ${caso.descripcion}: Error en petición - ${error.message}`,
      );
    }
  }
}

// Prueba 4: Reserva duplicada (mismas fechas)
async function testReservaDuplicada(token, publicacionId) {
  console.log("\n🔄 === PRUEBAS DE RESERVA DUPLICADA ===");

  const reservaData = {
    publicacionId: publicacionId,
    fechaInicio: "2025-06-01",
    fechaFin: "2025-06-03",
    mensaje: "Primera reserva para duplicación",
  };

  try {
    // Crear primera reserva
    console.log("Creando primera reserva...");
    const response1 = await crearReserva(token, reservaData);

    if (response1.statusCode === 201 || response1.statusCode === 200) {
      console.log("✅ Primera reserva creada exitosamente");

      // Intentar crear reserva duplicada
      console.log("Intentando crear reserva duplicada...");
      const response2 = await crearReserva(token, {
        ...reservaData,
        mensaje: "Segunda reserva (duplicada)",
      });

      if (response2.statusCode >= 400) {
        console.log(
          `✅ Reserva duplicada: Correctamente rechazada (${response2.statusCode})`,
        );
        if (response2.body.message) {
          console.log(`   Mensaje: ${response2.body.message}`);
        }
      } else {
        console.log(
          `❌ Reserva duplicada: Incorrectamente aceptada (${response2.statusCode})`,
        );
      }
    } else {
      console.log(
        `⚠️  No se pudo crear la primera reserva para probar duplicación (${response1.statusCode})`,
      );
    }
  } catch (error) {
    console.log(`⚠️  Error en prueba de duplicación: ${error.message}`);
  }
}

// Prueba 5: Operaciones en reserva inexistente
async function testReservaInexistente(token) {
  console.log("\n🔍 === PRUEBAS DE RESERVA INEXISTENTE ===");

  const reservaInexistente = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

  const operaciones = [
    {
      descripcion: "Obtener reserva inexistente",
      method: "GET",
      path: `/api/usuarios/reservas/${reservaInexistente}`,
      data: null,
    },
    {
      descripcion: "Actualizar reserva inexistente",
      method: "PATCH",
      path: `/api/usuarios/reservas/${reservaInexistente}`,
      data: { mensaje: "Actualización de reserva inexistente" },
    },
    {
      descripcion: "Cancelar reserva inexistente",
      method: "PATCH",
      path: `/api/usuarios/reservas/${reservaInexistente}/cancelar`,
      data: null,
    },
  ];

  for (const operacion of operaciones) {
    try {
      const options = {
        hostname: BASE_URL,
        port: PORT,
        path: operacion.path,
        method: operacion.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await makeRequest(options, operacion.data);

      if (response.statusCode === 404) {
        console.log(
          `✅ ${operacion.descripcion}: Correctamente rechazada (404)`,
        );
      } else {
        console.log(
          `❌ ${operacion.descripcion}: Respuesta inesperada (${response.statusCode})`,
        );
        if (response.body.message) {
          console.log(`   Mensaje: ${response.body.message}`);
        }
      }
    } catch (error) {
      console.log(
        `⚠️  ${operacion.descripcion}: Error en petición - ${error.message}`,
      );
    }
  }
}

// Función principal
async function main() {
  console.log("🧪 INICIANDO PRUEBAS DE CASOS EDGE DE RESERVAS");
  console.log("===============================================");

  try {
    // Login
    const token = await login();

    // Obtener publicaciones para usar en las pruebas
    const publicaciones = await obtenerPublicaciones(token);

    if (publicaciones.length === 0) {
      console.log("⚠️  No hay publicaciones disponibles para las pruebas");
      return;
    }

    const publicacionId = publicaciones[0].id;
    console.log(
      `📦 Usando publicación: ${publicaciones[0].titulo} (${publicacionId})`,
    );

    // Ejecutar pruebas
    await testFechasInvalidas(token, publicacionId);
    await testPublicacionInexistente(token);
    await testCamposFaltantes(token, publicacionId);
    await testReservaDuplicada(token, publicacionId);
    await testReservaInexistente(token);

    console.log("\n✅ PRUEBAS DE CASOS EDGE COMPLETADAS");
    console.log("====================================");
  } catch (error) {
    console.error("❌ Error en las pruebas:", error);
  }
}

// Ejecutar las pruebas
main();
