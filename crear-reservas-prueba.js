const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

// Función para hacer login y obtener token
async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error en login:", error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener publicaciones
async function obtenerPublicaciones(token) {
  try {
    const response = await axios.get(`${BASE_URL}/publicaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener publicaciones:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Función para crear una reserva
async function crearReserva(token, publicacionId, fechaInicio, fechaFin) {
  try {
    const response = await axios.post(
      `${BASE_URL}/usuarios/reservas`,
      {
        publicacionId,
        fechaInicio,
        fechaFin,
        comentarios: "Reserva de prueba",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al crear reserva:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Función para aprobar una reserva
async function aprobarReserva(token, reservaId) {
  try {
    const response = await axios.post(
      `${BASE_URL}/usuarios/reservas/${reservaId}/aceptar`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al aprobar reserva:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

// Función para rechazar una reserva
async function rechazarReserva(token, reservaId, motivo = "Prueba de rechazo") {
  try {
    const response = await axios.post(
      `${BASE_URL}/usuarios/reservas/${reservaId}/rechazar`,
      {
        motivo,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al rechazar reserva:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function main() {
  try {
    console.log("🚀 Iniciando creación de reservas de prueba...");

    // Login como Federico (propietario)
    console.log("📝 Haciendo login como Federico...");
    const tokenFederico = await login("federico@test.com", "password123");
    console.log("✅ Login exitoso como Federico");

    // Registrar María como arrendataria
    console.log("📝 Registrando María...");
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        nombre: "María",
        apellido: "González",
        email: "maria@test.com",
        password: "password123",
        telefono: "+56987654321",
        fechaNacimiento: "1992-03-15",
      });
      console.log("✅ María registrada exitosamente");
    } catch (error) {
      if (error.response?.status === 409) {
        console.log("ℹ️ María ya está registrada");
      } else {
        throw error;
      }
    }

    // Login como María (inquilina)
    console.log("📝 Haciendo login como María...");
    const tokenMaria = await login("maria@test.com", "password123");
    console.log("✅ Login exitoso como María");

    // Obtener publicaciones de Federico
    console.log("📋 Obteniendo publicaciones...");
    const publicaciones = await obtenerPublicaciones(tokenFederico);
    console.log(`📊 Encontradas ${publicaciones.length} publicaciones`);

    if (publicaciones.length === 0) {
      console.log("❌ No hay publicaciones disponibles");
      return;
    }

    const publicacion = publicaciones[0];
    console.log(
      `🎵 Usando publicación: ${publicacion.titulo} (ID: ${publicacion.id})`,
    );

    // Crear varias reservas como María
    const fechaBase = new Date();
    fechaBase.setDate(fechaBase.getDate() + 1); // Mañana

    const reservas = [];

    // Reserva 1 - Para aprobar
    console.log("📅 Creando reserva 1 (para aprobar)...");
    const fecha1Inicio = new Date(fechaBase);
    const fecha1Fin = new Date(fechaBase);
    fecha1Fin.setDate(fecha1Fin.getDate() + 2);

    const reserva1 = await crearReserva(
      tokenMaria,
      publicacion.id,
      fecha1Inicio.toISOString().split("T")[0],
      fecha1Fin.toISOString().split("T")[0],
    );
    reservas.push(reserva1);
    console.log(`✅ Reserva 1 creada: ${reserva1.id}`);

    // Reserva 2 - Para rechazar
    console.log("📅 Creando reserva 2 (para rechazar)...");
    const fecha2Inicio = new Date(fechaBase);
    fecha2Inicio.setDate(fecha2Inicio.getDate() + 5);
    const fecha2Fin = new Date(fecha2Inicio);
    fecha2Fin.setDate(fecha2Fin.getDate() + 2);

    const reserva2 = await crearReserva(
      tokenMaria,
      publicacion.id,
      fecha2Inicio.toISOString().split("T")[0],
      fecha2Fin.toISOString().split("T")[0],
    );
    reservas.push(reserva2);
    console.log(`✅ Reserva 2 creada: ${reserva2.id}`);

    // Reserva 3 - Dejar pendiente
    console.log("📅 Creando reserva 3 (dejar pendiente)...");
    const fecha3Inicio = new Date(fechaBase);
    fecha3Inicio.setDate(fecha3Inicio.getDate() + 10);
    const fecha3Fin = new Date(fecha3Inicio);
    fecha3Fin.setDate(fecha3Fin.getDate() + 2);

    const reserva3 = await crearReserva(
      tokenMaria,
      publicacion.id,
      fecha3Inicio.toISOString().split("T")[0],
      fecha3Fin.toISOString().split("T")[0],
    );
    reservas.push(reserva3);
    console.log(`✅ Reserva 3 creada: ${reserva3.id}`);

    // Esperar un poco antes de procesar
    console.log("⏳ Esperando 2 segundos...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Aprobar la primera reserva como Federico
    console.log("✅ Aprobando reserva 1...");
    await aprobarReserva(tokenFederico, reserva1.id);
    console.log("✅ Reserva 1 aprobada");

    // Rechazar la segunda reserva como Federico
    console.log("❌ Rechazando reserva 2...");
    await rechazarReserva(
      tokenFederico,
      reserva2.id,
      "Fechas no disponibles - prueba",
    );
    console.log("❌ Reserva 2 rechazada");

    console.log("\n🎉 ¡Reservas de prueba creadas exitosamente!");
    console.log("📊 Resumen:");
    console.log(`   - Reserva ${reserva1.id}: APROBADA`);
    console.log(`   - Reserva ${reserva2.id}: RECHAZADA`);
    console.log(`   - Reserva ${reserva3.id}: PENDIENTE`);
    console.log(
      "\n🌐 Ahora puedes verificar las pestañas en: http://localhost:5173/mis-publicaciones",
    );
  } catch (error) {
    console.error("❌ Error en el proceso:", error.message);
  }
}

main();
