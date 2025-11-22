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
exports.ReservasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReservasService = class ReservasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obtenerSolicitudesPendientes(propietarioId) {
        try {
            console.log('🔍 [SERVICE] obtenerSolicitudesPendientes - Buscando solicitudes para propietarioId:', propietarioId);
            const solicitudes = await this.prisma.reserva.findMany({
                where: {
                    propietarioId: propietarioId,
                    estado: 'PENDIENTE'
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            telefono: true,
                            calificacionPromedio: true,
                            fechaCreacion: true
                        }
                    },
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            categoria: true,
                            precioPorDia: true,
                            marca: true,
                            modelo: true
                        }
                    }
                },
                orderBy: {
                    fechaCreacion: 'desc'
                }
            });
            console.log('📋 [SERVICE] obtenerSolicitudesPendientes - Resultados:', {
                propietarioId,
                cantidadEncontradas: solicitudes.length,
                solicitudes: solicitudes.map(s => ({
                    id: s.id,
                    usuarioId: s.usuarioId,
                    propietarioId: s.propietarioId,
                    publicacionTitulo: s.publicacion?.titulo
                }))
            });
            return {
                success: true,
                message: 'Solicitudes pendientes obtenidas exitosamente',
                data: solicitudes,
                total: solicitudes.length
            };
        }
        catch (error) {
            console.error('Error al obtener solicitudes pendientes:', error);
            throw new common_1.HttpException('Error interno del servidor al obtener solicitudes pendientes', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async obtenerTodasLasSolicitudes(propietarioId) {
        try {
            console.log('🔍 [SERVICE] obtenerTodasLasSolicitudes - Buscando todas las solicitudes para propietarioId:', propietarioId);
            const solicitudes = await this.prisma.reserva.findMany({
                where: {
                    propietarioId: propietarioId
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            telefono: true,
                            calificacionPromedio: true,
                            fechaCreacion: true
                        }
                    },
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            categoria: true,
                            precioPorDia: true,
                            marca: true,
                            modelo: true
                        }
                    }
                },
                orderBy: {
                    fechaCreacion: 'desc'
                }
            });
            console.log('📋 [SERVICE] obtenerTodasLasSolicitudes - Resultados:', {
                propietarioId,
                cantidadEncontradas: solicitudes.length,
                solicitudes: solicitudes.map(s => ({
                    id: s.id,
                    estado: s.estado,
                    usuarioId: s.usuarioId,
                    propietarioId: s.propietarioId,
                    publicacionTitulo: s.publicacion?.titulo
                }))
            });
            return {
                success: true,
                message: 'Todas las solicitudes obtenidas exitosamente',
                data: solicitudes,
                total: solicitudes.length
            };
        }
        catch (error) {
            console.error('Error al obtener todas las solicitudes:', error);
            throw new common_1.HttpException('Error interno del servidor al obtener todas las solicitudes', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async crearReserva(createReservaDto) {
        try {
            const publicacion = await this.prisma.publicacion.findUnique({
                where: { id: createReservaDto.publicacionId },
                select: {
                    id: true,
                    titulo: true,
                    precioPorDia: true,
                    estado: true,
                    propietarioId: true,
                }
            });
            if (!publicacion) {
                throw new common_1.NotFoundException('La publicación especificada no existe');
            }
            if (publicacion.estado !== 'ACTIVA') {
                throw new common_1.BadRequestException('La publicación no está disponible para reservas');
            }
            const usuario = await this.prisma.usuario.findUnique({
                where: { id: createReservaDto.usuarioId },
                select: { id: true, nombre: true, email: true }
            });
            if (!usuario) {
                throw new common_1.NotFoundException('El usuario especificado no existe');
            }
            if (publicacion.propietarioId !== createReservaDto.propietarioId) {
                throw new common_1.BadRequestException('El propietario especificado no coincide con el propietario de la publicación');
            }
            const fechaInicio = new Date(createReservaDto.fechaInicio);
            const fechaFin = new Date(createReservaDto.fechaFin);
            const ahora = new Date();
            const hoyInicio = new Date(ahora);
            hoyInicio.setHours(0, 0, 0, 0);
            const inicioReservaDia = new Date(fechaInicio);
            inicioReservaDia.setHours(0, 0, 0, 0);
            if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
                throw new common_1.BadRequestException('Las fechas proporcionadas no son válidas');
            }
            if (inicioReservaDia < hoyInicio) {
                throw new common_1.BadRequestException('La fecha de inicio debe ser hoy o futura');
            }
            if (fechaFin < fechaInicio) {
                throw new common_1.BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
            }
            const reservasConflictivas = await this.prisma.reserva.findMany({
                where: {
                    publicacionId: createReservaDto.publicacionId,
                    estado: {
                        in: ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO']
                    },
                    OR: [
                        {
                            AND: [
                                { fechaInicio: { lte: fechaInicio } },
                                { fechaFin: { gt: fechaInicio } }
                            ]
                        },
                        {
                            AND: [
                                { fechaInicio: { lt: fechaFin } },
                                { fechaFin: { gte: fechaFin } }
                            ]
                        },
                        {
                            AND: [
                                { fechaInicio: { gte: fechaInicio } },
                                { fechaFin: { lte: fechaFin } }
                            ]
                        }
                    ]
                }
            });
            if (reservasConflictivas.length > 0) {
                throw new common_1.BadRequestException('Ya existe una reserva para estas fechas. Por favor, selecciona otras fechas.');
            }
            if (createReservaDto.usuarioId === createReservaDto.propietarioId) {
                throw new common_1.BadRequestException('No puedes reservar tu propia publicación');
            }
            const reserva = await this.prisma.reserva.create({
                data: {
                    usuarioId: createReservaDto.usuarioId,
                    publicacionId: createReservaDto.publicacionId,
                    propietarioId: createReservaDto.propietarioId,
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin,
                    precioTotal: createReservaDto.precioTotal,
                    comisionPlataforma: createReservaDto.comisionPlataforma,
                    tipoEntrega: createReservaDto.tipoEntrega,
                    direccionEntrega: createReservaDto.direccionEntrega,
                    telefonoContacto: createReservaDto.telefonoContacto,
                    notasUsuario: createReservaDto.notasUsuario,
                    estado: 'PENDIENTE',
                    fechaCreacion: new Date(),
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true,
                        },
                    },
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            precioPorDia: true,
                        },
                    },
                    propietario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true,
                        },
                    },
                },
            });
            return {
                success: true,
                data: reserva,
                message: 'Reserva creada exitosamente',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Error al crear la reserva: ${error.message}`);
        }
    }
    async obtenerReservas(usuarioId) {
        try {
            const where = usuarioId ? { usuarioId } : {};
            const reservas = await this.prisma.reserva.findMany({
                where,
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true,
                        }
                    },
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            precioPorDia: true,
                        }
                    }
                },
                orderBy: {
                    fechaCreacion: 'desc'
                }
            });
            console.log('📋 [SERVICE] obtenerReservasArrendatario - Resultados:', {
                usuarioId,
                cantidadEncontradas: reservas.length,
                reservas: reservas.map(r => ({
                    id: r.id,
                    usuarioId: r.usuarioId,
                    propietarioId: r.propietarioId,
                    publicacionTitulo: r.publicacion.titulo
                }))
            });
            return {
                success: true,
                data: reservas,
                count: reservas.length
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al obtener las reservas'
            };
        }
    }
    async obtenerReservaPorId(id) {
        try {
            const reserva = await this.prisma.reserva.findUnique({
                where: { id },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true,
                        }
                    },
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            precioPorDia: true,
                            descripcion: true,
                        }
                    }
                }
            });
            if (!reserva) {
                throw new common_1.NotFoundException('Reserva no encontrada');
            }
            return {
                success: true,
                data: reserva
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Error al obtener la reserva: ${error.message}`);
        }
    }
    async obtenerReservasArrendatario(usuarioId) {
        try {
            console.log('🔍 [SERVICE] obtenerReservasArrendatario - Buscando reservas para usuarioId:', usuarioId);
            const reservas = await this.prisma.reserva.findMany({
                where: {
                    usuarioId: usuarioId
                },
                include: {
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            descripcion: true,
                            precioPorDia: true,
                            direccion: true,
                            ciudad: true,
                            departamento: true,
                            imagenes: true,
                            propietario: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellido: true,
                                    email: true,
                                    telefono: true
                                }
                            }
                        }
                    },
                    transacciones: {
                        select: {
                            id: true,
                            monto: true,
                            estado: true,
                            fechaCreacion: true,
                            metodoPago: true
                        },
                        orderBy: {
                            fechaCreacion: 'desc'
                        }
                    }
                },
                orderBy: {
                    fechaCreacion: 'desc'
                }
            });
            return {
                success: true,
                data: reservas,
                count: reservas.length
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al obtener las reservas del arrendatario: ${error.message}`);
        }
    }
    async actualizarReserva(id, data) {
        try {
            const reservaExistente = await this.prisma.reserva.findUnique({
                where: { id }
            });
            if (!reservaExistente) {
                throw new common_1.NotFoundException('Reserva no encontrada');
            }
            const updateData = {};
            if (data.estado)
                updateData.estado = data.estado;
            if (data.fechaInicio)
                updateData.fechaInicio = new Date(data.fechaInicio);
            if (data.fechaFin)
                updateData.fechaFin = new Date(data.fechaFin);
            if (data.precioTotal)
                updateData.precioTotal = data.precioTotal;
            const reserva = await this.prisma.reserva.update({
                where: { id },
                data: updateData,
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true,
                        }
                    },
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            precioPorDia: true,
                        }
                    }
                }
            });
            return {
                success: true,
                data: reserva,
                message: 'Reserva actualizada exitosamente'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Error al actualizar la reserva: ${error.message}`);
        }
    }
    async cancelarReserva(id) {
        return this.actualizarReserva(id, { estado: 'CANCELADA' });
    }
    async confirmarReserva(id) {
        return this.actualizarReserva(id, { estado: 'CONFIRMADA' });
    }
    async aceptarReserva(id) {
        return this.actualizarReserva(id, { estado: 'CONFIRMADA' });
    }
    async rechazarReserva(id) {
        return this.actualizarReserva(id, { estado: 'RECHAZADA' });
    }
    async activarReserva(id) {
        return this.actualizarReserva(id, { estado: 'EN_CURSO' });
    }
    async obtenerReservasActivasPropietario(propietarioId) {
        try {
            console.log('🔍 [SERVICE] obtenerReservasActivasPropietario - Buscando reservas para propietarioId:', propietarioId);
            const reservas = await this.prisma.reserva.findMany({
                where: {
                    propietarioId: propietarioId,
                    estado: 'EN_CURSO',
                    transacciones: {
                        some: {
                            tipo: 'PAGO_RESERVA',
                            estado: 'COMPLETADA'
                        }
                    }
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            telefono: true
                        }
                    },
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            descripcion: true,
                            precioPorDia: true,
                            direccion: true,
                            ciudad: true,
                            departamento: true,
                            imagenes: true
                        }
                    },
                    transacciones: {
                        select: {
                            id: true,
                            monto: true,
                            estado: true,
                            fechaCreacion: true,
                            metodoPago: true
                        },
                        orderBy: {
                            fechaCreacion: 'desc'
                        }
                    }
                },
                orderBy: {
                    fechaInicio: 'asc'
                }
            });
            console.log('📋 [SERVICE] obtenerReservasActivasPropietario - Resultados:', {
                propietarioId,
                cantidadEncontradas: reservas.length,
                reservas: reservas.map(r => ({
                    id: r.id,
                    estado: r.estado,
                    fechaInicio: r.fechaInicio,
                    fechaFin: r.fechaFin,
                    publicacionTitulo: r.publicacion?.titulo
                }))
            });
            return {
                success: true,
                data: reservas,
                count: reservas.length
            };
        }
        catch (error) {
            console.error('❌ [SERVICE] Error en obtenerReservasActivasPropietario:', error);
            throw new common_1.BadRequestException(`Error al obtener las reservas activas del propietario: ${error.message}`);
        }
    }
    async obtenerHistorialReservasPropietario(propietarioId) {
        try {
            console.log('🔍 [SERVICE] obtenerHistorialReservasPropietario - Buscando historial para propietarioId:', propietarioId);
            const reservas = await this.prisma.reserva.findMany({
                where: {
                    propietarioId: propietarioId,
                    estado: { in: ['COMPLETADA', 'CANCELADA', 'RECHAZADA'] }
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            telefono: true
                        }
                    },
                    publicacion: {
                        select: {
                            id: true,
                            titulo: true,
                            descripcion: true,
                            precioPorDia: true,
                            direccion: true,
                            ciudad: true,
                            departamento: true,
                            imagenes: true
                        }
                    },
                    transacciones: {
                        select: {
                            id: true,
                            monto: true,
                            estado: true,
                            fechaCreacion: true,
                            metodoPago: true
                        },
                        orderBy: {
                            fechaCreacion: 'desc'
                        }
                    }
                },
                orderBy: {
                    fechaCreacion: 'desc'
                }
            });
            console.log('📋 [SERVICE] obtenerHistorialReservasPropietario - Resultados:', {
                propietarioId,
                cantidadEncontradas: reservas.length,
                reservas: reservas.map(r => ({
                    id: r.id,
                    estado: r.estado,
                    fechaInicio: r.fechaInicio,
                    fechaFin: r.fechaFin,
                    publicacionTitulo: r.publicacion?.titulo
                }))
            });
            return {
                success: true,
                data: reservas,
                count: reservas.length
            };
        }
        catch (error) {
            console.error('❌ [SERVICE] Error en obtenerHistorialReservasPropietario:', error);
            throw new common_1.BadRequestException(`Error al obtener el historial de reservas del propietario: ${error.message}`);
        }
    }
};
exports.ReservasService = ReservasService;
exports.ReservasService = ReservasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservasService);
//# sourceMappingURL=reservas.service.js.map