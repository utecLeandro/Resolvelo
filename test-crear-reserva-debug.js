const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function testCrearReserva() {
  try {
    console.log("🔍 Iniciando prueba de creación de reserva...");

    // Primero, hacer login para obtener el token
    console.log("📝 Haciendo login...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: "test@test.com",
      password: "Test123@",
    });

    const token = loginResponse.data.access_token;
    const usuarioId = loginResponse.data.user.id;
    console.log("✅ Login exitoso, usuarioId:", usuarioId);

    // Usar la publicación que acabamos de crear
    const publicacionId = "cmh029nuo0007e0y6jfpzg93i"; // ID de la guitarra creada
    console.log(`📦 Usando publicación ID: ${publicacionId}`);

    // Preparar datos de la reserva
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    mañana.setHours(0, 0, 0, 0);

    const pasadoMañana = new Date();
    pasadoMañana.setDate(pasadoMañana.getDate() + 2);
    pasadoMañana.setHours(23, 59, 59, 999);

    const datosReserva = {
      usuarioId: usuarioId,
      publicacionId: publicacionId,
      propietarioId: "cmh027hzy0005e0y67sgdbj5j", // ID del propietario de la guitarra
      fechaInicio: mañana.toISOString(),
      fechaFin: pasadoMañana.toISOString(),
      precioTotal: 100.0,
      comisionPlataforma: 10.0,
      tipoEntrega: "DOMICILIO",
      direccionEntrega: "Calle Test 123",
      telefonoContacto: "987654321",
      notasUsuario: "Reserva de prueba",
    };

    console.log("📦 Datos de la reserva:");
    console.log(JSON.stringify(datosReserva, null, 2));

    // Intentar crear la reserva
    console.log("🚀 Creando reserva...");
    const reservaResponse = await axios.post(
      `${BASE_URL}/usuarios/reservas/crear`,
      datosReserva,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Reserva creada exitosamente:");
    console.log(JSON.stringify(reservaResponse.data, null, 2));
  } catch (error) {
    console.log("❌ Error al crear reserva:");
    console.log("Status:", error.response?.status);
    console.log("Status Text:", error.response?.statusText);
    console.log("Error Data:", JSON.stringify(error.response?.data, null, 2));
    console.log("Error Message:", error.message);

    if (error.response?.data?.message) {
      console.log(
        "🔍 Mensaje de error específico:",
        error.response.data.message,
      );
    }
  }
}

testCrearReserva();
