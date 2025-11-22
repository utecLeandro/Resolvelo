"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const transacciones_module_1 = require("./transacciones/transacciones.module");
const transacciones_service_1 = require("./transacciones/transacciones.service");
const path_1 = require("path");
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
//# sourceMappingURL=main.js.map