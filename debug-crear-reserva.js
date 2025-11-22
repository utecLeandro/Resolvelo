const http = require("http");

async function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            body: parsedBody,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body,
          });
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function login() {
  const loginData = {
    email: "juan@test.com",
    password: "JuanTest2024!",
  };

  const response = await makeRequest("POST", "/api/auth/login", loginData);

  if (response.statusCode === 200 || response.statusCode === 201) {
    console.log("✅ Login exitoso");
    return response.body.access_token;
  } else {
    console.log("❌ Error en login:", response.statusCode, response.body);
    throw new Error("Login falló");
  }
}

async function obtenerPublicaciones(token) {
  const response = await makeRequest("GET", "/api/publicaciones", null, token);

  if (response.statusCode === 200) {
    return response.body.publicaciones || [];
  } else {
    console.log(
      "❌ Error obteniendo publicaciones:",
      response.statusCode,
      response.body,
    );
    return [];
  }
}

async function obtenerUsuarios(token) {
  const response = await makeRequest("GET", "/api/usuarios", null, token);

  if (response.statusCode === 200) {
    return response.body;
  } else {
    console.log(
      "❌ Error obteniendo usuarios:",
      response.statusCode,
      response.body,
    );
    return [];
  }
}

async function crearReserva(token, reservaData) {
  const response = await makeRequest(
    "POST",
    "/api/usuarios/reservas/crear",
    reservaData,
    token,
  );
  return response;
}

async function main() {
  try {
    console.log("🔍 DEBUG: CREACIÓN DE RESERVA");
    console.log("============================");

    const token = await login();

    const publicaciones = await obtenerPublicaciones(token);
    console.log(`📦 Publicaciones disponibles: ${publicaciones.length}`);

    if (publicaciones.length === 0) {
      console.log("❌ No hay publicaciones disponibles");
      return;
    }

    const publicacion = publicaciones[0];
    console.log(
      `📦 Usando publicación: ${publicacion.titulo} (${publicacion.id})`,
    );
    console.log(`👤 Propietario: ${publicacion.propietarioId}`);

    // Obtener información del usuario actual
    const usuarios = await obtenerUsuarios(token);
    console.log("👥 Usuarios disponibles:", usuarios.length);

    // Crear fechas válidas (mañana y pasado mañana)
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 1);
    fechaInicio.setHours(10, 0, 0, 0);

    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 2);
    fechaFin.setHours(18, 0, 0, 0);

    console.log(`📅 Fecha inicio: ${fechaInicio.toISOString()}`);
    console.log(`📅 Fecha fin: ${fechaFin.toISOString()}`);

    // Intentar crear una reserva con diferentes usuarios
    const usuariosIds = [
      "cmgv48937000c133iilmqhd1m",
      "cmgv48937000e133iilmqhd1p",
      "cmgv48937000f133iilmqhd1q",
    ];

    for (const usuarioId of usuariosIds) {
      if (usuarioId === publicacion.propietarioId) {
        console.log(`⏭️  Saltando usuario ${usuarioId} (es el propietario)`);
        continue;
      }

      console.log(`\n🧪 Probando con usuario: ${usuarioId}`);

      const reservaData = {
        usuarioId: usuarioId,
        publicacionId: publicacion.id,
        propietarioId: publicacion.propietarioId,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        precioTotal: 100.0,
        comisionPlataforma: 10.0,
        tipoEntrega: "DOMICILIO",
        direccionEntrega: "Calle Test 123",
        telefonoContacto: "+51987654321",
        notasUsuario: "Reserva de prueba",
      };

      console.log(
        "📝 Datos de la reserva:",
        JSON.stringify(reservaData, null, 2),
      );

      const response = await crearReserva(token, reservaData);
      console.log(`📊 Respuesta: ${response.statusCode}`);

      if (response.statusCode === 201) {
        console.log("✅ Reserva creada exitosamente");
        console.log("📄 Datos:", JSON.stringify(response.body, null, 2));
        break;
      } else {
        console.log("❌ Error creando reserva");
        console.log("📄 Error:", JSON.stringify(response.body, null, 2));
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main();
