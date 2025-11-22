const axios = require("axios");

async function verificarPublicaciones() {
  try {
    console.log("🔍 Verificando carga de publicaciones...\n");

    // Verificar endpoint de publicaciones
    const response = await axios.get("http://localhost:3000/publicaciones");

    console.log(`✅ Estado de respuesta: ${response.status}`);
    console.log(`📊 Número de publicaciones: ${response.data.length}`);

    if (response.data.length > 0) {
      console.log("\n📋 Publicaciones encontradas:");
      response.data.forEach((pub, index) => {
        console.log(
          `${index + 1}. ${pub.titulo} - ${pub.estado} - $${pub.precioPorDia}/día`,
        );
        console.log(
          `   📍 ${pub.direccion}, ${pub.ciudad}, ${pub.departamento}`,
        );
        console.log(
          `   👤 Usuario: ${pub.usuario.nombre} ${pub.usuario.apellido}`,
        );
        console.log("");
      });
    } else {
      console.log("⚠️  No se encontraron publicaciones");
    }
  } catch (error) {
    console.error("❌ Error al verificar publicaciones:", error.message);
    if (error.response) {
      console.error(`   Estado: ${error.response.status}`);
      console.error(
        `   Datos: ${JSON.stringify(error.response.data, null, 2)}`,
      );
    }
  }
}

verificarPublicaciones();
