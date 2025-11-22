const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

async function testLogin(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    console.log(`✅ Login exitoso para ${email}`);
    return response.data.access_token;
  } catch (error) {
    console.log(
      `❌ Login fallido para ${email} con contraseña "${password}":`,
      error.response?.data?.message || error.message,
    );
    return null;
  }
}

async function main() {
  console.log("🔍 Probando diferentes contraseñas para María...\n");

  const passwords = [
    "Maria123!",
    "maria123!",
    "password123",
    "Password123!",
    "test123",
    "Test123!",
  ];

  for (const password of passwords) {
    console.log(`Probando contraseña: "${password}"`);
    const token = await testLogin("maria@test.com", password);
    if (token) {
      console.log(`🎉 ¡Contraseña correcta encontrada: "${password}"!`);
      break;
    }
  }

  console.log("\n🔍 Probando también para Federico...\n");
  await testLogin("federico@test.com", "Federico123!");
}

main().catch(console.error);
