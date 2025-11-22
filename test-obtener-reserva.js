const axios = require("axios");

const BASE_URL = "http://localhost:3000";

async function testObtenerReserva() {
  try {
    console.log("🔧 Probando endpoint de obtener reserva...");

    // 1. Login
    console.log("1. Haciendo login...");
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "test@test.com",
      password: "Test123@",
    });

    const token = loginResponse.data.access_token;
    console.log("✅ Login exitoso");

    // 2. Obtener reserva por ID
    const reservaId = "cmh05wkgs0005umr85c4qfjom";
    console.log(`2. Obteniendo reserva ${reservaId}...`);

    const reservaResponse = await axios.get(
      `${BASE_URL}/api/usuarios/reservas/${reservaId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    console.log("✅ Reserva obtenida exitosamente:");
    console.log(JSON.stringify(reservaResponse.data, null, 2));
  } catch (error) {
    console.log("❌ Error:", {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}

testObtenerReserva();
