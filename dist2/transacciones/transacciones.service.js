"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransaccionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mercadopago_1 = require("mercadopago");
const mercadopago_config_1 = require("../config/mercadopago.config");
let TransaccionesService = class TransaccionesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async simularPagoExterno(monto, metodoPago) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const referenciaExterna = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
            aprobado: true,
            referenciaExterna,
            mensaje: 'Pago procesado exitosamente (simulado)'
        };
    }
    async procesarPago(procesarPagoDto) {
        const { reservaId, metodoPago, descripcion } = procesarPagoDto;
        try {
            const reserva = await this.prisma.reserva.findUnique({
                where: { id: reservaId },
                include: {
                    publicacion: {
                        select: {
                            precioPorDia: true,
                            titulo: true
                        }
                    },
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true
                        }
                    }
                }
            });
            if (!reserva) {
                throw new common_1.NotFoundException('Reserva no encontrada');
            }
            if (reserva.estado !== 'CONFIRMADA') {
                throw new common_1.BadRequestException('La reserva debe estar confirmada para proceder al pago');
            }
            const transaccionExistente = await this.prisma.transaccion.findFirst({
                where: {
                    reservaId: reservaId,
                    estado: 'COMPLETADA'
                }
            });
            if (transaccionExistente) {
                throw new common_1.BadRequestException('Esta reserva ya tiene un pago completado');
            }
            const fechaInicio = new Date(reserva.fechaInicio);
            const fechaFin = new Date(reserva.fechaFin);
            const diasReserva = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const montoTotal = Number(reserva.publicacion.precioPorDia) * diasReserva;
            const transaccion = await this.prisma.transaccion.create({
                data: {
                    tipo: 'PAGO_RESERVA',
                    estado: 'PROCESANDO',
                    monto: montoTotal,
                    metodoPago: metodoPago || 'TARJETA_CREDITO',
                    descripcion: descripcion || `Pago de reserva para ${reserva.publicacion.titulo}`,
                    usuarioId: reserva.usuarioId,
                    reservaId: reservaId,
                    fechaProcesamiento: new Date()
                }
            });
            const resultadoPago = await this.simularPagoExterno(montoTotal, metodoPago);
            if (resultadoPago.aprobado) {
                await this.prisma.transaccion.update({
                    where: { id: transaccion.id },
                    data: {
                        estado: 'COMPLETADA',
                        referenciaExterna: resultadoPago.referenciaExterna,
                        fechaCompletado: new Date(),
                        montoNeto: montoTotal * 0.95,
                        comisionPlataforma: montoTotal * 0.03,
                        comisionPasarela: montoTotal * 0.02
                    }
                });
                await this.prisma.reserva.update({
                    where: { id: reservaId },
                    data: { estado: 'EN_CURSO' }
                });
                return {
                    exito: true,
                    transaccionId: transaccion.id,
                    referenciaExterna: resultadoPago.referenciaExterna,
                    mensaje: resultadoPago.mensaje,
                    fechaProcesamiento: new Date()
                };
            }
            else {
                await this.prisma.transaccion.update({
                    where: { id: transaccion.id },
                    data: {
                        estado: 'FALLIDA',
                        referenciaExterna: resultadoPago.referenciaExterna
                    }
                });
                throw new common_1.BadRequestException(`Error en el pago: ${resultadoPago.mensaje}`);
            }
        }
        catch (error) {
            console.error('Error procesando pago:', error);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Error al procesar el pago: ${error.message}`);
        }
    }
    async obtenerTransaccionesUsuario(usuarioId) {
        return this.prisma.transaccion.findMany({
            where: { usuarioId },
            include: {
                reserva: {
                    include: {
                        publicacion: {
                            select: {
                                titulo: true,
                                precioPorDia: true
                            }
                        }
                    }
                }
            },
            orderBy: { fechaCreacion: 'desc' }
        });
    }
    async obtenerTransaccion(id) {
        const transaccion = await this.prisma.transaccion.findUnique({
            where: { id },
            include: {
                reserva: {
                    include: {
                        publicacion: {
                            select: {
                                titulo: true,
                                precioPorDia: true
                            }
                        },
                        usuario: {
                            select: {
                                nombre: true,
                                apellido: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        if (!transaccion) {
            throw new common_1.NotFoundException('Transacción no encontrada');
        }
        return transaccion;
    }
    async crearPreferenciaMercadoPago(reservaId, descripcion) {
        const accessToken = process.env.MP_ACCESS_TOKEN || mercadopago_config_1.MP_DEFAULT_ACCESS_TOKEN;
        if (!accessToken) {
            throw new common_1.BadRequestException('Falta configurar MP_ACCESS_TOKEN en el entorno');
        }
        const reserva = await this.prisma.reserva.findUnique({
            where: { id: reservaId },
            include: {
                publicacion: { select: { precioPorDia: true, titulo: true } },
                usuario: { select: { id: true, nombre: true, email: true } }
            }
        });
        if (!reserva) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        if (reserva.estado !== 'CONFIRMADA') {
            throw new common_1.BadRequestException('La reserva debe estar confirmada para proceder al pago');
        }
        const fechaInicio = new Date(reserva.fechaInicio);
        const fechaFin = new Date(reserva.fechaFin);
        const diasReserva = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const montoTotal = Number(reserva.publicacion.precioPorDia) * diasReserva;
        const transaccion = await this.prisma.transaccion.create({
            data: {
                tipo: 'PAGO_RESERVA',
                estado: 'PENDIENTE',
                monto: montoTotal,
                metodoPago: 'MERCADO_PAGO',
                descripcion: descripcion || `Pago de reserva para ${reserva.publicacion.titulo}`,
                usuarioId: reserva.usuarioId,
                reservaId,
                fechaProcesamiento: new Date()
            }
        });
        const client = new mercadopago_1.MercadoPagoConfig({ accessToken });
        const preference = new mercadopago_1.Preference(client);
        const rawFrontendBase = process.env.FRONTEND_URL;
        const frontendBase = (rawFrontendBase?.trim() || 'http://localhost:5173');
        const ensureUrl = (raw, fallbackPath) => {
            const t = (raw ?? '').trim();
            let candidate = t || `${frontendBase}${fallbackPath}`;
            try {
                new URL(candidate);
            }
            catch {
                candidate = `${frontendBase}${fallbackPath}`;
            }
            return candidate;
        };
        const successUrl = ensureUrl(process.env.MP_SUCCESS_URL, '/pago-exitoso');
        const failureUrl = ensureUrl(process.env.MP_FAILURE_URL, '/pago-error');
        const pendingUrl = ensureUrl(process.env.MP_PENDING_URL, '/pago-exitoso');
        const isLocalFrontend = /^http:\/\/(127\.0\.0\.1|localhost)/i.test(frontendBase);
        const body = {
            items: [
                {
                    title: `Pago de reserva: ${reserva.publicacion.titulo}`,
                    description: descripcion || `Reserva ${reserva.id}`,
                    quantity: 1,
                    currency_id: 'UYU',
                    unit_price: Number(montoTotal)
                }
            ],
            payer: {
                name: reserva.usuario.nombre || 'Cliente',
                email: reserva.usuario.email
            },
            metadata: {
                reservaId,
                usuarioId: reserva.usuarioId,
                transaccionId: transaccion.id
            },
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl
            },
            ...(isLocalFrontend ? {} : { auto_return: 'approved' }),
            binary_mode: false,
            statement_descriptor: 'ReSolVelo',
            external_reference: transaccion.id
        };
        const rawNotificationUrl = process.env.MP_NOTIFICATION_URL?.trim();
        if (rawNotificationUrl) {
            const isHttps = /^https:\/\//i.test(rawNotificationUrl);
            if (isHttps) {
                body.notification_url = rawNotificationUrl;
            }
            else {
                console.warn('[MP] MP_NOTIFICATION_URL no es HTTPS, se omite para evitar error 400:', rawNotificationUrl);
            }
        }
        let result;
        console.log('[MP] Preference.create body:', JSON.stringify(body, null, 2));
        if (rawNotificationUrl) {
            console.log('[MP] MP_NOTIFICATION_URL (env):', rawNotificationUrl);
        }
        try {
            result = await preference.create({ body });
        }
        catch (err) {
            console.error('❌ [MP] Error creando preferencia:', {
                message: err?.message,
                status: err?.status || err?.error?.status,
                cause: err?.cause || err?.error?.cause,
                error: err?.error || err
            });
            const msg = err?.error?.message || err?.message || JSON.stringify(err?.error || err);
            throw new common_1.BadRequestException(`MP create preference error: ${msg}`);
        }
        console.log('🧾 [MP] Preferencia creada:', {
            id: result?.id,
            init_point: result?.init_point,
            sandbox_init_point: result?.sandbox_init_point
        });
        await this.prisma.transaccion.update({
            where: { id: transaccion.id },
            data: { referenciaExterna: result.id }
        });
        const sandbox = (process.env.MP_SANDBOX || 'true').toLowerCase() === 'true';
        const redirectUrl = sandbox
            ? (result?.sandbox_init_point || result?.init_point)
            : (result?.init_point || result?.sandbox_init_point);
        return {
            ok: true,
            preferenciaId: result.id,
            transaccionId: transaccion.id,
            init_point: result?.init_point,
            sandbox_init_point: result?.sandbox_init_point,
            redirectUrl
        };
    }
    async procesarWebhookMercadoPago(payload, query) {
        try {
            const accessToken = process.env.MP_ACCESS_TOKEN;
            if (!accessToken) {
                throw new common_1.BadRequestException('Falta configurar MP_ACCESS_TOKEN en el entorno');
            }
            const topic = query?.topic || payload?.topic || payload?.type;
            const id = query?.id || payload?.data?.id || payload?.id;
            console.log('📥 [MP Webhook] Evento recibido:', { topic, id });
            if (!id) {
                throw new common_1.BadRequestException('Webhook sin ID de pago');
            }
            const { Payment } = await Promise.resolve().then(() => require('mercadopago'));
            const client = new mercadopago_1.MercadoPagoConfig({ accessToken });
            const payment = new Payment(client);
            const paymentDetail = await payment.get({ id: Number(id) });
            console.log('🧾 [MP Webhook] Detalle de pago:', {
                id: paymentDetail?.id,
                status: paymentDetail?.status,
                external_reference: paymentDetail?.external_reference,
                metadata: paymentDetail?.metadata
            });
            const transaccionId = paymentDetail?.external_reference || payload?.metadata?.transaccionId;
            if (!transaccionId) {
                throw new common_1.BadRequestException('No se pudo asociar el pago a una transacción');
            }
            const estadoPago = String(paymentDetail?.status || '').toUpperCase();
            if (estadoPago === 'APPROVED') {
                const transaccion = await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: {
                        estado: 'COMPLETADA',
                        fechaCompletado: new Date(),
                        referenciaExterna: String(paymentDetail?.id || ''),
                        montoNeto: undefined,
                        comisionPlataforma: undefined,
                        comisionPasarela: undefined,
                    }
                });
                if (transaccion?.reservaId) {
                    await this.prisma.reserva.update({
                        where: { id: transaccion.reservaId },
                        data: { estado: 'EN_CURSO' }
                    });
                }
            }
            else if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
                await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: { estado: 'PENDIENTE', referenciaExterna: String(paymentDetail?.id || '') }
                });
            }
            else {
                await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: { estado: 'FALLIDA', referenciaExterna: String(paymentDetail?.id || '') }
                });
            }
            return { ok: true };
        }
        catch (error) {
            console.error('❌ [MP Webhook] Error procesando webhook:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error procesando webhook');
        }
    }
    async verificarEstadoMercadoPagoPorTransaccion(transaccionId) {
        try {
            if (!transaccionId) {
                throw new common_1.BadRequestException('Falta transaccionId');
            }
            const accessToken = process.env.MP_ACCESS_TOKEN || mercadopago_config_1.MP_DEFAULT_ACCESS_TOKEN;
            if (!accessToken) {
                throw new common_1.BadRequestException('Falta configurar MP_ACCESS_TOKEN en el entorno');
            }
            const tx = await this.prisma.transaccion.findUnique({ where: { id: transaccionId }, include: { reserva: true } });
            if (!tx) {
                throw new common_1.NotFoundException('Transacción no encontrada');
            }
            if (tx.estado === 'COMPLETADA') {
                return tx;
            }
            const fetch = (await Promise.resolve().then(() => require('node-fetch'))).default;
            const baseUrl = 'https://api.mercadopago.com/v1/payments/search';
            const urlByExternal = `${baseUrl}?external_reference=${encodeURIComponent(transaccionId)}&sort=date_created&criteria=desc`;
            const respExt = await fetch(urlByExternal, { headers: { Authorization: `Bearer ${accessToken}` } });
            const dataExt = await respExt.json();
            let results = Array.isArray(dataExt?.results) ? dataExt.results : [];
            if (!results.length && tx.referenciaExterna) {
                const urlByPref = `${baseUrl}?preference_id=${encodeURIComponent(tx.referenciaExterna)}&sort=date_created&criteria=desc`;
                const respPref = await fetch(urlByPref, { headers: { Authorization: `Bearer ${accessToken}` } });
                const dataPref = await respPref.json();
                results = Array.isArray(dataPref?.results) ? dataPref.results : [];
            }
            const ultimo = results.length ? results[0] : null;
            const estadoPago = String(ultimo?.status || '').toUpperCase();
            console.log('🔎 [MP] Verificación por external_reference/preference:', { transaccionId, estadoPago, paymentId: ultimo?.id });
            if (estadoPago === 'APPROVED') {
                const actualizada = await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: {
                        estado: 'COMPLETADA',
                        fechaCompletado: new Date(),
                        referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ''),
                    },
                    include: { reserva: true }
                });
                if (actualizada?.reservaId) {
                    await this.prisma.reserva.update({ where: { id: actualizada.reservaId }, data: { estado: 'EN_CURSO' } });
                }
                return actualizada;
            }
            if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
                await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: { estado: 'PENDIENTE', referenciaExterna: String(ultimo?.id || tx.referenciaExterna || '') }
                });
            }
            else if (estadoPago === 'REJECTED' || estadoPago === 'CANCELLED') {
                await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: { estado: 'FALLIDA', referenciaExterna: String(ultimo?.id || tx.referenciaExterna || '') }
                });
            }
            return await this.prisma.transaccion.findUnique({ where: { id: transaccionId }, include: { reserva: true } });
        }
        catch (error) {
            console.error('❌ [MP] Error verificando estado por transacción:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error verificando estado de pago');
        }
    }
    async confirmarPagoMercadoPago(paymentId) {
        try {
            const accessToken = process.env.MP_ACCESS_TOKEN || mercadopago_config_1.MP_DEFAULT_ACCESS_TOKEN;
            if (!accessToken) {
                throw new common_1.BadRequestException('Falta configurar MP_ACCESS_TOKEN en el entorno');
            }
            const { Payment } = await Promise.resolve().then(() => require('mercadopago'));
            const client = new mercadopago_1.MercadoPagoConfig({ accessToken });
            const payment = new Payment(client);
            const paymentDetail = await payment.get({ id: Number(paymentId) });
            console.log('🧾 [MP Confirm] Detalle de pago:', {
                id: paymentDetail?.id,
                status: paymentDetail?.status,
                external_reference: paymentDetail?.external_reference,
                metadata: paymentDetail?.metadata
            });
            const transaccionId = paymentDetail?.external_reference;
            if (!transaccionId) {
                throw new common_1.NotFoundException('No se encontró transacción asociada al pago');
            }
            const estadoPago = String(paymentDetail?.status || '').toUpperCase();
            if (estadoPago === 'APPROVED') {
                const transaccion = await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: {
                        estado: 'COMPLETADA',
                        fechaCompletado: new Date(),
                        referenciaExterna: String(paymentDetail?.id || ''),
                        montoNeto: undefined,
                        comisionPlataforma: undefined,
                        comisionPasarela: undefined,
                    }
                });
                if (transaccion?.reservaId) {
                    await this.prisma.reserva.update({
                        where: { id: transaccion.reservaId },
                        data: { estado: 'EN_CURSO' }
                    });
                }
            }
            else if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
                await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: { estado: 'PENDIENTE', referenciaExterna: String(paymentDetail?.id || '') }
                });
            }
            else {
                await this.prisma.transaccion.update({
                    where: { id: transaccionId },
                    data: { estado: 'FALLIDA', referenciaExterna: String(paymentDetail?.id || '') }
                });
            }
            return await this.obtenerTransaccion(transaccionId);
        }
        catch (error) {
            console.error('❌ [MP Confirm] Error confirmando pago:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error confirmando pago');
        }
    }
};
exports.TransaccionesService = TransaccionesService;
exports.TransaccionesService = TransaccionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransaccionesService);
//# sourceMappingURL=transacciones.service.js.map