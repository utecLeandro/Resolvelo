const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3000/api";

async function debugReservas() {
  try {
    console.log("🔐 Haciendo login...");

    // 1. Login
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "maria@test.com",
        password: "MariaTest2024!",
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log("✅ Login exitoso");

    // 2. Obtener perfil
    const perfilResponse = await fetch(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const perfil = await perfilResponse.json();
    console.log("👤 Perfil obtenido:", perfil.id);

    // 3. Obtener publicaciones
    const publicacionesResponse = await fetch(`${BASE_URL}/publicaciones`, {
      method: "GET",
    });

    const publicacionesData = await publicacionesResponse.json();
    const publicaciones =
      publicacionesData.publicaciones ||
      publicacionesData.data ||
      publicacionesData;
    console.log("📋 Publicaciones disponibles:", publicaciones.length);

    if (publicaciones.length === 0) {
      throw new Error("No hay publicaciones disponibles");
    }

    const publicacion = publicaciones[0];
    console.log(
      "📝 Usando publicación:",
      publicacion.titulo,
      "ID:",
      publicacion.id,
    );

    // 4. Crear reserva con datos detallados
    const reservaData = {
      usuarioId: perfil.id,
      publicacionId: publicacion.id,
      propietarioId: publicacion.propietario.id,
      fechaInicio: "2024-12-20T10:00:00Z",
      fechaFin: "2024-12-22T18:00:00Z",
      precioTotal: publicacion.precioPorDia * 2,
      comisionPlataforma: publicacion.precioPorDia * 2 * 0.1,
      tipoEntrega: "DOMICILIO",
      direccionEntrega: "Av. Principal 123",
      telefonoContacto: "+51987654321",
      notasUsuario: "Necesito el equipo para un evento importante",
    };

    console.log(
      "📝 Datos de reserva a enviar:",
      JSON.stringify(reservaData, null, 2),
    );

    const crearReservaResponse = await fetch(
      `${BASE_URL}/usuarios/reservas/crear`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reservaData),
      },
    );

    console.log("📝 Status de respuesta:", crearReservaResponse.status);
    console.log(
      "📝 Headers de respuesta:",
      Object.fromEntries(crearReservaResponse.headers.entries()),
    );

    const reservaCreada = await crearReservaResponse.json();
    console.log(
      "📝 Respuesta completa:",
      JSON.stringify(reservaCreada, null, 2),
    );

    if (crearReservaResponse.ok) {
      console.log("✅ Reserva creada exitosamente");

      // 5. Listar reservas para verificar
      console.log("\n📋 Verificando reservas creadas...");
      const listarResponse = await fetch(
        `${BASE_URL}/usuarios/reservas/listar`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const reservasData = await listarResponse.json();
      console.log(
        "📋 Respuesta de listar reservas:",
        JSON.stringify(reservasData, null, 2),
      );
    } else {
      console.log("❌ Error al crear reserva");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

debugReservas();
