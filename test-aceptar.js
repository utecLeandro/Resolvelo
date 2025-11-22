const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

// Función para hacer login
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error en login:", error.response?.data || error.message);
    return null;
  }
}

// Función para obtener solicitudes pendientes
async function obtenerSolicitudesPendientes(token) {
  try {
    const response = await axios.get(
      `${API_BASE}/usuarios/reservas/mis-solicitudes`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Error al obtener solicitudes pendientes:",
      error.response?.data || error.message,
    );
    return [];
  }
}

// Función para obtener mis reservas
async function obtenerMisReservas(token) {
  try {
    const response = await axios.get(
      `${API_BASE}/usuarios/reservas/mis-reservas`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error(
      "Error al obtener mis reservas:",
      error.response?.data || error.message,
    );
    return [];
  }
}

// Función para aceptar una solicitud
async function aceptarSolicitud(token, reservaId) {
  try {
    const response = await axios.patch(
      `${API_BASE}/usuarios/reservas/${reservaId}/aceptar`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al aceptar solicitud:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Función para obtener información del usuario autenticado
async function obtenerUsuarioAutenticado(token) {
  try {
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener usuario autenticado:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Función para obtener información de una publicación
async function obtenerPublicacion(token, publicacionId) {
  try {
    const response = await axios.get(
      `${API_BASE}/publicaciones/${publicacionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener publicación:",
      error.response?.data || error.message,
    );
    return null;
  }
}

// Función para crear una reserva
async function crearReserva(token, publicacionId, usuarioId) {
  try {
    // Obtener información de la publicación para calcular precios
    const publicacion = await obtenerPublicacion(token, publicacionId);
    if (!publicacion || !publicacion.id) {
      throw new Error("No se pudo obtener información de la publicación");
    }

    const precioPorDia = publicacion.precioPorDia;
    const dias = 3; // 2025-12-20 a 2025-12-22 = 3 días
    const precioTotal = precioPorDia * dias;
    const comisionPlataforma = precioTotal * 0.1; // 10% de comisión

    const reservaData = {
      usuarioId: usuarioId,
      publicacionId: publicacionId,
      propietarioId: publicacion.propietarioId,
      fechaInicio: "2026-01-15",
      fechaFin: "2026-01-17",
      precioTotal: precioTotal,
      comisionPlataforma: comisionPlataforma,
      tipoEntrega: "RETIRO",
      telefonoContacto: "+57 300 123 4567",
      notasUsuario: "Solicitud de prueba para aceptar",
    };

    const response = await axios.post(
      `${API_BASE}/usuarios/reservas/crear`,
      reservaData,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al crear reserva:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function main() {
  console.log("🧪 Iniciando pruebas de aceptar solicitudes...\n");

  // Login de Federico (propietario)
  console.log("1. Login de Federico (propietario)...");
  const tokenFederico = await login(
    "gtbump2012@gmail.com",
    "FedericoTest2024!",
  );
  if (!tokenFederico) {
    console.log("❌ No se pudo hacer login de Federico");
    return;
  }
  console.log("✅ Federico logueado exitosamente\n");

  // Login de María (arrendataria)
  console.log("2. Login de María (arrendataria)...");
  const tokenMaria = await login("maria@test.com", "MariaTest2024!");
  if (!tokenMaria) {
    console.log("❌ No se pudo hacer login de María");
    return;
  }
  console.log("✅ María logueada exitosamente\n");

  // Obtener información de María
  console.log("3. Obteniendo información de María...");
  const infoMaria = await obtenerUsuarioAutenticado(tokenMaria);
  if (!infoMaria) {
    console.log("❌ No se pudo obtener información de María");
    return;
  }
  console.log("✅ Información de María obtenida exitosamente\n");

  // María crea una nueva reserva
  console.log("4. María crea una nueva reserva...");
  const publicacionId = "cmgxzc40c000dn4c31q3loiai"; // Teclado de Federico
  const nuevaReserva = await crearReserva(
    tokenMaria,
    publicacionId,
    infoMaria.id,
  );
  if (!nuevaReserva) {
    console.log("❌ Error al crear nueva reserva");
    return;
  }
  console.log("✅ Nueva reserva creada exitosamente");
  console.log(
    `   ID de reserva: ${nuevaReserva.data?.id || nuevaReserva.id || "No disponible"}`,
  );
  console.log(`   Estado: ${nuevaReserva.data?.estado || "No disponible"}`);
  console.log(
    `   Fechas: ${nuevaReserva.data?.fechaInicio || "No disponible"} a ${nuevaReserva.data?.fechaFin || "No disponible"}\n`,
  );

  // Obtener solicitudes pendientes de Federico
  console.log("5. Obteniendo solicitudes pendientes de Federico...");
  const solicitudesFederico = await obtenerSolicitudesPendientes(tokenFederico);
  console.log(
    `📋 Federico tiene ${solicitudesFederico.length} solicitudes pendientes`,
  );

  if (solicitudesFederico.length > 0) {
    console.log("Solicitudes:");
    solicitudesFederico.forEach((solicitud, index) => {
      console.log(
        `  ${index + 1}. ID: ${solicitud.id}, Estado: ${solicitud.estado}, Arrendatario: ${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`,
      );
    });
  }
  console.log("");

  // Obtener reservas de María antes de la acción
  console.log("6. Obteniendo reservas de María (antes de la acción)...");
  const reservasMariaAntes = await obtenerMisReservas(tokenMaria);
  console.log(`📋 María tiene ${reservasMariaAntes.length} reservas`);

  if (reservasMariaAntes.length > 0) {
    console.log("Reservas de María (antes):");
    reservasMariaAntes.forEach((reserva, index) => {
      console.log(
        `  ${index + 1}. ID: ${reserva.id}, Estado: ${reserva.estado}, Publicación: ${reserva.publicacion.titulo}`,
      );
    });
  }
  console.log("");

  // Si hay solicitudes pendientes, aceptar la primera
  if (solicitudesFederico.length > 0) {
    const solicitudParaAceptar = solicitudesFederico[0];
    console.log(
      `7. Federico acepta la solicitud ${solicitudParaAceptar.id}...`,
    );

    const resultado = await aceptarSolicitud(
      tokenFederico,
      solicitudParaAceptar.id,
    );
    if (resultado) {
      console.log("✅ Solicitud aceptada exitosamente\n");
    } else {
      console.log("❌ Error al aceptar solicitud\n");
      return;
    }

    // Verificar reservas de María después de aceptar
    console.log("8. Verificando reservas de María después de aceptar...");
    const reservasMariaDepues = await obtenerMisReservas(tokenMaria);
    console.log(`📋 María tiene ${reservasMariaDepues.length} reservas`);

    if (reservasMariaDepues.length > 0) {
      console.log("Reservas de María (después):");
      reservasMariaDepues.forEach((reserva, index) => {
        console.log(
          `  ${index + 1}. ID: ${reserva.id}, Estado: ${reserva.estado}, Publicación: ${reserva.publicacion.titulo}`,
        );
      });
    }

    // Verificar que la reserva cambió de estado
    const reservaAceptada = reservasMariaDepues.find(
      (r) => r.id === solicitudParaAceptar.id,
    );
    if (reservaAceptada && reservaAceptada.estado === "CONFIRMADA") {
      console.log("✅ La reserva cambió correctamente a estado CONFIRMADA\n");
    } else {
      console.log("❌ La reserva no cambió de estado correctamente\n");
    }

    // Verificar solicitudes pendientes de Federico después de la acción
    console.log(
      "9. Verificando solicitudes pendientes de Federico después de la acción...",
    );
    const solicitudesFedericoDepues =
      await obtenerSolicitudesPendientes(tokenFederico);
    console.log(
      `📋 Federico tiene ${solicitudesFedericoDepues.length} solicitudes pendientes\n`,
    );
  } else {
    console.log(
      "ℹ️  No hay solicitudes pendientes para probar la funcionalidad de aceptar\n",
    );
  }

  console.log("🎉 Pruebas completadas!");
}

main().catch(console.error);
