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
exports.MensajesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = require("nodemailer");
let MensajesService = class MensajesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listarPorReserva(reservaId, usuarioId) {
        console.log('[MensajesService] listarPorReserva', { reservaId, usuarioId });
        const reserva = await this.prisma.reserva.findUnique({
            where: { id: reservaId },
            include: {
                publicacion: {
                    select: {
                        id: true,
                        titulo: true,
                        ciudad: true,
                        departamento: true,
                        precioPorDia: true,
                        imagenes: {
                            where: { esPrincipal: true },
                            orderBy: { orden: 'asc' },
                            take: 1,
                            select: { url: true }
                        }
                    }
                },
                usuario: { select: { id: true, nombre: true, apellido: true, avatarUrl: true } },
                propietario: { select: { id: true, nombre: true, apellido: true, avatarUrl: true } },
            }
        });
        if (!reserva)
            throw new common_1.BadRequestException('Reserva no encontrada');
        if (usuarioId !== reserva.usuarioId && usuarioId !== reserva.propietarioId)
            throw new common_1.ForbiddenException('Acceso denegado');
        const mensajes = await this.prisma.mensaje.findMany({ where: { reservaId }, orderBy: { fechaCreacion: 'asc' } });
        const esArrendatario = usuarioId === reserva.usuarioId;
        const contraparte = esArrendatario ? reserva.propietario : reserva.usuario;
        const imagenPrincipalUrl = reserva.publicacion?.imagenes?.[0]?.url || null;
        const info = {
            contraparte,
            publicacion: {
                id: reserva.publicacion?.id,
                titulo: reserva.publicacion?.titulo,
                ciudad: reserva.publicacion?.ciudad,
                departamento: reserva.publicacion?.departamento,
                precioPorDia: reserva.publicacion?.precioPorDia ? Number(reserva.publicacion.precioPorDia) : null,
                imagenPrincipalUrl,
            },
            reserva: {
                id: reservaId,
                fechaInicio: reserva.fechaInicio,
                fechaFin: reserva.fechaFin,
                estado: reserva.estado,
                tipoEntrega: reserva.tipoEntrega,
                direccionEntrega: reserva.direccionEntrega,
                precioTotal: reserva.precioTotal ? Number(reserva.precioTotal) : null,
            },
            yo: { id: usuarioId, rol: esArrendatario ? 'ARRENDATARIO' : 'PROPIETARIO' },
        };
        return { mensajes, info };
    }
    async marcarLeidos(reservaId, usuarioId) {
        const reserva = await this.prisma.reserva.findUnique({ where: { id: reservaId }, select: { usuarioId: true, propietarioId: true } });
        if (!reserva)
            throw new common_1.BadRequestException('Reserva no encontrada');
        if (usuarioId !== reserva.usuarioId && usuarioId !== reserva.propietarioId)
            throw new common_1.ForbiddenException('Acceso denegado');
        await this.prisma.mensaje.updateMany({ where: { reservaId, receptorId: usuarioId, leido: false }, data: { leido: true, fechaLectura: new Date() } });
        return { ok: true };
    }
    async enviarMensaje(dto, emisorId) {
        console.log('[MensajesService] enviarMensaje', { dto, emisorId });
        const contenido = (dto.contenido || '').trim();
        if (!contenido || contenido.length > 2000)
            throw new common_1.BadRequestException('Contenido inválido');
        if (/<script/i.test(contenido))
            throw new common_1.BadRequestException('Contenido no permitido');
        const reserva = await this.prisma.reserva.findUnique({ where: { id: dto.reservaId }, select: { id: true, usuarioId: true, propietarioId: true, publicacionId: true } });
        if (!reserva)
            throw new common_1.BadRequestException('Reserva no encontrada');
        if (emisorId !== reserva.usuarioId && emisorId !== reserva.propietarioId)
            throw new common_1.ForbiddenException('No autorizado');
        const ahora = new Date();
        const haceUnMin = new Date(ahora.getTime() - 60 * 1000);
        const enviadosUltimoMinuto = await this.prisma.mensaje.count({ where: { emisorId, fechaCreacion: { gte: haceUnMin } } });
        if (enviadosUltimoMinuto >= 5)
            throw new common_1.HttpException('Demasiados mensajes en poco tiempo', common_1.HttpStatus.TOO_MANY_REQUESTS);
        const receptorId = dto.receptorId && dto.receptorId.length > 0 ? dto.receptorId : (emisorId === reserva.usuarioId ? reserva.propietarioId : reserva.usuarioId);
        const mensaje = await this.prisma.mensaje.create({ data: { contenido, emisorId, receptorId, reservaId: reserva.id } });
        console.log('[MensajesService] creado', { id: mensaje.id, reservaId: reserva.id, emisorId, receptorId });
        const totalMensajes = await this.prisma.mensaje.count({ where: { reservaId: reserva.id } });
        if (totalMensajes === 1) {
            this.enviarEmailNotificacionPrimerMensaje(reserva.id, receptorId, mensaje.id).catch(() => { });
        }
        return { mensaje };
    }
    async enviarEmailNotificacionPrimerMensaje(reservaId, receptorId, mensajeId) {
        try {
            const receptor = await this.prisma.usuario.findUnique({ where: { id: receptorId }, select: { email: true, nombre: true } });
            if (!receptor?.email)
                return;
            const reserva = await this.prisma.reserva.findUnique({ where: { id: reservaId }, include: { publicacion: { select: { titulo: true } } } });
            const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5174';
            const link = `${frontendBase}/mensajes/reserva/${encodeURIComponent(reservaId)}?m=${encodeURIComponent(mensajeId)}`;
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || '127.0.0.1',
                port: Number(process.env.SMTP_PORT || 1025),
                secure: false,
                auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
                connectionTimeout: 2000,
                greetingTimeout: 2000,
                socketTimeout: 3000,
            });
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@resolvelo.com',
                to: receptor.email,
                subject: `Nuevo mensaje sobre "${reserva?.publicacion?.titulo || 'tu reserva'}"`,
                html: `<p>Tienes nuevos mensajes sin leer.</p><p><a href="${link}">Abrir chat</a></p>`,
            });
        }
        catch (e) {
            console.warn('Fallo al enviar email de notificación:', e?.message);
        }
    }
    async listarMisConversaciones(usuarioId) {
        console.log('[MensajesService] listarMisConversaciones', { usuarioId });
        const reservas = await this.prisma.reserva.findMany({
            where: { OR: [{ usuarioId }, { propietarioId: usuarioId }] },
            include: {
                publicacion: {
                    select: {
                        id: true,
                        titulo: true,
                        imagenes: {
                            where: { esPrincipal: true },
                            orderBy: { orden: 'asc' },
                            take: 1,
                            select: { url: true }
                        }
                    }
                },
                usuario: { select: { id: true, nombre: true, apellido: true, avatarUrl: true } },
                propietario: { select: { id: true, nombre: true, apellido: true, avatarUrl: true } },
                mensajes: { orderBy: { fechaCreacion: 'desc' }, take: 1 },
            },
            orderBy: { fechaCreacion: 'desc' }
        });
        const conUnread = await Promise.all(reservas.map(async (r) => {
            const noLeidos = await this.prisma.mensaje.count({ where: { reservaId: r.id, receptorId: usuarioId, leido: false } });
            const esArrendatario = usuarioId === r.usuarioId;
            const contraparte = esArrendatario ? r.propietario : r.usuario;
            const imagenPrincipalUrl = r.publicacion?.imagenes?.[0]?.url || null;
            return {
                reservaId: r.id,
                publicacion: { id: r.publicacion?.id, titulo: r.publicacion?.titulo, imagenPrincipalUrl },
                ultimoMensaje: r.mensajes[0] || null,
                noLeidos,
                contraparte,
            };
        }));
        return { conversaciones: conUnread };
    }
};
exports.MensajesService = MensajesService;
exports.MensajesService = MensajesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MensajesService);
