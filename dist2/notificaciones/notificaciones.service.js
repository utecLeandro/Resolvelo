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
exports.NotificacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const rxjs_1 = require("rxjs");
const nodemailer = require("nodemailer");
const client_ses_1 = require("@aws-sdk/client-ses");
let NotificacionesService = class NotificacionesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sse = new rxjs_1.Subject();
    get stream() {
        return this.sse.asObservable();
    }
    emitir(usuarioId, data) {
        try {
            this.sse.next({ usuarioId: String(usuarioId), data });
        }
        catch { }
    }
    async listar(usuarioId) {
        if (!usuarioId)
            throw new common_1.BadRequestException('Usuario no autenticado');
        const usuario = await this.prisma.usuario.findUnique({ where: { id: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) }, select: { fechaUltimoAcceso: true } });
        const ultimoVisto = usuario?.fechaUltimoAcceso ?? new Date(0);
        const reservasRecibidas = await this.prisma.reserva.findMany({
            where: { propietarioId: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) },
            orderBy: { fechaCreacion: 'desc' },
            take: 20,
            select: {
                id: true,
                fechaCreacion: true,
                fechaInicio: true,
                fechaFin: true,
                estado: true,
                usuario: { select: { id: true, nombre: true, apellido: true } },
                publicacion: { select: { id: true, titulo: true, categoria: true, marca: true, modelo: true } },
            },
        });
        const reservasActualizadas = await this.prisma.reserva.findMany({
            where: {
                OR: [
                    { usuarioId: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) },
                    { propietarioId: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) },
                ],
                fechaActualizacion: { gt: ultimoVisto }
            },
            orderBy: { fechaActualizacion: 'desc' },
            take: 20,
            select: {
                id: true,
                fechaActualizacion: true,
                estado: true,
                usuarioId: true,
                propietarioId: true,
                publicacion: { select: { id: true, titulo: true } },
            }
        });
        const mensajes = await this.prisma.mensaje.findMany({
            where: { receptorId: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) },
            orderBy: { fechaCreacion: 'desc' },
            take: 20,
            select: {
                id: true,
                contenido: true,
                fechaCreacion: true,
                leido: true,
                reservaId: true,
                emisor: { select: { id: true, nombre: true, apellido: true, avatarUrl: true } },
            },
        });
        const calificaciones = await this.prisma.calificacion.findMany({
            where: { publicacion: { propietarioId: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) } },
            orderBy: { fechaCreacion: 'desc' },
            take: 20,
            select: {
                id: true,
                puntuacion: true,
                comentario: true,
                fechaCreacion: true,
                publicacion: { select: { id: true, titulo: true } },
                usuarioCalificador: { select: { id: true, nombre: true, apellido: true } },
            },
        });
        const moderaciones = await this.prisma.moderaccionPublicacion.findMany({
            where: { publicacion: { propietarioId: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) } },
            orderBy: { fechaCreacion: 'desc' },
            take: 20,
            select: {
                id: true,
                accion: true,
                estadoNuevo: true,
                motivo: true,
                comentarios: true,
                fechaCreacion: true,
                publicacion: { select: { id: true, titulo: true } },
            },
        });
        const items = [
            ...reservasRecibidas.map(r => ({
                id: `res_${r.id}`,
                tipo: 'PUBLICACION_EVENTO',
                titulo: `Nueva reserva en \"${r.publicacion?.titulo ?? ''}\"`,
                mensaje: `${(r.usuario?.nombre ?? '')} ${(r.usuario?.apellido ?? '')} reservó del ${new Date(r.fechaInicio).toLocaleDateString()} al ${new Date(r.fechaFin).toLocaleDateString()}${r.publicacion?.marca || r.publicacion?.modelo ? ` · ${[r.publicacion?.marca, r.publicacion?.modelo].filter(Boolean).join(' ')}` : ''}`.trim(),
                timestamp: r.fechaCreacion,
                read: r.fechaCreacion <= ultimoVisto,
                icon: 'bell',
                data: { reservaId: r.id, publicacionId: r.publicacion?.id },
            })),
            ...reservasActualizadas.map(r => ({
                id: `res_estado_${r.id}_${r.estado}`,
                tipo: 'PUBLICACION_EVENTO',
                titulo: `Reserva \"${r.publicacion?.titulo ?? ''}\"`,
                mensaje: `Estado actualizado a ${r.estado}`,
                timestamp: r.fechaActualizacion,
                read: r.fechaActualizacion <= ultimoVisto,
                icon: 'document',
                data: { reservaId: r.id, publicacionId: r.publicacion?.id },
            })),
            ...mensajes.map(m => ({
                id: `msg_${m.id}`,
                tipo: 'MENSAJE',
                titulo: `Nuevo mensaje de ${m.emisor?.nombre ?? ''} ${m.emisor?.apellido ?? ''}`.trim(),
                mensaje: m.contenido,
                timestamp: m.fechaCreacion,
                read: !!m.leido,
                icon: 'bell',
                data: { reservaId: m.reservaId, emisorId: m.emisor?.id },
            })),
            ...calificaciones.map(c => ({
                id: `cal_${c.id}`,
                tipo: 'RESEÑA',
                titulo: `Nueva reseña en "${c.publicacion?.titulo ?? ''}"`,
                mensaje: `${c.usuarioCalificador?.nombre ?? ''} ${c.usuarioCalificador?.apellido ?? ''} calificó ${c.puntuacion}/5${c.comentario ? ': ' + c.comentario : ''}`.trim(),
                timestamp: c.fechaCreacion,
                read: c.fechaCreacion <= ultimoVisto,
                icon: 'star',
                data: { publicacionId: c.publicacion?.id },
            })),
            ...moderaciones.map(m => ({
                id: `mod_${m.id}`,
                tipo: 'PUBLICACION_EVENTO',
                titulo: `Moderación de publicación "${m.publicacion?.titulo ?? ''}"`,
                mensaje: `${m.accion} → ${m.estadoNuevo}${m.motivo ? ' (' + m.motivo + ')' : ''}`.trim(),
                timestamp: m.fechaCreacion,
                read: m.fechaCreacion <= ultimoVisto,
                icon: 'document',
                data: { publicacionId: m.publicacion?.id },
            })),
        ];
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const noLeidas = items.filter(i => !i.read).length;
        return { items, noLeidas };
    }
    async marcarLeidas(usuarioId) {
        if (!usuarioId)
            throw new common_1.BadRequestException('Usuario no autenticado');
        await this.prisma.$transaction([
            this.prisma.usuario.update({ where: { id: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) }, data: { fechaUltimoAcceso: new Date() } }),
            this.prisma.mensaje.updateMany({ where: { receptorId: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId), leido: false }, data: { leido: true, fechaLectura: new Date() } }),
        ]);
        return { ok: true };
    }
    async enviarEmail(usuarioId, asunto, html) {
        try {
            const usuario = await this.prisma.usuario.findUnique({ where: { id: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId) }, select: { email: true, nombre: true, notificacionesEmail: true } });
            if (!usuario?.email || usuario?.notificacionesEmail === false)
                return;
            const from = (process.env.EMAIL_FROM || 'noreply@resolvelo.com').trim();
            const region = (process.env.AWS_REGION || 'us-east-1').trim();
            try {
                const ses = new client_ses_1.SESClient({ region });
                const command = new client_ses_1.SendEmailCommand({
                    Source: from,
                    Destination: { ToAddresses: [usuario.email] },
                    Message: {
                        Subject: { Data: asunto, Charset: 'UTF-8' },
                        Body: { Html: { Data: html, Charset: 'UTF-8' } },
                    },
                });
                await ses.send(command);
            }
            catch (e1) {
                try {
                    const transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST || '127.0.0.1',
                        port: Number(process.env.SMTP_PORT || 1025),
                        secure: false,
                        auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
                        connectionTimeout: 2000,
                        greetingTimeout: 2000,
                        socketTimeout: 3000,
                    });
                    await transporter.sendMail({ from, to: usuario.email, subject: asunto, html });
                }
                catch (e2) {
                    try {
                        console.warn('[Notificaciones] fallo email', e2?.message);
                    }
                    catch { }
                }
            }
        }
        catch (e) {
            try {
                console.warn('[Notificaciones] fallo email', e?.message);
            }
            catch { }
        }
    }
    async emitirReservaNueva(propietarioId, reserva) {
        const item = {
            id: `res_nueva_${reserva.id}`,
            tipo: 'PUBLICACION_EVENTO',
            titulo: `Nueva reserva en "${reserva.publicacion?.titulo ?? ''}"`,
            mensaje: `${reserva.usuario?.nombre ?? 'Usuario'} ${(reserva.usuario?.apellido ?? '')} reservó el ${new Date().toLocaleString()} · del ${new Date(reserva.fechaInicio).toLocaleDateString()} al ${new Date(reserva.fechaFin).toLocaleDateString()}${reserva.publicacion?.marca || reserva.publicacion?.modelo ? ` · ${[reserva.publicacion?.marca, reserva.publicacion?.modelo].filter(Boolean).join(' ')}` : ''}`.trim(),
            timestamp: new Date().toISOString(),
            read: false,
            icon: 'bell',
            data: { reservaId: reserva.id, publicacionId: reserva.publicacion?.id }
        };
        this.emitir(propietarioId, { tipo: 'PUSH', item });
        const frontendBase = (process.env.FRONTEND_URL || 'http://127.0.0.1:5174').trim();
        const link = `${frontendBase}/mis-publicaciones?pub=${encodeURIComponent(String(reserva.publicacion?.id))}`;
        const html = `
      <p>Tienes una nueva solicitud de reserva.</p>
      <p><strong>Reservó:</strong> ${(reserva.usuario?.nombre ?? 'Usuario')} ${(reserva.usuario?.apellido ?? '')}</p>
      <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Equipo:</strong> ${reserva.publicacion?.titulo ?? ''}${reserva.publicacion?.marca || reserva.publicacion?.modelo ? ` · ${[reserva.publicacion?.marca, reserva.publicacion?.modelo].filter(Boolean).join(' ')}` : ''}</p>
      <p><strong>Periodo:</strong> ${new Date(reserva.fechaInicio).toLocaleDateString()} → ${new Date(reserva.fechaFin).toLocaleDateString()}</p>
      <p><a href="${link}">Ver detalles</a></p>
    `;
        await this.enviarEmail(propietarioId, 'Nueva solicitud de reserva', html);
    }
    async emitirCambioEstado(reserva, anterior, actual) {
        const baseTitulo = `Reserva "${reserva.publicacion?.titulo ?? ''}"`;
        const texto = `Estado: ${anterior ?? 'PENDIENTE'} → ${actual}`;
        const item = {
            id: `res_estado_${reserva.id}_${actual}`,
            tipo: 'PUBLICACION_EVENTO',
            titulo: baseTitulo,
            mensaje: texto,
            timestamp: new Date().toISOString(),
            read: false,
            icon: 'document',
            data: { reservaId: reserva.id, publicacionId: reserva.publicacion?.id }
        };
        this.emitir(reserva.propietarioId, { tipo: 'PUSH', item });
        this.emitir(reserva.usuarioId, { tipo: 'PUSH', item });
        const frontendBase = (process.env.FRONTEND_URL || 'http://127.0.0.1:5174').trim();
        const linkArrendatario = `${frontendBase}/mis-reservas`;
        const linkPropietario = `${frontendBase}/mis-publicaciones?pub=${encodeURIComponent(String(reserva.publicacion?.id))}`;
        await this.enviarEmail(reserva.usuarioId, `Actualización de reserva: ${actual}`, `<p>Tu reserva cambió de estado.</p><p><a href="${linkArrendatario}">Ver</a></p>`);
        await this.enviarEmail(reserva.propietarioId, `Actualización de reserva: ${actual}`, `<p>Una de tus reservas cambió de estado.</p><p><a href="${linkPropietario}">Ver</a></p>`);
    }
    async emitirPagoCompletado(reserva, transaccion) {
        const titulo = `Pago confirmado en "${reserva.publicacion?.titulo ?? ''}"`;
        const fecha = transaccion?.fechaCompletado ? new Date(transaccion.fechaCompletado) : new Date();
        const item = {
            id: `res_pago_${reserva.id}_${transaccion?.id ?? ''}`,
            tipo: 'PUBLICACION_EVENTO',
            titulo,
            mensaje: `El arrendatario pagó la reserva el ${fecha.toLocaleString()}`,
            timestamp: new Date().toISOString(),
            read: false,
            icon: 'document',
            data: { reservaId: reserva.id, publicacionId: reserva.publicacion?.id, transaccionId: transaccion?.id }
        };
        this.emitir(reserva.propietarioId, { tipo: 'PUSH', item });
        const frontendBase = (process.env.FRONTEND_URL || 'http://127.0.0.1:5174').trim();
        const link = `${frontendBase}/mis-publicaciones?pub=${encodeURIComponent(String(reserva.publicacion?.id))}`;
        const html = `
      <p>Se confirmó el pago de una reserva.</p>
      <p><strong>Fecha y hora:</strong> ${fecha.toLocaleString()}</p>
      <p><strong>Equipo:</strong> ${reserva.publicacion?.titulo ?? ''}</p>
      <p><a href="${link}">Ver detalles</a></p>
    `;
        await this.enviarEmail(reserva.propietarioId, 'Pago confirmado de reserva', html);
    }
};
exports.NotificacionesService = NotificacionesService;
exports.NotificacionesService = NotificacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificacionesService);
