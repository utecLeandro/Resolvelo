/**
 * Script para verificar la lógica de negocio de reservas
 * Documenta los problemas encontrados en las validaciones
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
      return response.body.access_token;
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

// Función para crear una reserva
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

// Función para verificar validaciones de fechas
async function verificarValidacionesFechas(token, publicacionId) {
  console.log("\n📅 === VERIFICANDO VALIDACIONES DE FECHAS ===");

  const problemasEncontrados = [];

  // Caso 1: Fecha de inicio en el pasado
  console.log("\n1. Probando fecha de inicio en el pasado...");
  const reservaPasado = {
    publicacionId: publicacionId,
    fechaInicio: "2020-01-01",
    fechaFin: "2025-01-02",
    mensaje: "Reserva con fecha pasada",
  };

  const respuestaPasado = await crearReserva(token, reservaPasado);
  if (respuestaPasado.statusCode === 201) {
    problemasEncontrados.push(
      "❌ PROBLEMA: Se acepta fecha de inicio en el pasado",
    );
    console.log("   ❌ PROBLEMA: Se acepta fecha de inicio en el pasado");
  } else {
    console.log("   ✅ Correctamente rechazada");
  }

  // Caso 2: Fecha de fin anterior a fecha de inicio
  console.log("\n2. Probando fecha de fin anterior a fecha de inicio...");
  const reservaInvertida = {
    publicacionId: publicacionId,
    fechaInicio: "2025-01-10",
    fechaFin: "2025-01-05",
    mensaje: "Fechas invertidas",
  };

  const respuestaInvertida = await crearReserva(token, reservaInvertida);
  if (respuestaInvertida.statusCode === 201) {
    problemasEncontrados.push(
      "❌ PROBLEMA: Se acepta fecha de fin anterior a fecha de inicio",
    );
    console.log(
      "   ❌ PROBLEMA: Se acepta fecha de fin anterior a fecha de inicio",
    );
  } else {
    console.log("   ✅ Correctamente rechazada");
  }

  // Caso 3: Formato de fecha inválido
  console.log("\n3. Probando formato de fecha inválido...");
  const reservaFormatoInvalido = {
    publicacionId: publicacionId,
    fechaInicio: "fecha-invalida",
    fechaFin: "2025-01-10",
    mensaje: "Formato inválido",
  };

  const respuestaFormato = await crearReserva(token, reservaFormatoInvalido);
  if (respuestaFormato.statusCode === 201) {
    problemasEncontrados.push(
      "❌ PROBLEMA: Se acepta formato de fecha inválido",
    );
    console.log("   ❌ PROBLEMA: Se acepta formato de fecha inválido");
  } else {
    console.log("   ✅ Correctamente rechazada");
  }

  return problemasEncontrados;
}

// Función para verificar validaciones de publicación
async function verificarValidacionesPublicacion(token) {
  console.log("\n📦 === VERIFICANDO VALIDACIONES DE PUBLICACIÓN ===");

  const problemasEncontrados = [];

  // Caso 1: Publicación inexistente
  console.log("\n1. Probando publicación inexistente...");
  const reservaPublicacionInexistente = {
    publicacionId: "publicacion-inexistente-123",
    fechaInicio: "2025-01-15",
    fechaFin: "2025-01-20",
    mensaje: "Publicación inexistente",
  };

  const respuestaInexistente = await crearReserva(
    token,
    reservaPublicacionInexistente,
  );
  if (respuestaInexistente.statusCode === 201) {
    problemasEncontrados.push(
      "❌ PROBLEMA: Se acepta reserva para publicación inexistente",
    );
    console.log(
      "   ❌ PROBLEMA: Se acepta reserva para publicación inexistente",
    );
  } else {
    console.log("   ✅ Correctamente rechazada");
  }

  return problemasEncontrados;
}

// Función para verificar validaciones de campos obligatorios
async function verificarValidacionesCampos(token) {
  console.log("\n📝 === VERIFICANDO VALIDACIONES DE CAMPOS OBLIGATORIOS ===");

  const problemasEncontrados = [];

  // Caso 1: Sin publicacionId
  console.log("\n1. Probando sin publicacionId...");
  const reservaSinPublicacion = {
    fechaInicio: "2025-01-15",
    fechaFin: "2025-01-20",
    mensaje: "Sin publicación",
  };

  const respuestaSinPublicacion = await crearReserva(
    token,
    reservaSinPublicacion,
  );
  if (respuestaSinPublicacion.statusCode === 201) {
    problemasEncontrados.push(
      "❌ PROBLEMA: Se acepta reserva sin publicacionId",
    );
    console.log("   ❌ PROBLEMA: Se acepta reserva sin publicacionId");
  } else {
    console.log("   ✅ Correctamente rechazada");
  }

  // Caso 2: Sin fechaInicio
  console.log("\n2. Probando sin fechaInicio...");
  const reservaSinFechaInicio = {
    publicacionId: "test-id",
    fechaFin: "2025-01-20",
    mensaje: "Sin fecha inicio",
  };

  const respuestaSinFechaInicio = await crearReserva(
    token,
    reservaSinFechaInicio,
  );
  if (respuestaSinFechaInicio.statusCode === 201) {
    problemasEncontrados.push("❌ PROBLEMA: Se acepta reserva sin fechaInicio");
    console.log("   ❌ PROBLEMA: Se acepta reserva sin fechaInicio");
  } else {
    console.log("   ✅ Correctamente rechazada");
  }

  return problemasEncontrados;
}

// Función principal
async function main() {
  console.log("🔍 VERIFICACIÓN DE LÓGICA DE NEGOCIO DE RESERVAS");
  console.log("================================================");

  try {
    // Login
    const token = await login();
    console.log("✅ Login exitoso");

    // Obtener publicaciones
    const publicaciones = await obtenerPublicaciones(token);

    if (publicaciones.length === 0) {
      console.log("⚠️  No hay publicaciones disponibles para las pruebas");
      return;
    }

    const publicacionId = publicaciones[0].id;
    console.log(
      `📦 Usando publicación: ${publicaciones[0].titulo} (${publicacionId})`,
    );

    // Verificar validaciones
    const problemasFechas = await verificarValidacionesFechas(
      token,
      publicacionId,
    );
    const problemasPublicacion = await verificarValidacionesPublicacion(token);
    const problemasCampos = await verificarValidacionesCampos(token);

    // Resumen de problemas
    const todosLosProblemas = [
      ...problemasFechas,
      ...problemasPublicacion,
      ...problemasCampos,
    ];

    console.log("\n📊 === RESUMEN DE PROBLEMAS ENCONTRADOS ===");
    console.log(`Total de problemas: ${todosLosProblemas.length}`);

    if (todosLosProblemas.length > 0) {
      console.log("\n🚨 PROBLEMAS CRÍTICOS ENCONTRADOS:");
      todosLosProblemas.forEach((problema, index) => {
        console.log(`${index + 1}. ${problema}`);
      });

      console.log("\n🔧 RECOMENDACIONES:");
      console.log("1. Implementar validaciones de fecha en el DTO");
      console.log("2. Validar existencia de publicación en el servicio");
      console.log(
        "3. Asegurar que todos los campos obligatorios sean validados",
      );
      console.log("4. Implementar validaciones de lógica de negocio");
      console.log("5. Retornar códigos de error HTTP apropiados");
    } else {
      console.log("✅ No se encontraron problemas críticos");
    }

    console.log("\n✅ VERIFICACIÓN COMPLETADA");
    console.log("==========================");
  } catch (error) {
    console.error("❌ Error en la verificación:", error);
  }
}

// Ejecutar las pruebas
main();
