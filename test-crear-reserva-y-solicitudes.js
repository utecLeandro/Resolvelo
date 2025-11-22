const fetch = require("node-fetch");

async function testCrearReservaYSolicitudes() {
  console.log("🧪 Iniciando pruebas de crear reserva y mis-solicitudes...");

  try {
    // IDs conocidos de la base de datos (del seed)
    const mariaId = "cmgv4891h0001133imflmmllb"; // ID de maria@test.com
    const juanId = "cmgv4890t0000133izvwqlfdt"; // ID de juan@test.com (propietario)

    // 1. Login como maria (quien hará la reserva)
    console.log("\n1️⃣ Haciendo login como maria...");
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "maria@test.com",
        password: "MariaTest2024!",
      }),
    });

    const loginData = await loginResponse.json();
    console.log("🔐 Login Response:", loginResponse.status);

    if (loginResponse.status !== 200) {
      console.log("❌ Error en login:", loginData);
      return;
    }

    console.log("✅ Login exitoso");
    const token = loginData.access_token;

    // 2. Obtener publicaciones disponibles
    const publicacionesResponse = await fetch(
      "http://localhost:3000/api/publicaciones",
    );
    const publicacionesData = await publicacionesResponse.json();
    console.log(
      "📋 Publicaciones disponibles:",
      publicacionesData.publicaciones?.length || 0,
    );

    if (
      !publicacionesData.publicaciones ||
      publicacionesData.publicaciones.length === 0
    ) {
      console.log("❌ No hay publicaciones disponibles");
      return;
    }

    // Usar la primera publicación de Juan
    const publicacion = publicacionesData.publicaciones.find(
      (p) => p.propietarioId === juanId,
    );
    if (!publicacion) {
      console.log("❌ No se encontró publicación de Juan");
      return;
    }

    console.log(
      "📝 Usando publicación:",
      publicacion.titulo,
      "ID:",
      publicacion.id,
    );

    // 3. Crear reserva con fechas futuras
    console.log("\n2️⃣ Creando reserva...");

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 7); // 7 días en el futuro
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 9); // 9 días en el futuro

    const reservaData = {
      usuarioId: mariaId,
      publicacionId: publicacion.id,
      propietarioId: publicacion.propietarioId,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      precioTotal: publicacion.precioPorDia * 2,
      comisionPlataforma: Math.round(publicacion.precioPorDia * 2 * 0.1),
      tipoEntrega: "DOMICILIO",
      direccionEntrega: "Av. Principal 123",
      telefonoContacto: "+51987654321",
      notasUsuario: "Reserva de prueba para testing",
    };

    console.log("📝 Datos de reserva:", JSON.stringify(reservaData, null, 2));

    const crearReservaResponse = await fetch(
      "http://localhost:3000/api/usuarios/reservas/crear",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reservaData),
      },
    );

    const crearReservaData = await crearReservaResponse.json();
    console.log("📝 Status crear reserva:", crearReservaResponse.status);

    if (crearReservaResponse.status === 201) {
      console.log("✅ Reserva creada exitosamente:", crearReservaData.id);
    } else {
      console.log("❌ Error al crear reserva:", crearReservaData);
    }

    // 4. Login como Juan (propietario) para probar mis-solicitudes
    console.log("\n3️⃣ Haciendo login como Juan (propietario)...");

    const loginJuanResponse = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "juan@test.com",
          password: "JuanTest2024!",
        }),
      },
    );

    const loginJuanData = await loginJuanResponse.json();

    if (loginJuanResponse.status !== 200) {
      console.log("❌ Error en login de Juan:", loginJuanData);
      return;
    }

    console.log("✅ Login exitoso como Juan");
    const tokenJuan = loginJuanData.access_token;

    // 5. Probar endpoint mis-solicitudes
    console.log("\n4️⃣ Probando endpoint mis-solicitudes...");

    const misSolicitudesResponse = await fetch(
      "http://localhost:3000/api/usuarios/reservas/mis-solicitudes",
      {
        headers: {
          Authorization: `Bearer ${tokenJuan}`,
        },
      },
    );

    const misSolicitudesData = await misSolicitudesResponse.json();
    console.log("📋 Mis Solicitudes Response:", misSolicitudesResponse.status);

    if (misSolicitudesResponse.status === 200) {
      console.log("✅ Endpoint mis-solicitudes funcionando");
      console.log(
        "📋 Solicitudes encontradas:",
        misSolicitudesData.length || 0,
      );
      if (misSolicitudesData.length > 0) {
        console.log(
          "📝 Primera solicitud:",
          JSON.stringify(misSolicitudesData[0], null, 2),
        );
      }
    } else {
      console.log("❌ Error en mis-solicitudes:", misSolicitudesData);
    }
  } catch (error) {
    console.error("❌ Error general:", error.message);
  }

  console.log("\n🎉 Pruebas completadas");
}

testCrearReservaYSolicitudes();
