const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE_URL = "http://localhost:3000/api";

// Token de usuario Federico
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWd6azEzYjcwMDAwZHJ3MTJpY3hrMXc2IiwiZW1haWwiOiJmZWRlcmljb0B0ZXN0LmNvbSIsImlhdCI6MTc2MTAwNjQzOSwiZXhwIjoxNzYxMDkyODM5fQ.T9OpYrvU-Ln83oYgUZaT2z0s3Wc3rjRm6q0M8jSTFj4";

async function obtenerPublicaciones() {
  try {
    console.log("🔍 Obteniendo publicaciones...");
    const response = await axios.get(`${API_BASE_URL}/publicaciones`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    console.log("✅ Respuesta recibida:", response.status);
    console.log("📊 Datos de respuesta:", response.data);

    if (
      response.data &&
      response.data.publicaciones &&
      Array.isArray(response.data.publicaciones)
    ) {
      console.log(
        "Publicaciones encontradas:",
        response.data.publicaciones.length,
      );
      if (response.data.publicaciones.length > 0) {
        console.log("Primera publicación:", response.data.publicaciones[0]);
        return response.data.publicaciones[0].id;
      }
    } else if (Array.isArray(response.data) && response.data.length > 0) {
      console.log("Publicaciones encontradas:", response.data.length);
      console.log("Primera publicación:", response.data[0]);
      return response.data[0].id;
    }

    console.log("❌ No se encontraron publicaciones");
    return null;
  } catch (error) {
    console.error(
      "❌ Error al obtener publicaciones:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function crearImagenDePrueba() {
  // Crear una imagen SVG simple para prueba
  const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#4F46E5"/>
    <text x="100" y="100" text-anchor="middle" fill="white" font-size="20">Prueba</text>
  </svg>`;

  const imagePath = path.join(__dirname, "test-image.svg");
  fs.writeFileSync(imagePath, svgContent);
  return imagePath;
}

async function probarSubidaImagenes(publicacionId) {
  try {
    console.log(
      `\nProbando subida de imágenes para publicación: ${publicacionId}`,
    );

    // Crear imagen de prueba
    const imagePath = await crearImagenDePrueba();

    // Crear FormData
    const formData = new FormData();
    formData.append("imagenes", fs.createReadStream(imagePath));
    formData.append("imagenPrincipalIndex", "0");

    console.log("Enviando solicitud...");

    const response = await axios.post(
      `${API_BASE_URL}/imagenes/publicacion/${publicacionId}/multiples`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          ...formData.getHeaders(),
        },
      },
    );

    console.log("✅ Respuesta exitosa:", response.data);

    // Limpiar archivo de prueba
    fs.unlinkSync(imagePath);

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error al subir imágenes:",
      error.response?.data || error.message,
    );

    // Limpiar archivo de prueba en caso de error
    const imagePath = path.join(__dirname, "test-image.svg");
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    return null;
  }
}

async function main() {
  console.log("🧪 Iniciando prueba de subida de imágenes...\n");

  // Obtener una publicación existente
  const publicacionId = await obtenerPublicaciones();

  if (!publicacionId) {
    console.log("❌ No se encontraron publicaciones para probar");
    return;
  }

  // Probar subida de imágenes
  await probarSubidaImagenes(publicacionId);
}

main().catch(console.error);
