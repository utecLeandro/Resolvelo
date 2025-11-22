const axios = require("axios");

const BASE_URL = "http://localhost:3000";

async function crearReservaConfirmada() {
  try {
    console.log("🔧 Creando reserva de prueba en estado CONFIRMADA...");

    // 1. Login como test@test.com
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "test@test.com",
      password: "Test123@",
    });

    const token = loginResponse.data.access_token;
    console.log("✅ Login exitoso");

    // 2. Obtener publicaciones disponibles
    const publicacionesResponse = await axios.get(
      `${BASE_URL}/api/publicaciones`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const publicaciones =
      publicacionesResponse.data.data || publicacionesResponse.data;
    console.log(`📋 Encontradas ${publicaciones.length} publicaciones`);

    if (publicaciones.length === 0) {
      console.log("❌ No hay publicaciones disponibles");
      return;
    }

    // Tomar la primera publicación
    const publicacion = publicaciones[0];
    console.log(
      `✅ Usando publicación: ${publicacion.id} - ${publicacion.titulo}`,
    );

    // 3. Crear reserva
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 1); // Mañana
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 2); // Pasado mañana

    const reservaData = {
      publicacionId: publicacion.id,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      mensaje: "Reserva de prueba para testing",
    };

    console.log("📝 Creando reserva...");
    const crearResponse = await axios.post(
      `${BASE_URL}/api/usuarios/reservas/crear`,
      reservaData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const reservaCreada = crearResponse.data;
    console.log("✅ Reserva creada:", reservaCreada);

    // 4. Ahora necesitamos confirmar la reserva (simular que el propietario la acepta)
    // Para esto necesitamos el token del propietario de la publicación
    console.log("\n🔄 Intentando confirmar la reserva...");

    // Primero obtener el propietario de la publicación
    console.log("Propietario de la publicación:", publicacion.propietarioId);

    console.log(
      "\n✅ Reserva creada exitosamente. ID:",
      reservaCreada.data?.id || reservaCreada.id,
    );
    console.log(
      "📝 Para completar la prueba, necesitas que el propietario acepte la reserva.",
    );
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

crearReservaConfirmada();
