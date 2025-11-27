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
exports.PublicacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const text_utils_1 = require("./utils/text-utils");
let PublicacionesService = class PublicacionesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async crearPublicacion(usuarioId, crearPublicacionDto) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { id: usuarioId, activo: true }
            });
            if (!usuario) {
                throw new common_1.NotFoundException('Usuario no encontrado o inactivo');
            }
            this.validarPrecios(crearPublicacionDto);
            const publicacion = await this.prisma.publicacion.create({
                data: {
                    ...crearPublicacionDto,
                    propietarioId: usuarioId,
                    estado: client_1.EstadoPublicacion.ACTIVA,
                    estadoModeracion: client_1.EstadoModeracion.PENDIENTE_REVISION,
                    fechaPublicacion: new Date(),
                },
                include: {
                    propietario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            calificacionPromedio: true,
                            totalCalificaciones: true,
                        }
                    },
                    imagenes: true,
                }
            });
            return publicacion;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al crear la publicación');
        }
    }
    async obtenerPublicaciones(filtros) {
        const { pagina = 1, limite = 10, ordenarPor = 'fechaCreacion', direccionOrden = 'desc' } = filtros;
        const saltar = (pagina - 1) * limite;
        const condiciones = this.construirCondicionesFiltrado(filtros);
        const ordenamiento = this.construirOrdenamiento(ordenarPor, direccionOrden);
        try {
            const [publicaciones, total] = await Promise.all([
                this.prisma.publicacion.findMany({
                    where: condiciones,
                    include: {
                        propietario: {
                            select: {
                                id: true,
                                nombre: true,
                                apellido: true,
                                calificacionPromedio: true,
                                totalCalificaciones: true,
                            }
                        },
                        imagenes: {
                            select: {
                                id: true,
                                url: true,
                                esPrincipal: true,
                            }
                        },
                        _count: {
                            select: {
                                reservas: true,
                                calificaciones: true,
                            }
                        }
                    },
                    orderBy: ordenamiento,
                    skip: saltar,
                    take: limite,
                }),
                this.prisma.publicacion.count({
                    where: condiciones,
                }),
            ]);
            const publicacionesConPreciosNumericos = publicaciones.map(publicacion => ({
                ...publicacion,
                precioPorDia: Number(publicacion.precioPorDia),
                precioPorSemana: publicacion.precioPorSemana ? Number(publicacion.precioPorSemana) : null,
                precioPorMes: publicacion.precioPorMes ? Number(publicacion.precioPorMes) : null,
                deposito: publicacion.deposito ? Number(publicacion.deposito) : null,
            }));
            return {
                publicaciones: publicacionesConPreciosNumericos,
                paginacion: {
                    paginaActual: pagina,
                    totalPaginas: Math.ceil(total / limite),
                    totalElementos: total,
                    elementosPorPagina: limite,
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Error al obtener las publicaciones');
        }
    }
    async aprobarPublicacion(publicacionId, moderadorId, comentario) {
        const existente = await this.prisma.publicacion.findUnique({ where: { id: publicacionId } });
        if (!existente) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        let admin = await this.prisma.administrador.findUnique({ where: { usuarioId: moderadorId } });
        if (!admin) {
            const usuario = await this.prisma.usuario.findUnique({ where: { id: moderadorId, activo: true } });
            if (!usuario || (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'SUPER_ADMIN')) {
                throw new common_1.ForbiddenException('El usuario autenticado no es administrador');
            }
            admin = await this.prisma.administrador.create({ data: { usuarioId: moderadorId } });
        }
        const estadoAnterior = existente.estadoModeracion;
        const [actualizada] = await this.prisma.$transaction([
            this.prisma.publicacion.update({
                where: { id: publicacionId },
                data: {
                    estadoModeracion: client_1.EstadoModeracion.APROBADA,
                    fechaModeracion: new Date(),
                    moderadoPor: moderadorId,
                    comentarioModeracion: comentario ?? null,
                },
                include: {
                    propietario: {
                        select: { id: true, nombre: true, apellido: true, calificacionPromedio: true, totalCalificaciones: true }
                    },
                    imagenes: { select: { id: true, url: true, esPrincipal: true } },
                    _count: { select: { reservas: true, calificaciones: true } }
                }
            }),
            this.prisma.moderaccionPublicacion.create({
                data: {
                    accion: 'APROBAR',
                    motivo: null,
                    comentarios: comentario ?? null,
                    estadoAnterior: estadoAnterior,
                    estadoNuevo: client_1.EstadoModeracion.APROBADA,
                    publicacionId: publicacionId,
                    moderadorId: admin.id,
                }
            })
        ]);
        return actualizada;
    }
    async rechazarPublicacion(publicacionId, moderadorId, motivo, comentario) {
        const existente = await this.prisma.publicacion.findUnique({ where: { id: publicacionId } });
        if (!existente) {
            throw new common_1.NotFoundException('Publicación no encontrada');
        }
        let admin = await this.prisma.administrador.findUnique({ where: { usuarioId: moderadorId } });
        if (!admin) {
            const usuario = await this.prisma.usuario.findUnique({ where: { id: moderadorId, activo: true } });
            if (!usuario || (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'SUPER_ADMIN')) {
                throw new common_1.ForbiddenException('El usuario autenticado no es administrador');
            }
            admin = await this.prisma.administrador.create({ data: { usuarioId: moderadorId } });
        }
        const estadoAnterior = existente.estadoModeracion;
        const [actualizada] = await this.prisma.$transaction([
            this.prisma.publicacion.update({
                where: { id: publicacionId },
                data: {
                    estadoModeracion: client_1.EstadoModeracion.RECHAZADA,
                    fechaModeracion: new Date(),
                    moderadoPor: moderadorId,
                    comentarioModeracion: comentario ?? motivo ?? null,
                },
                include: {
                    propietario: {
                        select: { id: true, nombre: true, apellido: true, calificacionPromedio: true, totalCalificaciones: true }
                    },
                    imagenes: { select: { id: true, url: true, esPrincipal: true } },
                    _count: { select: { reservas: true, calificaciones: true } }
                }
            }),
            this.prisma.moderaccionPublicacion.create({
                data: {
                    accion: 'RECHAZAR',
                    motivo: motivo ?? null,
                    comentarios: comentario ?? null,
                    estadoAnterior: estadoAnterior,
                    estadoNuevo: client_1.EstadoModeracion.RECHAZADA,
                    publicacionId: publicacionId,
                    moderadorId: admin.id,
                }
            })
        ]);
        return actualizada;
    }
    async obtenerPublicacionPorId(id) {
        try {
            const publicacion = await this.prisma.publicacion.findUnique({
                where: { id },
                include: {
                    propietario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            telefono: true,
                            calificacionPromedio: true,
                            totalCalificaciones: true,
                            fechaCreacion: true,
                        }
                    },
                    imagenes: {
                        orderBy: { orden: 'asc' }
                    },
                    calificaciones: {
                        include: {
                            usuarioCalificador: {
                                select: {
                                    id: true,
                                    nombre: true,
                                    apellido: true,
                                }
                            }
                        },
                        orderBy: { fechaCreacion: 'desc' },
                        take: 10,
                    },
                    _count: {
                        select: {
                            reservas: true,
                            calificaciones: true,
                        }
                    }
                }
            });
            if (!publicacion) {
                throw new common_1.NotFoundException('Publicación no encontrada');
            }
            if (publicacion.estado === client_1.EstadoPublicacion.ELIMINADA) {
                throw new common_1.NotFoundException('Publicación no encontrada');
            }
            await this.prisma.publicacion.update({
                where: { id },
                data: { visualizaciones: { increment: 1 } }
            });
            const publicacionConPreciosNumericos = {
                ...publicacion,
                precioPorDia: Number(publicacion.precioPorDia),
                precioPorSemana: publicacion.precioPorSemana ? Number(publicacion.precioPorSemana) : null,
                precioPorMes: publicacion.precioPorMes ? Number(publicacion.precioPorMes) : null,
                deposito: publicacion.deposito ? Number(publicacion.deposito) : null,
            };
            return publicacionConPreciosNumericos;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al obtener la publicación');
        }
    }
    async actualizarPublicacion(id, usuarioId, actualizarPublicacionDto) {
        try {
            const publicacionExistente = await this.prisma.publicacion.findUnique({
                where: { id },
                select: { propietarioId: true, estado: true }
            });
            if (!publicacionExistente) {
                throw new common_1.NotFoundException('Publicación no encontrada');
            }
            if (publicacionExistente.propietarioId !== usuarioId) {
                throw new common_1.ForbiddenException('No tienes permisos para actualizar esta publicación');
            }
            if (actualizarPublicacionDto.precioPorDia ||
                actualizarPublicacionDto.precioPorSemana ||
                actualizarPublicacionDto.precioPorMes) {
                this.validarPrecios(actualizarPublicacionDto);
            }
            const publicacionActualizada = await this.prisma.publicacion.update({
                where: { id },
                data: {
                    ...actualizarPublicacionDto,
                    ...(this.requiereModeracion(actualizarPublicacionDto) && {
                        estadoModeracion: client_1.EstadoModeracion.PENDIENTE_REVISION
                    })
                },
                include: {
                    propietario: {
                        select: {
                            id: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            calificacionPromedio: true,
                            totalCalificaciones: true,
                        }
                    },
                    imagenes: true,
                }
            });
            return publicacionActualizada;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al actualizar la publicación');
        }
    }
    async eliminarPublicacion(id, usuarioId) {
        try {
            const publicacion = await this.prisma.publicacion.findUnique({
                where: { id },
                select: {
                    propietarioId: true,
                    estado: true,
                    _count: {
                        select: {
                            reservas: {
                                where: {
                                    estado: {
                                        in: ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO']
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!publicacion) {
                throw new common_1.NotFoundException('Publicación no encontrada');
            }
            if (publicacion.propietarioId !== usuarioId) {
                throw new common_1.ForbiddenException('No tienes permisos para eliminar esta publicación');
            }
            if (publicacion._count.reservas > 0) {
                throw new common_1.BadRequestException('No se puede eliminar una publicación con reservas activas');
            }
            await this.prisma.publicacion.update({
                where: { id },
                data: {
                    estado: client_1.EstadoPublicacion.ELIMINADA,
                    disponible: false
                }
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al eliminar la publicación');
        }
    }
    async obtenerPublicacionesUsuario(usuarioId, filtros) {
        const condiciones = {
            propietarioId: usuarioId,
            estado: client_1.EstadoPublicacion.ACTIVA,
        };
        if (filtros.busqueda) {
            condiciones['OR'] = [
                { titulo: { contains: filtros.busqueda, mode: 'insensitive' } },
                { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
                { marca: { contains: filtros.busqueda, mode: 'insensitive' } },
                { modelo: { contains: filtros.busqueda, mode: 'insensitive' } },
            ];
        }
        if (filtros.categoria) {
            condiciones['categoria'] = filtros.categoria;
        }
        if (filtros.ciudad) {
            condiciones['ciudad'] = { contains: filtros.ciudad, mode: 'insensitive' };
        }
        if (filtros.departamento) {
            condiciones['departamento'] = { contains: filtros.departamento, mode: 'insensitive' };
        }
        if (filtros.precioMinimo || filtros.precioMaximo) {
            condiciones['precioPorDia'] = {};
            if (filtros.precioMinimo) {
                condiciones['precioPorDia']['gte'] = filtros.precioMinimo;
            }
            if (filtros.precioMaximo) {
                condiciones['precioPorDia']['lte'] = filtros.precioMaximo;
            }
        }
        if (filtros.disponible !== undefined) {
            condiciones['disponible'] = filtros.disponible;
        }
        if (filtros.entregaDomicilio !== undefined) {
            condiciones['entregaDomicilio'] = filtros.entregaDomicilio;
        }
        if (filtros.retiroLocal !== undefined) {
            condiciones['retiroLocal'] = filtros.retiroLocal;
        }
        if (filtros.calificacionMinima) {
            condiciones['calificacionPromedio'] = { gte: filtros.calificacionMinima };
        }
        try {
            const publicaciones = await this.prisma.publicacion.findMany({
                where: condiciones,
                include: {
                    imagenes: {
                        select: {
                            id: true,
                            url: true,
                            esPrincipal: true,
                        }
                    },
                    _count: {
                        select: {
                            reservas: true,
                            calificaciones: true,
                        }
                    },
                    reservas: {
                        select: {
                            id: true,
                            estado: true,
                        }
                    }
                },
                orderBy: { fechaCreacion: 'desc' }
            });
            const publicacionesConPreciosNumericos = publicaciones.map(publicacion => {
                const estadisticasReservas = {
                    total: publicacion.reservas.length,
                    pendientes: publicacion.reservas.filter(r => r.estado === client_1.EstadoReserva.PENDIENTE).length,
                    aprobadas: publicacion.reservas.filter(r => r.estado === client_1.EstadoReserva.CONFIRMADA).length,
                    confirmadas: publicacion.reservas.filter(r => r.estado === client_1.EstadoReserva.CONFIRMADA).length,
                    activas: publicacion.reservas.filter(r => r.estado === client_1.EstadoReserva.CONFIRMADA).length,
                    completadas: publicacion.reservas.filter(r => r.estado === client_1.EstadoReserva.COMPLETADA).length,
                    rechazadas: publicacion.reservas.filter(r => r.estado === client_1.EstadoReserva.RECHAZADA).length,
                    canceladas: publicacion.reservas.filter(r => r.estado === client_1.EstadoReserva.CANCELADA).length,
                };
                const { reservas, ...publicacionSinReservas } = publicacion;
                return {
                    ...publicacionSinReservas,
                    precioPorDia: Number(publicacion.precioPorDia),
                    precioPorSemana: publicacion.precioPorSemana ? Number(publicacion.precioPorSemana) : null,
                    precioPorMes: publicacion.precioPorMes ? Number(publicacion.precioPorMes) : null,
                    deposito: publicacion.deposito ? Number(publicacion.deposito) : null,
                    estadisticasReservas,
                };
            });
            return publicacionesConPreciosNumericos;
        }
        catch (error) {
            throw new common_1.BadRequestException('Error al obtener las publicaciones del usuario');
        }
    }
    async obtenerReservasActivasPorPublicacion(id) {
        try {
            const reservas = await this.prisma.reserva.findMany({
                where: {
                    publicacionId: id,
                    estado: { in: [client_1.EstadoReserva.PENDIENTE, client_1.EstadoReserva.CONFIRMADA, client_1.EstadoReserva.EN_CURSO] },
                },
                select: { fechaInicio: true, fechaFin: true },
                orderBy: { fechaInicio: 'asc' },
            });
            return reservas;
        }
        catch (error) {
            throw new common_1.BadRequestException('Error al obtener reservas activas');
        }
    }
    async verificarDisponibilidadPublicacion(id, fechaInicio, fechaFin) {
        try {
            if (!fechaInicio || !fechaFin || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
                throw new common_1.BadRequestException('Las fechas proporcionadas no son válidas');
            }
            if (fechaInicio > fechaFin) {
                throw new common_1.BadRequestException('El rango de fechas es inválido: fechaInicio es posterior a fechaFin');
            }
            const solapadas = await this.prisma.reserva.count({
                where: {
                    publicacionId: id,
                    estado: { in: [client_1.EstadoReserva.PENDIENTE, client_1.EstadoReserva.CONFIRMADA, client_1.EstadoReserva.EN_CURSO] },
                    NOT: {
                        OR: [
                            { fechaFin: { lte: fechaInicio } },
                            { fechaInicio: { gte: fechaFin } },
                        ],
                    },
                },
            });
            return { disponible: solapadas === 0 };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al verificar disponibilidad');
        }
    }
    validarPrecios(datos) {
        const { precioPorDia, precioPorSemana, precioPorMes } = datos;
        if (precioPorDia && precioPorDia <= 0) {
            throw new common_1.BadRequestException('El precio por día debe ser mayor a 0');
        }
        if (precioPorSemana && precioPorDia && precioPorSemana >= precioPorDia * 7) {
            throw new common_1.BadRequestException('El precio por semana debe ser menor al precio diario multiplicado por 7');
        }
        if (precioPorMes && precioPorDia && precioPorMes >= precioPorDia * 30) {
            throw new common_1.BadRequestException('El precio por mes debe ser menor al precio diario multiplicado por 30');
        }
    }
    construirCondicionesFiltrado(filtros) {
        const condiciones = {
            estado: client_1.EstadoPublicacion.ACTIVA,
        };
        if (filtros?.incluirTodosEstadosModeracion) {
        }
        else if (filtros?.estadoModeracion) {
            condiciones.estadoModeracion = filtros.estadoModeracion;
        }
        else {
            condiciones.estadoModeracion = client_1.EstadoModeracion.APROBADA;
        }
        if (filtros.busqueda) {
            const palabrasClave = (0, text_utils_1.extraerPalabrasClave)(filtros.busqueda);
            if (palabrasClave.length > 0) {
                const condicionesBusqueda = [];
                condicionesBusqueda.push(...(0, text_utils_1.crearCondicionesBusqueda)('titulo', palabrasClave));
                condicionesBusqueda.push(...(0, text_utils_1.crearCondicionesBusqueda)('descripcion', palabrasClave));
                condicionesBusqueda.push(...(0, text_utils_1.crearCondicionesBusqueda)('marca', palabrasClave));
                condicionesBusqueda.push(...(0, text_utils_1.crearCondicionesBusqueda)('modelo', palabrasClave));
                condicionesBusqueda.push({ titulo: { contains: filtros.busqueda, mode: 'insensitive' } }, { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } }, { marca: { contains: filtros.busqueda, mode: 'insensitive' } }, { modelo: { contains: filtros.busqueda, mode: 'insensitive' } });
                condiciones.OR = condicionesBusqueda;
            }
        }
        if (filtros.categoria) {
            condiciones.categoria = filtros.categoria;
        }
        if (filtros.ciudad) {
            condiciones.ciudad = { contains: filtros.ciudad, mode: 'insensitive' };
        }
        if (filtros.departamento) {
            condiciones.departamento = { contains: filtros.departamento, mode: 'insensitive' };
        }
        if (filtros.precioMinimo || filtros.precioMaximo) {
            condiciones.precioPorDia = {};
            if (filtros.precioMinimo) {
                condiciones.precioPorDia.gte = filtros.precioMinimo;
            }
            if (filtros.precioMaximo) {
                condiciones.precioPorDia.lte = filtros.precioMaximo;
            }
        }
        if (filtros.disponible !== undefined) {
            condiciones.disponible = filtros.disponible;
        }
        if (filtros.entregaDomicilio !== undefined) {
            condiciones.entregaDomicilio = filtros.entregaDomicilio;
        }
        if (filtros.retiroLocal !== undefined) {
            condiciones.retiroLocal = filtros.retiroLocal;
        }
        if (filtros.calificacionMinima) {
            condiciones.calificacionPromedio = { gte: filtros.calificacionMinima };
        }
        if (filtros && filtros.fechaInicio && filtros.fechaFin) {
            const fechaInicio = filtros.fechaInicio;
            const fechaFin = filtros.fechaFin;
            if (fechaInicio > fechaFin) {
                throw new common_1.BadRequestException('El rango de fechas es inválido: fechaInicio es posterior a fechaFin');
            }
            condiciones.reservas = {
                none: {
                    estado: { in: [client_1.EstadoReserva.PENDIENTE, client_1.EstadoReserva.CONFIRMADA, client_1.EstadoReserva.EN_CURSO] },
                    NOT: {
                        OR: [
                            { fechaFin: { lte: fechaInicio } },
                            { fechaInicio: { gte: fechaFin } },
                        ],
                    },
                },
            };
            condiciones.disponible = true;
        }
        return condiciones;
    }
    construirOrdenamiento(ordenarPor, direccionOrden) {
        const camposValidos = [
            'fechaCreacion', 'fechaActualizacion', 'precioPorDia',
            'calificacionPromedio', 'visualizaciones', 'totalReservas'
        ];
        if (!camposValidos.includes(ordenarPor)) {
            ordenarPor = 'fechaCreacion';
        }
        return { [ordenarPor]: direccionOrden };
    }
    requiereModeracion(datosActualizacion) {
        const camposCriticos = ['titulo', 'descripcion', 'categoria', 'precioPorDia'];
        return camposCriticos.some(campo => datosActualizacion[campo] !== undefined);
    }
    async listarImagenes(publicacionId) {
        const pub = await this.prisma.publicacion.findUnique({ where: { id: publicacionId }, select: { id: true } });
        if (!pub)
            throw new common_1.NotFoundException('Publicación no encontrada');
        return await this.prisma.imagenPublicacion.findMany({ where: { publicacionId }, orderBy: { orden: 'asc' } });
    }
    async guardarImagenes(publicacionId, usuarioId, images) {
        if (!Array.isArray(images) || images.length === 0)
            throw new common_1.BadRequestException('Sin imágenes');
        if (images.length > 5)
            throw new common_1.BadRequestException('Máximo 5 imágenes por publicación');
        const existente = await this.prisma.publicacion.findUnique({ where: { id: publicacionId }, select: { propietarioId: true } });
        if (!existente)
            throw new common_1.NotFoundException('Publicación no encontrada');
        if (existente.propietarioId !== usuarioId)
            throw new common_1.ForbiddenException('No autorizado');
        const actuales = await this.prisma.imagenPublicacion.count({ where: { publicacionId } });
        if (actuales + images.length > 5)
            throw new common_1.BadRequestException('Se excede el máximo de 5 imágenes');
        const principalSolicitado = images.find((i) => i.esPrincipal === true);
        const maxOrden = await this.prisma.imagenPublicacion.aggregate({ where: { publicacionId }, _max: { orden: true } });
        let baseOrden = (maxOrden._max.orden ?? -1) + 1;
        const data = images.map((img) => ({
            url: img.url,
            descripcion: img.descripcion ?? null,
            orden: img.orden ?? baseOrden++,
            esPrincipal: img.esPrincipal === true,
            publicacionId,
        }));
        const created = await this.prisma.$transaction(async (tx) => {
            if (principalSolicitado) {
                await tx.imagenPublicacion.updateMany({ where: { publicacionId }, data: { esPrincipal: false } });
            }
            await tx.imagenPublicacion.createMany({ data });
            const nuevas = await tx.imagenPublicacion.findMany({ where: { publicacionId }, orderBy: { orden: 'asc' } });
            return nuevas;
        });
        return created;
    }
    async setImagenPrincipal(publicacionId, usuarioId, imagenId) {
        const existente = await this.prisma.publicacion.findUnique({ where: { id: publicacionId }, select: { propietarioId: true } });
        if (!existente)
            throw new common_1.NotFoundException('Publicación no encontrada');
        if (existente.propietarioId !== usuarioId)
            throw new common_1.ForbiddenException('No autorizado');
        const imagen = await this.prisma.imagenPublicacion.findUnique({ where: { id: imagenId } });
        if (!imagen || imagen.publicacionId !== publicacionId)
            throw new common_1.NotFoundException('Imagen no encontrada');
        await this.prisma.$transaction([
            this.prisma.imagenPublicacion.updateMany({ where: { publicacionId }, data: { esPrincipal: false } }),
            this.prisma.imagenPublicacion.update({ where: { id: imagenId }, data: { esPrincipal: true } }),
        ]);
    }
    async eliminarImagen(publicacionId, usuarioId, imagenId) {
        const existente = await this.prisma.publicacion.findUnique({ where: { id: publicacionId }, select: { propietarioId: true } });
        if (!existente)
            throw new common_1.NotFoundException('Publicación no encontrada');
        if (existente.propietarioId !== usuarioId)
            throw new common_1.ForbiddenException('No autorizado');
        const imagen = await this.prisma.imagenPublicacion.findUnique({ where: { id: imagenId } });
        if (!imagen || imagen.publicacionId !== publicacionId)
            throw new common_1.NotFoundException('Imagen no encontrada');
        await this.prisma.imagenPublicacion.delete({ where: { id: imagenId } });
    }
};
exports.PublicacionesService = PublicacionesService;
exports.PublicacionesService = PublicacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicacionesService);
