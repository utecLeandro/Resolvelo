const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

// Función para hacer login y obtener token
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    return response.data.access_token;
  } catch (error) {
    console.error(
      `Error en login de ${email}:`,
      error.response?.data || error.message,
    );
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
      "Error al obtener solicitudes:",
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
    return response.data.data || [];
  } catch (error) {
    console.error(
      "Error al obtener reservas:",
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
    throw error.response?.data || error.message;
  }
}

// Función para rechazar una solicitud
async function rechazarSolicitud(token, reservaId) {
  try {
    const response = await axios.patch(
      `${API_BASE}/usuarios/reservas/${reservaId}/rechazar`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

async function main() {
  console.log("🧪 Iniciando pruebas de aceptar/rechazar solicitudes...\n");

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

  // Obtener solicitudes pendientes de Federico
  console.log("3. Obteniendo solicitudes pendientes de Federico...");
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
  console.log("4. Obteniendo reservas de María (antes de la acción)...");
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

  // Si hay solicitudes pendientes, probar aceptar una
  if (solicitudesFederico.length > 0) {
    const solicitudParaAceptar = solicitudesFederico[0];
    console.log(
      `5. Federico acepta la solicitud ${solicitudParaAceptar.id}...`,
    );

    const resultadoAceptar = await aceptarSolicitud(
      tokenFederico,
      solicitudParaAceptar.id,
    );
    if (resultadoAceptar) {
      console.log("✅ Solicitud aceptada exitosamente");
    } else {
      console.log("❌ Error al aceptar solicitud");
    }
    console.log("");

    // Verificar que la reserva de María cambió de estado
    console.log("6. Verificando reservas de María después de aceptar...");
    const reservasMariaDespues = await obtenerMisReservas(tokenMaria);
    console.log(`📋 María tiene ${reservasMariaDespues.length} reservas`);

    if (reservasMariaDespues.length > 0) {
      console.log("Reservas de María (después):");
      reservasMariaDespues.forEach((reserva, index) => {
        console.log(
          `  ${index + 1}. ID: ${reserva.id}, Estado: ${reserva.estado}, Publicación: ${reserva.publicacion.titulo}`,
        );
      });

      // Buscar la reserva que debería haber cambiado de estado
      const reservaModificada = reservasMariaDespues.find(
        (r) => r.id === solicitudParaAceptar.id,
      );
      if (reservaModificada) {
        if (reservaModificada.estado === "CONFIRMADA") {
          console.log("✅ La reserva cambió correctamente a estado CONFIRMADA");
        } else {
          console.log(
            `⚠️  La reserva tiene estado ${reservaModificada.estado}, se esperaba CONFIRMADA`,
          );
        }
      }
    }
    console.log("");
  }

  // Verificar solicitudes pendientes de Federico después de la acción
  console.log(
    "7. Verificando solicitudes pendientes de Federico después de la acción...",
  );
  const solicitudesFedericoDespues =
    await obtenerSolicitudesPendientes(tokenFederico);
  console.log(
    `📋 Federico tiene ${solicitudesFedericoDespues.length} solicitudes pendientes`,
  );

  if (solicitudesFedericoDespues.length > 0) {
    console.log("Solicitudes restantes:");
    solicitudesFedericoDespues.forEach((solicitud, index) => {
      console.log(
        `  ${index + 1}. ID: ${solicitud.id}, Estado: ${solicitud.estado}, Arrendatario: ${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`,
      );
    });
  }

  console.log("\n🎉 Pruebas completadas!");
}

main().catch(console.error);
