"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const transacciones_module_1 = require("./transacciones/transacciones.module");
const transacciones_service_1 = require("./transacciones/transacciones.service");
const calificaciones_service_1 = require("./calificaciones/calificaciones.service");
const jwt_1 = require("@nestjs/jwt");
const mensajes_service_1 = require("./mensajes/mensajes.service");
const prisma_service_1 = require("./prisma/prisma.service");
const bodyParser = require("body-parser");
const path_1 = require("path");
const notificaciones_service_1 = require("./notificaciones/notificaciones.service");
const common_2 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const operators_1 = require("rxjs/operators");
let BigIntSerializerInterceptor = class BigIntSerializerInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => serializeBigInt(data)));
    }
};
BigIntSerializerInterceptor = __decorate([
    (0, common_2.Injectable)()
], BigIntSerializerInterceptor);
function serializeBigInt(v) {
    if (typeof v === 'bigint')
        return v.toString();
    if (v instanceof Date)
        return v.toISOString();
    if (v instanceof client_1.Prisma.Decimal)
        return v.toString();
    if (Array.isArray(v))
        return v.map(serializeBigInt);
    if (v && typeof v === 'object') {
        const out = {};
        for (const k of Object.keys(v))
            out[k] = serializeBigInt(v[k]);
        return out;
    }
    return v;
}
async function bootstrap() {
    console.log('[Main] Import debug -> typeof TransaccionesModule =', typeof transacciones_module_1.TransaccionesModule);
    console.log('[Main] Bootstrap iniciando...');
    try {
        const resolvedAppModule = require.resolve('./app.module');
        console.log('[Main] require.resolve(./app.module) ->', resolvedAppModule);
        console.log('[Main] __APP_MODULE_MARKER__ ->', app_module_1.__APP_MODULE_MARKER__);
    }
    catch (e) {
        console.warn('[Main] No se pudo resolver ruta de app.module', e);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
    }));
    const corsOriginEnv = process.env.CORS_ORIGIN;
    const allowedOrigins = corsOriginEnv ? corsOriginEnv.split(',').map(o => o.trim()) : [];
    if (allowedOrigins.length > 0) {
        app.enableCors({
            origin: allowedOrigins,
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: 'Content-Type, Authorization',
        });
    }
    else {
        app.enableCors({
            origin: true,
            credentials: false,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: 'Content-Type, Authorization',
        });
    }
    app.setGlobalPrefix('api');
    try {
        const express = app.getHttpAdapter().getInstance();
        express.use(bodyParser.json());
        const jwtService = app.get(jwt_1.JwtService);
        const prismaService = app.get(prisma_service_1.PrismaService);
        let mensajesService;
        express.get('/api/__routes', (_req, res) => {
            const stack = express._router?.stack || [];
            const routes = [];
            for (const layer of stack) {
                if (layer.route && layer.route.path) {
                    const methods = Object.keys(layer.route.methods).filter(m => layer.route.methods[m]);
                    routes.push({ path: layer.route.path, methods });
                }
            }
            res.json({ routes });
        });
        express.get('/api/__marker', (_req, res) => {
            res.json({ marker: app_module_1.__APP_MODULE_MARKER__ });
        });
        express.get('/api/__marker-runtime', (_req, res) => {
            try {
                const modPath = require.resolve('./app.module');
                delete require.cache[modPath];
                const freshMod = require(modPath);
                const runtimeMarker = freshMod.__APP_MODULE_MARKER__ ?? '(sin export __APP_MODULE_MARKER__)';
                res.json({ modPath, runtimeMarker, typeofAppModule: typeof freshMod.AppModule });
            }
            catch (e) {
                res.status(500).json({ error: String(e) });
            }
        });
        express.use('/api/mensajes', bodyParser.json());
        express.use('/api/calificaciones', bodyParser.json());
        const authUserId = async (req) => {
            const auth = (req.headers['authorization'] || '').toString();
            const token = auth.startsWith('Bearer ') ? auth.substring(7) : '';
            const qToken = String(req.query?.token || '');
            const useToken = token || qToken;
            if (!useToken)
                throw new Error('No autorizado');
            const payload = await jwtService.verifyAsync(useToken).catch(() => { throw new Error('Token inválido'); });
            const sub = String(payload?.sub || '');
            if (!sub)
                throw new Error('Token inválido');
            return sub;
        };
        const notificacionesService = app.get(notificaciones_service_1.NotificacionesService);
        mensajesService = new mensajes_service_1.MensajesService(prismaService, notificacionesService);
        app.useGlobalInterceptors(new BigIntSerializerInterceptor());
        express.get('/api/notificaciones/stream', async (req, res) => {
            try {
                const userId = await authUserId(req);
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                });
                const init = await notificacionesService.listar(userId);
                res.write(`data: ${JSON.stringify({ tipo: 'COUNTER', noLeidas: init.noLeidas })}\n\n`);
                const sub = notificacionesService.stream.subscribe(({ usuarioId, data }) => {
                    if (usuarioId !== userId)
                        return;
                    try {
                        res.write(`data: ${JSON.stringify(serializeBigInt(data))}\n\n`);
                    }
                    catch { }
                });
                req.on('close', () => { try {
                    sub.unsubscribe();
                }
                catch { } });
            }
            catch (e) {
                res.status(401).end();
            }
        });
        express.post('/api/mensajes/enviar', async (req, res) => {
            console.log('[MensajesFallback] POST /api/mensajes/enviar body=', req.body);
            try {
                const userId = await authUserId(req);
                const dto = req.body || {};
                console.log('[MensajesFallback] userId=', userId, 'dto=', dto);
                const resp = await mensajesService.enviarMensaje(dto, userId);
                res.json(serializeBigInt(resp));
            }
            catch (e) {
                const msg = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                const code = /no autorizado|token inválido/i.test(msg) ? 401 : 400;
                console.error('[MensajesFallback] error:', msg);
                res.status(code).json({ error: msg });
            }
        });
        express.post('/api/calificaciones', async (req, res) => {
            try {
                const userId = await authUserId(req);
                const calificacionesService = app.get(calificaciones_service_1.CalificacionesService);
                const dto = req.body || {};
                const resultado = await calificacionesService.crear(userId, dto);
                res.status(200).json({ ...resultado, timestamp: new Date().toISOString() });
            }
            catch (e) {
                const raw = e;
                const msg = typeof raw === 'object' && raw && 'message' in raw ? String(raw.message) : String(raw);
                let code = 500;
                if (/no autorizado|token inválido/i.test(msg)) {
                    code = 401;
                }
                else if (/reserva no encontrada/i.test(msg)) {
                    code = 400;
                }
                else if (/ya has calificado|ya has calificado esta reserva/i.test(msg)) {
                    code = 400;
                }
                else if (/solo se puede calificar reservas completadas/i.test(msg)) {
                    code = 400;
                }
                else if (/no autorizado para calificar/i.test(msg)) {
                    code = 403;
                }
                else if (raw?.code === 'P2002') {
                    code = 400;
                }
                res.status(code).json({ message: msg });
            }
        });
        express.get('/api/calificaciones/publicaciones/:id', async (req, res) => {
            try {
                const calificacionesService = app.get(calificaciones_service_1.CalificacionesService);
                const take = req.query.take ? parseInt(String(req.query.take)) : 10;
                const skip = req.query.skip ? parseInt(String(req.query.skip)) : 0;
                const resultado = await calificacionesService.listarPorPublicacion(String(req.params.id), take, skip);
                res.json(serializeBigInt({ ...resultado, timestamp: new Date().toISOString() }));
            }
            catch (e) {
                const msg = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                res.status(400).json({ message: msg });
            }
        });
        express.get('/api/mensajes/reserva/:reservaId', async (req, res) => {
            console.log('[MensajesFallback] GET /api/mensajes/reserva/:reservaId params=', req.params);
            try {
                const userId = await authUserId(req);
                const resp = await mensajesService.listarPorReserva(String(req.params.reservaId), userId);
                res.json(serializeBigInt(resp));
            }
            catch (e) {
                const msg = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                const code = /no autorizado|token inválido/i.test(msg) ? 401 : 400;
                console.error('[MensajesFallback] error:', msg);
                res.status(code).json({ error: msg });
            }
        });
        express.post('/api/mensajes/reserva/:reservaId/leer', async (req, res) => {
            try {
                const userId = await authUserId(req);
                const resp = await mensajesService.marcarLeidos(String(req.params.reservaId), userId);
                res.json(serializeBigInt(resp));
            }
            catch (e) {
                const msg = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                const code = /no autorizado|token inválido/i.test(msg) ? 401 : 400;
                res.status(code).json({ error: msg });
            }
        });
        express.get('/api/mensajes/mis-conversaciones', async (req, res) => {
            try {
                const userId = await authUserId(req);
                const resp = await mensajesService.listarMisConversaciones(userId);
                res.json(serializeBigInt(resp));
            }
            catch (e) {
                const msg = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                const code = /no autorizado|token inválido/i.test(msg) ? 401 : 400;
                res.status(code).json({ error: msg });
            }
        });
        express.get('/api/__resolved-appmodule', (_req, res) => {
            try {
                const resolved = require.resolve('./app.module');
                res.json({ resolved });
            }
            catch (e) {
                res.status(500).json({ error: String(e) });
            }
        });
        express.get('/api/__app-module-file', (_req, res) => {
            try {
                const resolved = require.resolve('./app.module');
                const fs = require('fs');
                const content = fs.readFileSync(resolved, 'utf8');
                res.json({ resolved, contentSnippet: content.slice(0, 300) });
            }
            catch (e) {
                res.status(500).json({ error: String(e) });
            }
        });
        express.get('/api/debug/mp/verificar/:transaccionId', async (req, res) => {
            try {
                const transaccionesService = app.get(transacciones_service_1.TransaccionesService);
                const resp = await transaccionesService.verificarEstadoMercadoPagoPorTransaccion(req.params.transaccionId);
                res.json(resp);
            }
            catch (e) {
                const message = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                res.status(400).json({ error: message });
            }
        });
        express.get('/api/transacciones/mercado-pago/verificar/:transaccionId', async (req, res) => {
            try {
                const transaccionesService = app.get(transacciones_service_1.TransaccionesService);
                const resp = await transaccionesService.verificarEstadoMercadoPagoPorTransaccion(req.params.transaccionId);
                res.json(resp);
            }
            catch (e) {
                const message = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                res.status(400).json({ error: message });
            }
        });
        express.post('/api/transacciones/mercado-pago/confirmar-debug', async (req, res) => {
            try {
                const paymentId = String((req.body?.paymentId ?? req.query?.paymentId) || '');
                if (!paymentId) {
                    return res.status(400).json({ error: 'paymentId requerido' });
                }
                const transaccionesService = app.get(transacciones_service_1.TransaccionesService);
                const resp = await transaccionesService.confirmarPagoMercadoPago(paymentId);
                res.json(resp);
            }
            catch (e) {
                const message = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                res.status(400).json({ error: message });
            }
        });
        express.get('/api/transacciones/mercado-pago/verificar-preference/:preferenceId', async (req, res) => {
            try {
                const transaccionesService = app.get(transacciones_service_1.TransaccionesService);
                const resp = await transaccionesService.verificarEstadoMercadoPagoPorPreference(String(req.params.preferenceId || ''));
                res.json(resp);
            }
            catch (e) {
                const message = typeof e === 'object' && e && 'message' in e ? e.message : String(e);
                res.status(400).json({ error: message });
            }
        });
        express.get('/api/config/mp-public-key', (_req, res) => {
            try {
                res.json({ publicKey: process.env.MP_PUBLIC_KEY || '' });
            }
            catch (e) {
                res.status(500).json({ error: String(e) });
            }
        });
    }
    catch (e) {
        console.warn('[Main] No se pudo registrar endpoint de rutas', e);
    }
    const port = parseInt(process.env.PORT ?? '3001', 10);
    const host = (process.env.HOST ?? '0.0.0.0').trim();
    console.log(`[Main] Intentando escuchar en http://${host}:${port} (env PORT=${process.env.PORT ?? 'no definido'})`);
    const server = await app.listen(port, host);
    try {
        const addr = server.address?.();
        console.log('[Main] address():', addr);
        console.log(`[Main] Escuchando en http://${host}:${port} (prefijo global: /api)`);
    }
    catch (e) {
        console.log('[Main] No se pudo obtener address()', e);
    }
}
bootstrap();
