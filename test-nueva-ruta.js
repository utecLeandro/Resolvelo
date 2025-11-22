const axios = require("axios");

const BASE_URL = "http://localhost:3000";

async function testNuevaRuta() {
  try {
    console.log("🔍 Probando nueva ruta...");

    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "federico@test.com",
      password: "Federico123!",
    });

    const token = loginResponse.data.access_token;
    console.log("✅ Login exitoso");

    // Probar nueva ruta
    console.log(
      "🔍 Probando /api/usuarios/reservas/todas-mis-solicitudes-test...",
    );
    const response = await axios.get(
      `${BASE_URL}/api/usuarios/reservas/todas-mis-solicitudes-test`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Respuesta exitosa:");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log("❌ Error:", {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}

testNuevaRuta();
