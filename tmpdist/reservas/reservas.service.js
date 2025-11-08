"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservasService = void 0;
const common_1 = require("@nestjs/common");
let ReservasService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ReservasService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ReservasService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                // 1. Validar que la publicación existe y está disponible
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
                // 2. Validar que el usuario existe
                const usuario = await this.prisma.usuario.findUnique({
                    where: { id: createReservaDto.usuarioId },
                    select: { id: true, nombre: true, email: true }
                });
                if (!usuario) {
                    throw new common_1.NotFoundException('El usuario especificado no existe');
                }
                // 3. Validar que el propietario existe y coincide con la publicación
                if (publicacion.propietarioId !== createReservaDto.propietarioId) {
                    throw new common_1.BadRequestException('El propietario especificado no coincide con el propietario de la publicación');
                }
                // 4. Validar fechas adicionales (las validaciones básicas ya están en el DTO)
                const fechaInicio = new Date(createReservaDto.fechaInicio);
                const fechaFin = new Date(createReservaDto.fechaFin);
                const ahora = new Date();
                // Verificar que las fechas sean válidas
                if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
                    throw new common_1.BadRequestException('Las fechas proporcionadas no son válidas');
                }
                // Verificar que la fecha de inicio sea en el futuro
                if (fechaInicio <= ahora) {
                    throw new common_1.BadRequestException('La fecha de inicio debe ser en el futuro');
                }
                // Verificar que la fecha de fin sea posterior a la fecha de inicio
                if (fechaFin <= fechaInicio) {
                    throw new common_1.BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
                }
                // 5. Verificar que no existan reservas conflictivas (solapamiento de fechas)
                const reservasConflictivas = await this.prisma.reserva.findMany({
                    where: {
                        publicacionId: createReservaDto.publicacionId,
                        estado: {
                            in: ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO']
                        },
                        OR: [
                            {
                                // La nueva reserva empieza durante una reserva existente
                                AND: [
                                    { fechaInicio: { lte: fechaInicio } },
                                    { fechaFin: { gt: fechaInicio } }
                                ]
                            },
                            {
                                // La nueva reserva termina durante una reserva existente
                                AND: [
                                    { fechaInicio: { lt: fechaFin } },
                                    { fechaFin: { gte: fechaFin } }
                                ]
                            },
                            {
                                // La nueva reserva engloba completamente una reserva existente
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
                // 6. Verificar que el usuario no esté intentando reservar su propia publicación
                if (createReservaDto.usuarioId === createReservaDto.propietarioId) {
                    throw new common_1.BadRequestException('No puedes reservar tu propia publicación');
                }
                // 7. Crear la reserva
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
                // Si es una excepción conocida, la relanzamos
                if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                    throw error;
                }
                // Para otros errores, devolvemos una respuesta genérica
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
                // Verificar que la reserva existe
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
            // El estado EN_CURSO no existe en el esquema actual de Prisma.
            // Para mantener compatibilidad con el modelo, activamos la reserva como CONFIRMADA.
            return this.actualizarReserva(id, { estado: 'CONFIRMADA' });
        }
        /**
         * Obtener reservas activas del propietario (CONFIRMADA, EN_CURSO)
         */
        async obtenerReservasActivasPropietario(propietarioId) {
            try {
                console.log('🔍 [SERVICE] obtenerReservasActivasPropietario - Buscando reservas para propietarioId:', propietarioId);
                const reservas = await this.prisma.reserva.findMany({
                    where: {
                        propietarioId: propietarioId,
                        // El estado EN_CURSO no existe en el esquema actual, consideramos activas las CONFIRMADAS
                        estado: { in: ['CONFIRMADA'] }
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
        /**
         * Obtener historial de reservas del propietario (COMPLETADA, CANCELADA, RECHAZADA)
         */
        async obtenerHistorialReservasPropietario(propietarioId) {
            try {
                console.log('🔍 [SERVICE] obtenerHistorialReservasPropietario - Buscando historial para propietarioId:', propietarioId);
                const reservas = await this.prisma.reserva.findMany({
                    where: {
                        propietarioId: propietarioId,
                        // Unificamos estados de cancelación en 'CANCELADA' según el esquema actual
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
    return ReservasService = _classThis;
})();
exports.ReservasService = ReservasService;
