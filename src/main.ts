/**
 * Punto de entrada de la aplicación NestJS.
 * Se configura la app con buenas prácticas de seguridad y CORS.
 */
import 'dotenv/config'; // Carga variables de entorno desde .env
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule, __APP_MODULE_MARKER__ } from './app.module';
import { TransaccionesModule } from './transacciones/transacciones.module';
import { TransaccionesService } from './transacciones/transacciones.service';
import { CalificacionesService } from './calificaciones/calificaciones.service';
import { JwtService } from '@nestjs/jwt';
import { MensajesService } from './mensajes/mensajes.service';
import { PrismaService } from './prisma/prisma.service';
import { EmailService } from './email/email.service';
import * as bodyParser from 'body-parser';
import type { Request, Response } from 'express';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NotificacionesService } from './notificaciones/notificaciones.service';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BigIntSerializerInterceptor,
  serializeBigInt,
} from './common/interceptors/bigint-serializer.interceptor';

async function bootstrap() {
  console.log(
    '[Main] Import debug -> typeof TransaccionesModule =',
    typeof TransaccionesModule,
  );
  console.log('[Main] Bootstrap iniciando...');
  try {
    // Mostrar desde qué archivo se está resolviendo app.module y el marcador actual
    // Esto ayuda a detectar si el runtime está usando una ubicación inesperada (p. ej., carpeta con distinto casing)
    const resolvedAppModule = require.resolve('./app.module');
    console.log('[Main] require.resolve(./app.module) ->', resolvedAppModule);
    console.log('[Main] __APP_MODULE_MARKER__ ->', __APP_MODULE_MARKER__);
  } catch (e) {
    console.warn('[Main] No se pudo resolver ruta de app.module', e);
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Logger middleware manual para depurar requests en AWS
  app.use((req: Request, _res: Response, next: () => void) => {
    console.log(
      `[Request] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'N/A'}`,
    );
    next();
  });

  // Configurar servicio de archivos estáticos para imágenes
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
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
    ? corsOriginEnv.split(',').map((o) => o.trim())
    : [];

  if (allowedOrigins.length > 0) {
    // Producción / configuración explícita
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    });
  } else {
    // Desarrollo: reflejar el origen para que el navegador reciba Access-Control-Allow-Origin correcto
    app.enableCors({
      origin: true, // refleja el Origin recibido
      credentials: false,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    });
  }

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  // Endpoint de debug para listar rutas registradas
  try {
    const express = app.getHttpAdapter().getInstance();
    express.use(bodyParser.json());
    const jwtService = app.get(JwtService);
    const prismaService = app.get(PrismaService);
    express.get('/api/__routes', (_req: Request, res: Response) => {
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
    express.get('/api/__marker', (_req: Request, res: Response) => {
      res.json({ marker: __APP_MODULE_MARKER__ });
    });
    // Endpoint para verificar el marcador haciendo require dinámico (sin usar el import de TS)
    express.get('/api/__marker-runtime', (_req: Request, res: Response) => {
      try {
        const modPath = require.resolve('./app.module');
        // Forzar recarga del módulo para descartar caché si existe
        delete require.cache[modPath];
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const freshMod = require(modPath);
        const runtimeMarker =
          freshMod.__APP_MODULE_MARKER__ ??
          '(sin export __APP_MODULE_MARKER__)';
        res.json({
          modPath,
          runtimeMarker,
          typeofAppModule: typeof freshMod.AppModule,
        });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });

    // Asegurar parseo de JSON para las rutas de mensajes (en caso de que el body parser de Nest no aplique a handlers manuales)
    express.use('/api/mensajes', bodyParser.json());
    // Asegurar parseo de JSON para calificaciones
    express.use('/api/calificaciones', bodyParser.json());

    // Fallback temporal para mensajes en desarrollo
    const authUserId = async (req: Request): Promise<string> => {
      const auth = (req.headers['authorization'] || '').toString();
      const token = auth.startsWith('Bearer ') ? auth.substring(7) : '';
      const qToken = String((req.query as any)?.token || '');
      const useToken = token || qToken;
      if (!useToken) throw new Error('No autorizado');
      const payload: any = await jwtService.verifyAsync(useToken).catch(() => {
        throw new Error('Token inválido');
      });
      const sub = String(payload?.sub || '');
      if (!sub) throw new Error('Token inválido');
      return sub;
    };
    const notificacionesService = app.get(NotificacionesService);
    const emailService = app.get(EmailService);
    const mensajesService = new MensajesService(
      prismaService,
      notificacionesService,
      emailService,
    );
    app.useGlobalInterceptors(new BigIntSerializerInterceptor());

    express.get(
      '/api/notificaciones/stream',
      async (req: Request, res: Response) => {
        try {
          const userId = await authUserId(req);
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
          });
          const init = await notificacionesService.listar(userId);
          res.write(
            `data: ${JSON.stringify({ tipo: 'COUNTER', noLeidas: init.noLeidas })}\n\n`,
          );
          const sub = notificacionesService.stream.subscribe(
            ({ usuarioId, data }) => {
              if (usuarioId !== userId) return;
              try {
                res.write(`data: ${JSON.stringify(serializeBigInt(data))}\n\n`);
              } catch {}
            },
          );
          req.on('close', () => {
            try {
              sub.unsubscribe();
            } catch {}
          });
        } catch (_e) {
          res.status(401).end();
        }
      },
    );

    express.post(
      '/api/mensajes/enviar',
      async (req: Request, res: Response) => {
        console.log(
          '[MensajesFallback] POST /api/mensajes/enviar body=',
          (req as any).body,
        );
        try {
          const userId = await authUserId(req);
          const dto = (req as any).body || {};
          console.log('[MensajesFallback] userId=', userId, 'dto=', dto);
          const resp = await mensajesService.enviarMensaje(dto, userId);
          res.json(serializeBigInt(resp));
        } catch (e) {
          const msg =
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          const code = /no autorizado|token inválido/i.test(msg) ? 401 : 400;
          console.error('[MensajesFallback] error:', msg);
          res.status(code).json({ error: msg });
        }
      },
    );

    // Fallback temporal para calificaciones en desarrollo
    express.post('/api/calificaciones', async (req: Request, res: Response) => {
      try {
        const userId = await authUserId(req);
        const calificacionesService = app.get(CalificacionesService);
        const dto = (req as any).body || {};
        const resultado = await calificacionesService.crear(userId, dto);
        res
          .status(200)
          .json({ ...resultado, timestamp: new Date().toISOString() });
      } catch (e) {
        const raw = e as any;
        const msg =
          typeof raw === 'object' && raw && 'message' in raw
            ? String(raw.message)
            : String(raw);
        let code = 500;
        if (/no autorizado|token inválido/i.test(msg)) {
          code = 401;
        } else if (/reserva no encontrada/i.test(msg)) {
          code = 400;
        } else if (
          /ya has calificado|ya has calificado esta reserva/i.test(msg)
        ) {
          code = 400;
        } else if (/solo se puede calificar reservas completadas/i.test(msg)) {
          code = 400;
        } else if (/no autorizado para calificar/i.test(msg)) {
          code = 403;
        } else if (raw?.code === 'P2002') {
          code = 400;
        }
        res.status(code).json({ message: msg });
      }
    });

    express.get(
      '/api/calificaciones/publicaciones/:id',
      async (req: Request, res: Response) => {
        try {
          const calificacionesService = app.get(CalificacionesService);
          const take = req.query.take ? parseInt(String(req.query.take)) : 10;
          const skip = req.query.skip ? parseInt(String(req.query.skip)) : 0;
          const resultado = await calificacionesService.listarPorPublicacion(
            String(req.params.id),
            take,
            skip,
          );
          res.json(
            serializeBigInt({
              ...resultado,
              timestamp: new Date().toISOString(),
            }),
          );
        } catch (e) {
          const msg =
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          res.status(400).json({ message: msg });
        }
      },
    );

    express.get(
      '/api/mensajes/reserva/:reservaId',
      async (req: Request, res: Response) => {
        console.log(
          '[MensajesFallback] GET /api/mensajes/reserva/:reservaId params=',
          req.params,
        );
        try {
          const userId = await authUserId(req);
          const resp = await mensajesService.listarPorReserva(
            String(req.params.reservaId),
            userId,
          );
          res.json(serializeBigInt(resp));
        } catch (e) {
          const msg =
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          const code = /no autorizado|token inválido/i.test(msg) ? 401 : 400;
          console.error('[MensajesFallback] error:', msg);
          res.status(code).json({ error: msg });
        }
      },
    );

    express.post(
      '/api/mensajes/reserva/:reservaId/leer',
      async (req: Request, res: Response) => {
        try {
          const userId = await authUserId(req);
          const resp = await mensajesService.marcarLeidos(
            String(req.params.reservaId),
            userId,
          );
          res.json(serializeBigInt(resp));
        } catch (e) {
          const msg =
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          const code = /no autorizado|token inválido/i.test(msg) ? 401 : 400;
          res.status(code).json({ error: msg });
        }
      },
    );

    express.get(
      '/api/mensajes/mis-conversaciones',
      async (req: Request, res: Response) => {
        try {
          const userId = await authUserId(req);
          const resp = await mensajesService.listarMisConversaciones(userId);
          res.json(serializeBigInt(resp));
        } catch (e) {
          const msg =
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          const code = /no autorizado|token inválido/i.test(msg) ? 401 : 400;
          res.status(code).json({ error: msg });
        }
      },
    );
    // Endpoint para verificar desde qué archivo se está resolviendo app.module
    express.get('/api/__resolved-appmodule', (_req: Request, res: Response) => {
      try {
        const resolved = require.resolve('./app.module');
        res.json({ resolved });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });
    // Endpoint para leer el contenido actual del archivo app.module.ts directamente del disco
    express.get('/api/__app-module-file', (_req: Request, res: Response) => {
      try {
        const resolved = require.resolve('./app.module');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        const content = fs.readFileSync(resolved, 'utf8');
        res.json({ resolved, contentSnippet: content.slice(0, 300) });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });
    // Endpoint público de verificación de estado de pago (debug)
    express.get(
      '/api/debug/mp/verificar/:transaccionId',
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
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          res.status(400).json({ error: message });
        }
      },
    );

    // Ruta pública principal de verificación (fallback temporal para asegurar disponibilidad en desarrollo)
    // Esto evita depender exclusivamente de los controladores si hay problemas de registro en dev.
    express.get(
      '/api/transacciones/mercado-pago/verificar/:transaccionId',
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
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          res.status(400).json({ error: message });
        }
      },
    );

    express.post(
      '/api/transacciones/mercado-pago/confirmar-debug',
      async (req: Request, res: Response) => {
        try {
          const paymentId = String(
            ((req as any).body?.paymentId ?? (req as any).query?.paymentId) ||
              '',
          );
          if (!paymentId) {
            return res.status(400).json({ error: 'paymentId requerido' });
          }
          const transaccionesService = app.get(TransaccionesService);
          const resp =
            await transaccionesService.confirmarPagoMercadoPago(paymentId);
          res.json(resp);
        } catch (e) {
          const message =
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          res.status(400).json({ error: message });
        }
      },
    );

    express.get(
      '/api/transacciones/mercado-pago/verificar-preference/:preferenceId',
      async (req: Request, res: Response) => {
        try {
          const transaccionesService = app.get(TransaccionesService);
          const resp =
            await transaccionesService.verificarEstadoMercadoPagoPorPreference(
              String(req.params.preferenceId || ''),
            );
          res.json(resp);
        } catch (e) {
          const message =
            typeof e === 'object' && e && 'message' in (e as any)
              ? (e as any).message
              : String(e);
          res.status(400).json({ error: message });
        }
      },
    );

    // Endpoint público para obtener la clave pública de MP para el frontend
    express.get('/api/config/mp-public-key', (_req: Request, res: Response) => {
      try {
        res.json({ publicKey: process.env.MP_PUBLIC_KEY || '' });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    });
  } catch (e) {
    console.warn('[Main] No se pudo registrar endpoint de rutas', e);
  }

  // Asegurar puerto de arranque evitando conflictos en 3000
  const port = parseInt(process.env.PORT ?? '3001', 10);
  // Escuchar en 0.0.0.0 por defecto para aceptar conexiones desde fuera del contenedor
  const host = (process.env.HOST ?? '0.0.0.0').trim();
  console.log(
    `[Main] Intentando escuchar en http://${host}:${port} (env PORT=${process.env.PORT ?? 'no definido'})`,
  );
  const server = await app.listen(port, host);
  try {
    const addr = (server as any).address?.();
    console.log('[Main] address():', addr);
    console.log(
      `[Main] Escuchando en http://${host}:${port} (prefijo global: /api)`,
    );
  } catch (e) {
    console.log('[Main] No se pudo obtener address()', e);
  }
}
bootstrap();
