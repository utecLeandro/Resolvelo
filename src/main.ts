/**
 * Punto de entrada de la aplicación NestJS.
 * Se configura la app con buenas prácticas de seguridad y CORS.
 */
import "dotenv/config"; // Carga variables de entorno desde .env
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule, __APP_MODULE_MARKER__ } from "./app.module";
import { TransaccionesModule } from "./transacciones/transacciones.module";
import { TransaccionesService } from "./transacciones/transacciones.service";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  console.log(
    "[Main] Import debug -> typeof TransaccionesModule =",
    typeof TransaccionesModule,
  );
  console.log("[Main] Bootstrap iniciando...");
  try {
    // Mostrar desde qué archivo se está resolviendo app.module y el marcador actual
    // Esto ayuda a detectar si el runtime está usando una ubicación inesperada (p. ej., carpeta con distinto casing)
    // @ts-ignore
    const resolvedAppModule = require.resolve("./app.module");
    console.log("[Main] require.resolve(./app.module) ->", resolvedAppModule);
    console.log("[Main] __APP_MODULE_MARKER__ ->", __APP_MODULE_MARKER__);
  } catch (e) {
    console.warn("[Main] No se pudo resolver ruta de app.module", e);
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar servicio de archivos estáticos para imágenes
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  // Configurar validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma automáticamente los tipos
      disableErrorMessages: false, // Mantiene mensajes de error detallados
    }),
  );

  // Habilitar CORS siguiendo configuración de entorno
  // Si CORS_ORIGIN no está definido, reflejamos el origen en desarrollo para evitar bloqueos
  const corsOriginEnv = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv.split(",").map((o) => o.trim())
    : [];

  if (allowedOrigins.length > 0) {
    // Producción / configuración explícita
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: "Content-Type, Authorization",
    });
  } else {
    // Desarrollo: reflejar el origen para que el navegador reciba Access-Control-Allow-Origin correcto
    app.enableCors({
      origin: true, // refleja el Origin recibido
      credentials: false,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: "Content-Type, Authorization",
    });
  }

  // Prefijo global para la API
  app.setGlobalPrefix("api");

  // Endpoint de debug para listar rutas registradas
  try {
    const express = app.getHttpAdapter().getInstance();
    express.get("/api/__routes", (_req: Request, res: Response) => {
      const stack = express._router?.stack || [];
      const routes = [] as any[];
      for (const layer of stack) {
        if (layer.route && layer.route.path) {
          const methods = Object.keys(layer.route.methods).filter(
            (m) => layer.route.methods[m],
          );
          routes.push({ path: layer.route.path, methods });
        }
      }
      res.json({ routes });
    });
    // Endpoint para verificar el marcador del AppModule en tiempo de ejecución
    express.get("/api/__marker", (_req: Request, res: Response) => {
      res.json({ marker: __APP_MODULE_MARKER__ });
    });
    // Endpoint para verificar el marcador haciendo require dinámico (sin usar el import de TS)
    express.get("/api/__marker-runtime", (_req: Request, res: Response) => {
      try {
        // @ts-ignore
        const modPath = require.resolve("./app.module");
        // Forzar recarga del módulo para descartar caché si existe
        // @ts-ignore
        delete require.cache[modPath];
        // @ts-ignore
        const freshMod = require(modPath);
        const runtimeMarker =
          freshMod.__APP_MODULE_MARKER__ ??
          "(sin export __APP_MODULE_MARKER__)";
        res.json({
          modPath,
          runtimeMarker,
          typeofAppModule: typeof freshMod.AppModule,
        });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });
    // Endpoint para verificar desde qué archivo se está resolviendo app.module
    express.get("/api/__resolved-appmodule", (_req: Request, res: Response) => {
      try {
        // @ts-ignore
        const resolved = require.resolve("./app.module");
        res.json({ resolved });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });
    // Endpoint para leer el contenido actual del archivo app.module.ts directamente del disco
    express.get("/api/__app-module-file", (_req: Request, res: Response) => {
      try {
        // @ts-ignore
        const resolved = require.resolve("./app.module");
        const fs = require("fs");
        const content = fs.readFileSync(resolved, "utf8");
        res.json({ resolved, contentSnippet: content.slice(0, 300) });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });
    // Endpoint público de verificación de estado de pago (debug)
    express.get(
      "/api/debug/mp/verificar/:transaccionId",
      async (req: Request, res: Response) => {
        try {
          const transaccionesService = app.get(TransaccionesService);
          const resp =
            await transaccionesService.verificarEstadoMercadoPagoPorTransaccion(
              req.params.transaccionId,
            );
          res.json(resp);
        } catch (e) {
          const message =
            typeof e === "object" && e && "message" in (e as any)
              ? (e as any).message
              : String(e);
          res.status(400).json({ error: message });
        }
      },
    );

    // Ruta pública principal de verificación (fallback temporal para asegurar disponibilidad en desarrollo)
    // Esto evita depender exclusivamente de los controladores si hay problemas de registro en dev.
    express.get(
      "/api/transacciones/mercado-pago/verificar/:transaccionId",
      async (req: Request, res: Response) => {
        try {
          const transaccionesService = app.get(TransaccionesService);
          const resp =
            await transaccionesService.verificarEstadoMercadoPagoPorTransaccion(
              req.params.transaccionId,
            );
          res.json(resp);
        } catch (e) {
          const message =
            typeof e === "object" && e && "message" in (e as any)
              ? (e as any).message
              : String(e);
          res.status(400).json({ error: message });
        }
      },
    );
  } catch (e) {
    console.warn("[Main] No se pudo registrar endpoint de rutas", e);
  }

  // Asegurar puerto de arranque evitando conflictos en 3000
  const port = parseInt(process.env.PORT ?? "3001", 10);
  // Escuchar en 0.0.0.0 por defecto para aceptar conexiones desde fuera del contenedor
  const host = (process.env.HOST ?? "0.0.0.0").trim();
  console.log(
    `[Main] Intentando escuchar en http://${host}:${port} (env PORT=${process.env.PORT ?? "no definido"})`,
  );
  const server = await app.listen(port, host);
  try {
    // @ts-ignore
    const addr = (server as any).address?.();
    console.log("[Main] address():", addr);
    console.log(
      `[Main] Escuchando en http://${host}:${port} (prefijo global: /api)`,
    );
  } catch (e) {
    console.log("[Main] No se pudo obtener address()", e);
  }
}
bootstrap();
