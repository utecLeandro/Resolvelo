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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransaccionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mercadopago_1 = require("mercadopago");
const mercadopago_config_1 = require("../config/mercadopago.config");
const axios_1 = require("axios");
const notificaciones_service_1 = require("../notificaciones/notificaciones.service");
let TransaccionesService = class TransaccionesService {
    prisma;
    notificaciones;
    constructor(prisma, notificaciones) {
        this.prisma = prisma;
        this.notificaciones = notificaciones;
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
                where: { id: BigInt(reservaId) },
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
                    reservaId: BigInt(reservaId),
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
                    reservaId: BigInt(reservaId),
                    fechaProcesamiento: new Date()
                }
            });
            const resultadoPago = await this.simularPagoExterno(montoTotal, metodoPago);
            if (resultadoPago.aprobado) {
                const txCompletada = await this.prisma.transaccion.update({
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
                    where: { id: BigInt(reservaId) },
                    data: { estado: 'EN_CURSO' }
                });
                if (this.notificaciones) {
                    try {
                        await this.notificaciones.emitirPagoCompletado(reserva, txCompletada);
                    }
                    catch { }
                }
                return {
                    exito: true,
                    transaccionId: String(transaccion.id),
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
            where: { usuarioId: BigInt(usuarioId) },
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
            where: { id: BigInt(id) },
            include: {
                reserva: {
                    include: {
                        publicacion: {
                            select: {
                                titulo: true,
                                precioPorDia: true,
                                imagenes: {
                                    select: {
                                        id: true,
                                        url: true,
                                        descripcion: true,
                                        orden: true,
                                        esPrincipal: true,
                                    }
                                }
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
            where: { id: BigInt(reservaId) },
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
                reservaId: BigInt(reservaId),
                fechaProcesamiento: new Date()
            }
        });
        const client = new mercadopago_1.MercadoPagoConfig({ accessToken });
        const preference = new mercadopago_1.Preference(client);
        const rawFrontendBase = process.env.FRONTEND_URL;
        const frontendBase = (rawFrontendBase?.trim() || 'http://127.0.0.1:5174');
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
                usuarioId: String(reserva.usuarioId),
                transaccionId: String(transaccion.id)
            },
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl
            },
            binary_mode: true,
            statement_descriptor: 'ReSolVelo',
            external_reference: String(transaccion.id)
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
            transaccionId: String(transaccion.id),
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
            try {
                console.log('[MP Webhook] Payment detail full:', JSON.stringify(paymentDetail, null, 2));
            }
            catch { }
            const transaccionId = paymentDetail?.external_reference || payload?.metadata?.transaccionId;
            if (!transaccionId) {
                throw new common_1.BadRequestException('No se pudo asociar el pago a una transacción');
            }
            const estadoPago = String(paymentDetail?.status || '').toUpperCase();
            if (estadoPago === 'APPROVED') {
                const transaccion = await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: {
                        estado: 'COMPLETADA',
                        fechaCompletado: new Date(),
                        referenciaExterna: String(paymentDetail?.id || ''),
                        montoNeto: undefined,
                        comisionPlataforma: undefined,
                        comisionPasarela: undefined,
                        notasInternas: JSON.stringify(paymentDetail)
                    }
                });
                if (transaccion?.reservaId) {
                    await this.prisma.reserva.update({
                        where: { id: transaccion.reservaId },
                        data: { estado: 'EN_CURSO' }
                    });
                    if (this.notificaciones) {
                        try {
                            const reservaFull = await this.prisma.reserva.findUnique({
                                where: { id: transaccion.reservaId },
                                include: { publicacion: { select: { id: true, titulo: true, marca: true, modelo: true } } }
                            });
                            if (reservaFull)
                                await this.notificaciones.emitirPagoCompletado(reservaFull, transaccion);
                        }
                        catch { }
                    }
                }
            }
            else if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'PENDIENTE', referenciaExterna: String(paymentDetail?.id || ''), notasInternas: JSON.stringify(paymentDetail) }
                });
            }
            else {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'FALLIDA', referenciaExterna: String(paymentDetail?.id || ''), notasInternas: JSON.stringify(paymentDetail) }
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
            const tx = await this.prisma.transaccion.findUnique({ where: { id: BigInt(transaccionId) }, include: { reserva: true } });
            if (!tx) {
                throw new common_1.NotFoundException('Transacción no encontrada');
            }
            if (tx.estado === 'COMPLETADA') {
                return tx;
            }
            const baseUrl = 'https://api.mercadopago.com/v1/payments/search';
            const headers = { Authorization: `Bearer ${accessToken}` };
            let results = [];
            try {
                const { data: dataExt } = await axios_1.default.get(baseUrl, { headers, params: { external_reference: transaccionId, sort: 'date_created', criteria: 'desc' } });
                results = Array.isArray(dataExt?.results) ? dataExt.results : [];
            }
            catch { }
            if (!results.length && tx.referenciaExterna) {
                try {
                    const { data: dataPref } = await axios_1.default.get(baseUrl, { headers, params: { preference_id: tx.referenciaExterna, sort: 'date_created', criteria: 'desc' } });
                    results = Array.isArray(dataPref?.results) ? dataPref.results : [];
                }
                catch { }
            }
            const ultimo = results.length ? results[0] : null;
            const estadoPago = String(ultimo?.status || '').toUpperCase();
            console.log('🔎 [MP] Verificación por external_reference/preference:', { transaccionId, estadoPago, paymentId: ultimo?.id });
            try {
                if (ultimo) {
                    console.log('[MP Verify] Payment search result full:', JSON.stringify(ultimo, null, 2));
                }
            }
            catch { }
            if (estadoPago === 'APPROVED') {
                const actualizada = await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: {
                        estado: 'COMPLETADA',
                        fechaCompletado: new Date(),
                        referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ''),
                        notasInternas: ultimo ? JSON.stringify(ultimo) : tx.notasInternas
                    },
                    include: { reserva: true }
                });
                if (actualizada?.reservaId) {
                    await this.prisma.reserva.update({ where: { id: actualizada.reservaId }, data: { estado: 'EN_CURSO' } });
                    if (this.notificaciones && actualizada.reserva) {
                        try {
                            await this.notificaciones.emitirPagoCompletado(actualizada.reserva, actualizada);
                        }
                        catch { }
                    }
                }
                return actualizada;
            }
            if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'PENDIENTE', referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ''), notasInternas: ultimo ? JSON.stringify(ultimo) : tx.notasInternas }
                });
            }
            else if (estadoPago === 'REJECTED' || estadoPago === 'CANCELLED') {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'FALLIDA', referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ''), notasInternas: ultimo ? JSON.stringify(ultimo) : tx.notasInternas }
                });
            }
            return await this.prisma.transaccion.findUnique({ where: { id: BigInt(transaccionId) }, include: { reserva: true } });
        }
        catch (error) {
            console.error('❌ [MP] Error verificando estado por transacción:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error verificando estado de pago');
        }
    }
    async verificarEstadoMercadoPagoPorPreference(preferenceId) {
        try {
            if (!preferenceId) {
                throw new common_1.BadRequestException('Falta preferenceId');
            }
            const accessToken = process.env.MP_ACCESS_TOKEN || mercadopago_config_1.MP_DEFAULT_ACCESS_TOKEN;
            if (!accessToken) {
                throw new common_1.BadRequestException('Falta configurar MP_ACCESS_TOKEN en el entorno');
            }
            const baseUrl = 'https://api.mercadopago.com/v1/payments/search';
            const headers = { Authorization: `Bearer ${accessToken}` };
            let results = [];
            try {
                const { data } = await axios_1.default.get(baseUrl, { headers, params: { preference_id: preferenceId, sort: 'date_created', criteria: 'desc' } });
                results = Array.isArray(data?.results) ? data.results : [];
            }
            catch { }
            let ultimo = results.length ? results[0] : null;
            if (!ultimo) {
                try {
                    const { data: mo } = await axios_1.default.get('https://api.mercadopago.com/merchant_orders/search', { headers, params: { preference_id: preferenceId } });
                    const elements = Array.isArray(mo?.elements) ? mo.elements : [];
                    const order = elements.length ? elements[0] : null;
                    const pagos = Array.isArray(order?.payments) ? order.payments : [];
                    if (pagos.length) {
                        const p = pagos.find(x => String(x?.status || '').toUpperCase() === 'APPROVED') || pagos[0];
                        ultimo = {
                            id: p?.id,
                            status: p?.status,
                            external_reference: order?.external_reference,
                            date_approved: p?.date_approved,
                            transaction_amount: p?.total_paid_amount ?? p?.transaction_amount ?? p?.amount,
                            description: order?.description,
                        };
                    }
                }
                catch { }
            }
            const estadoPago = String(ultimo?.status || '').toUpperCase();
            let transaccionId = String(ultimo?.external_reference || '');
            if (!transaccionId) {
                const txPref = await this.prisma.transaccion.findFirst({ where: { referenciaExterna: preferenceId } });
                transaccionId = String(txPref?.id || '');
            }
            if (!transaccionId) {
                throw new common_1.NotFoundException('No se encontró transacción asociada a la preferencia');
            }
            if (estadoPago === 'APPROVED') {
                const actualizada = await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: {
                        estado: 'COMPLETADA',
                        fechaCompletado: new Date(),
                        referenciaExterna: String(ultimo?.id || preferenceId),
                        notasInternas: ultimo ? JSON.stringify(ultimo) : undefined
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
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'PENDIENTE', referenciaExterna: String(ultimo?.id || preferenceId), notasInternas: ultimo ? JSON.stringify(ultimo) : undefined }
                });
            }
            else if (estadoPago === 'REJECTED' || estadoPago === 'CANCELLED') {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'FALLIDA', referenciaExterna: String(ultimo?.id || preferenceId), notasInternas: ultimo ? JSON.stringify(ultimo) : undefined }
                });
            }
            return await this.prisma.transaccion.findUnique({ where: { id: BigInt(transaccionId) }, include: { reserva: true } });
        }
        catch (error) {
            console.error('❌ [MP] Error verificando estado por preference:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error verificando estado por preference');
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
            try {
                console.log('[MP Confirm] Payment detail full:', JSON.stringify(paymentDetail, null, 2));
            }
            catch { }
            const transaccionId = paymentDetail?.external_reference;
            if (!transaccionId) {
                throw new common_1.NotFoundException('No se encontró transacción asociada al pago');
            }
            const estadoPago = String(paymentDetail?.status || '').toUpperCase();
            if (estadoPago === 'APPROVED') {
                const transaccion = await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: {
                        estado: 'COMPLETADA',
                        fechaCompletado: new Date(),
                        referenciaExterna: String(paymentDetail?.id || ''),
                        montoNeto: undefined,
                        comisionPlataforma: undefined,
                        comisionPasarela: undefined,
                        notasInternas: JSON.stringify(paymentDetail)
                    }
                });
                if (transaccion?.reservaId) {
                    await this.prisma.reserva.update({
                        where: { id: transaccion.reservaId },
                        data: { estado: 'EN_CURSO' }
                    });
                    if (this.notificaciones) {
                        try {
                            const reservaFull = await this.prisma.reserva.findUnique({
                                where: { id: transaccion.reservaId },
                                include: { publicacion: { select: { id: true, titulo: true, marca: true, modelo: true } } }
                            });
                            if (reservaFull)
                                await this.notificaciones.emitirPagoCompletado(reservaFull, transaccion);
                        }
                        catch { }
                    }
                }
            }
            else if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'PENDIENTE', referenciaExterna: String(paymentDetail?.id || ''), notasInternas: JSON.stringify(paymentDetail) }
                });
            }
            else {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'FALLIDA', referenciaExterna: String(paymentDetail?.id || ''), notasInternas: JSON.stringify(paymentDetail) }
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
    async procesarPagoBrick(body) {
        try {
            const accessToken = process.env.MP_ACCESS_TOKEN || mercadopago_config_1.MP_DEFAULT_ACCESS_TOKEN;
            if (!accessToken) {
                throw new common_1.BadRequestException('Falta configurar MP_ACCESS_TOKEN en el entorno');
            }
            const client = new mercadopago_1.MercadoPagoConfig({ accessToken });
            const { Payment } = await Promise.resolve().then(() => require('mercadopago'));
            const payment = new Payment(client);
            let transaccionId = String(body.transaccionId || '');
            if (!transaccionId && body.preferenceId) {
                const tx = await this.prisma.transaccion.findFirst({ where: { referenciaExterna: body.preferenceId } });
                transaccionId = String(tx?.id || '');
            }
            if (!transaccionId) {
                throw new common_1.BadRequestException('No se pudo asociar el pago a una transacción');
            }
            const txFull = await this.prisma.transaccion.findUnique({
                where: { id: BigInt(transaccionId) },
                include: {
                    reserva: {
                        include: {
                            publicacion: { select: { precioPorDia: true, titulo: true } }
                        }
                    },
                    usuario: { select: { email: true, nombre: true, apellido: true, documentoIdentidad: true } }
                }
            });
            let montoCalculado = Number(body.transaction_amount || 0);
            try {
                if (txFull?.reserva?.fechaInicio && txFull?.reserva?.fechaFin && txFull?.reserva?.publicacion?.precioPorDia) {
                    const inicio = new Date(txFull.reserva.fechaInicio);
                    const fin = new Date(txFull.reserva.fechaFin);
                    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    montoCalculado = Number(txFull.reserva.publicacion.precioPorDia) * dias;
                }
            }
            catch { }
            const amount = Number(montoCalculado || body.transaction_amount);
            const issuerIdNum = body.issuer_id !== undefined && body.issuer_id !== null && body.issuer_id !== ''
                ? Number(body.issuer_id)
                : undefined;
            const payerBase = { ...(body.payer || {}) };
            if (!payerBase.email && txFull?.usuario?.email) {
                payerBase.email = txFull.usuario.email;
            }
            if (!payerBase.identification && txFull?.usuario?.documentoIdentidad) {
                payerBase.identification = { type: 'CI', number: String(txFull.usuario.documentoIdentidad) };
            }
            const payload = {
                token: body.token,
                payment_method_id: body.payment_method_id,
                transaction_amount: amount,
                installments: body.installments ?? 1,
                issuer_id: issuerIdNum,
                payer: payerBase,
                binary_mode: true,
                external_reference: transaccionId,
                additional_info: {
                    items: [
                        {
                            title: txFull?.reserva?.publicacion?.titulo || 'Pago de reserva',
                            description: `Reserva ${txFull?.reservaId || ''}`,
                            quantity: 1,
                            unit_price: amount,
                        },
                    ],
                    payer: {
                        first_name: body.payer?.first_name || txFull?.usuario?.nombre || undefined,
                        last_name: body.payer?.last_name || txFull?.usuario?.apellido || undefined,
                    },
                },
            };
            Object.keys(payload).forEach((k) => {
                if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
                    delete payload[k];
                }
            });
            console.log('🧾 [MP Brick] Payment.create body:', JSON.stringify(payload, null, 2));
            const result = await payment.create({ body: payload });
            console.log('🧾 [MP Brick] Payment.create result:', {
                id: result?.id,
                status: result?.status,
                status_detail: result?.status_detail,
                external_reference: result?.external_reference,
            });
            try {
                console.log('[MP Brick] Payment result full:', JSON.stringify(result, null, 2));
            }
            catch { }
            const estadoPago = String(result?.status || '').toUpperCase();
            if (estadoPago === 'APPROVED') {
                const transaccion = await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: {
                        estado: 'COMPLETADA',
                        fechaCompletado: new Date(),
                        referenciaExterna: String(result?.id || ''),
                        notasInternas: JSON.stringify(result),
                    },
                    include: { reserva: true },
                });
                if (transaccion?.reservaId) {
                    await this.prisma.reserva.update({ where: { id: transaccion.reservaId }, data: { estado: 'EN_CURSO' } });
                    if (this.notificaciones) {
                        try {
                            const res = await this.prisma.reserva.findUnique({ where: { id: transaccion.reservaId }, include: { publicacion: { select: { titulo: true, id: true } } } });
                            if (res)
                                await this.notificaciones.emitirPagoCompletado(res, transaccion);
                        }
                        catch { }
                    }
                }
                return transaccion;
            }
            if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'PENDIENTE', referenciaExterna: String(result?.id || ''), notasInternas: JSON.stringify(result) },
                });
            }
            else {
                await this.prisma.transaccion.update({
                    where: { id: BigInt(transaccionId) },
                    data: { estado: 'FALLIDA', referenciaExterna: String(result?.id || ''), notasInternas: JSON.stringify(result) },
                });
            }
            return await this.prisma.transaccion.findUnique({ where: { id: BigInt(transaccionId) }, include: { reserva: true } });
        }
        catch (error) {
            console.error('❌ [MP Brick] Error creando pago:', error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            const msg = String(error?.message || error?.error?.message || 'Error creando pago con Brick');
            const code = String(error?.cause?.[0]?.code || error?.error?.cause?.[0]?.code || '');
            const desc = String(error?.cause?.[0]?.description || error?.error?.cause?.[0]?.description || '');
            throw new common_1.BadRequestException(code ? `${msg} (${code}: ${desc})` : msg);
        }
    }
};
exports.TransaccionesService = TransaccionesService;
exports.TransaccionesService = TransaccionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, notificaciones_service_1.NotificacionesService])
], TransaccionesService);
