const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function obtenerPublicacion() {
  try {
    console.log("🔍 Obteniendo detalles de la publicación...");

    const publicacionId = "cmh029nuo0007e0y6jfpzg93i";
    const response = await axios.get(
      `${BASE_URL}/publicaciones/${publicacionId}`,
    );

    console.log("✅ Publicación encontrada:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Error al obtener publicación:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Error Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

obtenerPublicacion();
