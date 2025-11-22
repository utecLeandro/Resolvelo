const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function crearPublicacionTest() {
  try {
    console.log("🔍 Creando publicación de prueba...");

    // Hacer login
    console.log("📝 Haciendo login...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: "test@test.com",
      password: "Test123@",
    });

    const token = loginResponse.data.access_token;
    const usuarioId = loginResponse.data.user.id;
    console.log("✅ Login exitoso, usuarioId:", usuarioId);

    // Crear publicación
    const publicacionData = {
      titulo: "Guitarra Eléctrica Fender",
      descripcion:
        "Excelente guitarra eléctrica Fender Stratocaster en perfecto estado. Ideal para músicos profesionales y aficionados.",
      categoria: "GUITARRAS",
      marca: "Fender",
      modelo: "Stratocaster",
      anioFabricacion: 2022,
      precioPorDia: 50.0,
      precioPorSemana: 300.0,
      deposito: 200.0,
      diasMinimoAlquiler: 1,
      diasMaximoAlquiler: 30,
      direccion: "Av. 18 de Julio 1234",
      ciudad: "Montevideo",
      departamento: "Montevideo",
      estadoEquipo: "EXCELENTE",
      entregaDomicilio: true,
      retiroLocal: true,
      instrucciones: "Guitarra en perfecto estado, incluye funda y cable.",
    };

    console.log("📦 Datos de la publicación:");
    console.log(JSON.stringify(publicacionData, null, 2));

    const publicacionResponse = await axios.post(
      `${BASE_URL}/publicaciones`,
      publicacionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Publicación creada exitosamente:");
    console.log(JSON.stringify(publicacionResponse.data, null, 2));
  } catch (error) {
    console.log("❌ Error al crear publicación:");
    console.log("Status:", error.response?.status);
    console.log("Error Data:", JSON.stringify(error.response?.data, null, 2));
  }
}

crearPublicacionTest();
