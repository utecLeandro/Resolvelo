const axios = require("axios");

const BASE_URL = "http://localhost:3000";

async function testReservaMaria() {
  try {
    console.log("🔍 Probando reserva con usuario cliente...");

    // Credenciales del cliente
    const credenciales = {
      email: "cliente@test.com",
      password: "Cliente123@",
    };

    // Login con cliente
    console.log("🔑 Haciendo login con cliente...");
    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      credenciales,
    );

    console.log("✅ Login exitoso con cliente");
    console.log("🆔 Usuario ID del cliente:", loginResponse.data.user.id);

    const token = loginResponse.data.access_token;
    const usuarioId = loginResponse.data.user.id;

    // Obtener detalles de la publicación
    console.log("📦 Obteniendo detalles de la publicación...");
    const publicacionId = "cmh029nuo0007e0y6jfpzg93i";

    const publicacionResponse = await axios.get(
      `${BASE_URL}/api/publicaciones/${publicacionId}`,
    );
    console.log("📋 Publicación encontrada:", {
      id: publicacionResponse.data.id,
      titulo: publicacionResponse.data.titulo,
      propietarioId: publicacionResponse.data.propietario.id,
      propietarioEmail: publicacionResponse.data.propietario.email,
    });

    // Verificar si el cliente es el propietario
    const propietarioId = publicacionResponse.data.propietario.id;
    if (usuarioId === propietarioId) {
      console.log(
        "❌ El cliente es el propietario de esta publicación, no puede reservarla",
      );
      return;
    }

    console.log(
      "✅ El cliente no es el propietario, puede proceder con la reserva",
    );

    // Preparar datos de reserva
    const ahora = new Date();
    const mañana = new Date(ahora);
    mañana.setDate(ahora.getDate() + 1);
    mañana.setHours(3, 0, 0, 0); // 3 AM para evitar problemas de zona horaria

    const pasadoMañana = new Date(mañana);
    pasadoMañana.setDate(mañana.getDate() + 2);
    pasadoMañana.setHours(2, 59, 59, 999);

    const datosReserva = {
      usuarioId: usuarioId,
      publicacionId: publicacionId,
      propietarioId: propietarioId,
      fechaInicio: mañana.toISOString(),
      fechaFin: pasadoMañana.toISOString(),
      precioTotal: 150.0,
      comisionPlataforma: 15.0,
      tipoEntrega: "DOMICILIO",
      direccionEntrega: "Calle María 789",
      telefonoContacto: "987654321",
      notasUsuario: "Reserva de prueba con María",
    };

    console.log("📦 Datos de la reserva:");
    console.log(JSON.stringify(datosReserva, null, 2));

    // Crear reserva
    console.log("🚀 Creando reserva...");
    const reservaResponse = await axios.post(
      `${BASE_URL}/api/usuarios/reservas/crear`,
      datosReserva,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(
      "🎉 ¡Reserva creada exitosamente con el cliente!",
      reservaResponse.data,
    );
  } catch (error) {
    console.error("❌ Error al crear reserva:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    if (error.response?.data) {
      console.error(
        "Error Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    console.error("Error Message:", error.message);

    if (error.response?.data?.message) {
      console.log(
        "🔍 Mensaje de error específico:",
        error.response.data.message,
      );
    }
  }
}

testReservaMaria();
