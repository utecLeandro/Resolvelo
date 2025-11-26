/**
 * Script de healthcheck para el contenedor del backend.
 * Verifica que el endpoint `/api/health` responda con `{status:"OK"}`.
 * Este archivo es utilizado por la instrucción `HEALTHCHECK` del Dockerfile.
 */

const http = require("http");

// Puerto y ruta del healthcheck
const port = Number(process.env.PORT) || 3000;
const host = "127.0.0.1"; // Usamos loopback dentro del contenedor
const path = "/api/health";

// Opciones del request HTTP
const options = {
  host,
  port,
  path,
  method: "GET",
  timeout: 3000, // 3 segundos de timeout
  headers: {
    Accept: "application/json",
  },
};

// Ejecutar solicitud
const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    try {
      const json = body ? JSON.parse(body) : {};
      const ok = res.statusCode === 200 && json && json.status === "OK";
      if (ok) {
        console.log("✅ Healthcheck OK");
        process.exit(0);
      } else {
        console.error(
          `❌ Healthcheck NO OK (code=${res.statusCode}) body=${body}`,
        );
        process.exit(1);
      }
    } catch (err) {
      console.error("❌ Error parseando respuesta del healthcheck", err);
      process.exit(1);
    }
  });
});

// Manejo de errores y timeout
req.on("error", (err) => {
  console.error("❌ Error de conexión en healthcheck", err);
  process.exit(1);
});
req.on("timeout", () => {
  console.error("❌ Healthcheck timeout");
  req.destroy();
  process.exit(1);
});

// Finalizar request
req.end();
