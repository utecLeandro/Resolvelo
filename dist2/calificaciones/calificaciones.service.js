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
exports.CalificacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CalificacionesService = class CalificacionesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async crear(usuarioId, dto) {
        const reserva = await this.prisma.reserva.findUnique({ where: { id: BigInt(dto.reservaId) } });
        if (!reserva)
            throw new common_1.NotFoundException('Reserva no encontrada');
        if (reserva.usuarioId !== BigInt(usuarioId))
            throw new common_1.ForbiddenException('No autorizado para calificar esta reserva');
        if (reserva.estado !== 'COMPLETADA')
            throw new common_1.BadRequestException('Solo se puede calificar reservas completadas');
        const yaExiste = await this.prisma.calificacion.findFirst({ where: { reservaId: BigInt(dto.reservaId), usuarioCalificadorId: BigInt(usuarioId) } });
        if (yaExiste)
            throw new common_1.BadRequestException('Ya has calificado esta reserva');
        try {
            const calificacion = await this.prisma.calificacion.create({
                data: {
                    reservaId: BigInt(dto.reservaId),
                    publicacionId: reserva.publicacionId,
                    usuarioCalificadorId: BigInt(usuarioId),
                    usuarioCalificadoId: reserva.propietarioId,
                    puntuacion: dto.puntuacion,
                    comentario: dto.comentario ?? null,
                },
                include: {
                    usuarioCalificador: { select: { id: true, nombre: true, apellido: true } },
                },
            });
            const aggPub = await this.prisma.calificacion.aggregate({
                where: { publicacionId: reserva.publicacionId },
                _avg: { puntuacion: true },
                _count: { _all: true },
            });
            await this.prisma.publicacion.update({
                where: { id: reserva.publicacionId },
                data: {
                    calificacionPromedio: aggPub._avg.puntuacion ?? null,
                    totalCalificaciones: aggPub._count._all ?? 0,
                },
            });
            const aggUser = await this.prisma.calificacion.aggregate({
                where: { usuarioCalificadoId: reserva.propietarioId },
                _avg: { puntuacion: true },
                _count: { _all: true },
            });
            await this.prisma.usuario.update({
                where: { id: reserva.propietarioId },
                data: {
                    calificacionPromedio: aggUser._avg.puntuacion ?? null,
                    totalCalificaciones: aggUser._count._all ?? 0,
                },
            });
            return { success: true, data: calificacion };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(error?.message || 'Error al crear la calificación');
        }
    }
    async listarPorPublicacion(publicacionId, take = 10, skip = 0) {
        const calificaciones = await this.prisma.calificacion.findMany({
            where: { publicacionId: BigInt(publicacionId) },
            include: {
                usuarioCalificador: { select: { id: true, nombre: true, apellido: true } },
            },
            orderBy: { fechaCreacion: 'desc' },
            take,
            skip,
        });
        return { success: true, data: calificaciones };
    }
};
exports.CalificacionesService = CalificacionesService;
exports.CalificacionesService = CalificacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalificacionesService);
