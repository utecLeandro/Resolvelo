const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function crearUsuarioTest() {
  try {
    console.log("🔍 Creando usuario de prueba...");

    // Registrar un nuevo usuario
    const registroResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nombre: "Usuario",
      apellido: "Test",
      email: "test@test.com",
      password: "Test123@",
      telefono: "987654321",
      documentoIdentidad: "87654321",
    });

    console.log("✅ Usuario registrado exitosamente:");
    console.log(JSON.stringify(registroResponse.data, null, 2));

    // Probar login inmediatamente
    console.log("📝 Probando login...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: "test@test.com",
      password: "Test123@",
    });

    console.log("✅ Login exitoso:");
    console.log("Token:", loginResponse.data.access_token);
    console.log("Usuario ID:", loginResponse.data.user.id);
  } catch (error) {
    console.log("❌ Error:");
    console.log("Status:", error.response?.status);
    console.log("Error Data:", JSON.stringify(error.response?.data, null, 2));
  }
}

crearUsuarioTest();
