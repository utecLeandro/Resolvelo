/**
 * Servicio de Publicaciones
 * Maneja toda la lógica de negocio relacionada con las publicaciones de equipos musicales
 * Implementa operaciones CRUD y búsquedas avanzadas
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from './dto/actualizar-publicacion.dto';
import { FiltrosPublicacionDto } from './dto/filtros-publicacion.dto';
import {
  Publicacion,
  EstadoPublicacion,
  EstadoModeracion,
  EstadoReserva,
} from '@prisma/client';
import {
  extraerPalabrasClave,
  crearCondicionesBusqueda,
} from './utils/text-utils';

@Injectable()
export class PublicacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva publicación de equipo musical
   * @param usuarioId ID del usuario propietario
   * @param crearPublicacionDto Datos de la publicación
   * @returns Publicación creada
   */
  async crearPublicacion(
    usuarioId: string,
    crearPublicacionDto: CrearPublicacionDto,
  ): Promise<Publicacion> {
    try {
      // Verificar que el usuario existe y está activo
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: BigInt(usuarioId) },
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado o inactivo');
      }
      if (!usuario.activo) {
        throw new NotFoundException('Usuario no encontrado o inactivo');
      }

      // Validar que los precios sean coherentes
      this.validarPrecios(crearPublicacionDto);

      // Crear la publicación
      const publicacion = await this.prisma.publicacion.create({
        data: {
          ...crearPublicacionDto,
          propietarioId: BigInt(usuarioId),
          estado: EstadoPublicacion.ACTIVA,
          estadoModeracion: EstadoModeracion.PENDIENTE_REVISION,
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
            },
          },
          imagenes: true,
        },
      });

      return publicacion;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al crear la publicación');
    }
  }

  /**
   * Obtener todas las publicaciones con filtros
   * @param filtros Filtros de búsqueda
   * @returns Lista paginada de publicaciones
   */
  async obtenerPublicaciones(filtros: FiltrosPublicacionDto) {
    const {
      pagina = 1,
      limite = 10,
      ordenarPor = 'fechaCreacion',
      direccionOrden = 'desc',
    } = filtros;
    const saltar = (pagina - 1) * limite;

    // Construir condiciones de filtrado
    const condiciones = this.construirCondicionesFiltrado(filtros);

    // Construir ordenamiento
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
              },
            },
            imagenes: {
              select: {
                id: true,
                url: true,
                esPrincipal: true,
              },
            },
            _count: {
              select: {
                reservas: true,
                calificaciones: true,
              },
            },
          },
          orderBy: ordenamiento,
          skip: saltar,
          take: limite,
        }),
        this.prisma.publicacion.count({
          where: condiciones,
        }),
      ]);

      // Convertir precios Decimal a números para el frontend
      const publicacionesConPreciosNumericos = publicaciones.map(
        (publicacion) => ({
          ...publicacion,
          totalReservas:
            publicacion._count?.reservas ?? publicacion.totalReservas,
          totalCalificaciones:
            publicacion._count?.calificaciones ??
            publicacion.totalCalificaciones,
          precioPorDia: Number(publicacion.precioPorDia),
          precioPorSemana: publicacion.precioPorSemana
            ? Number(publicacion.precioPorSemana)
            : null,
          precioPorMes: publicacion.precioPorMes
            ? Number(publicacion.precioPorMes)
            : null,
          deposito: publicacion.deposito ? Number(publicacion.deposito) : null,
        }),
      );

      return {
        publicaciones: publicacionesConPreciosNumericos,
        paginacion: {
          paginaActual: pagina,
          totalPaginas: Math.ceil(total / limite),
          totalElementos: total,
          elementosPorPagina: limite,
        },
      };
    } catch (_error) {
      throw new BadRequestException('Error al obtener las publicaciones');
    }
  }

  /**
   * Aprobar una publicación (moderación)
   */
  async aprobarPublicacion(
    publicacionId: string,
    moderadorId: string,
    comentario?: string,
  ): Promise<Publicacion> {
    // Verificar existencia de la publicación
    const existente = await this.prisma.publicacion.findUnique({
      where: { id: BigInt(publicacionId) },
    });
    if (!existente) {
      throw new NotFoundException('Publicación no encontrada');
    }

    let admin = await this.prisma.administrador.findUnique({
      where: { usuarioId: BigInt(moderadorId) },
    });
    if (!admin) {
      const usuario = await this.prisma.usuario.findFirst({
        where: { id: BigInt(moderadorId), activo: true },
      });
      if (
        !usuario ||
        (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'SUPER_ADMIN')
      ) {
        throw new ForbiddenException(
          'El usuario autenticado no es administrador',
        );
      }
      admin = await this.prisma.administrador.create({
        data: { usuarioId: BigInt(moderadorId) },
      });
    }

    const estadoAnterior = existente.estadoModeracion;

    // Transacción para actualizar publicación y registrar moderación
    const [actualizada] = await this.prisma.$transaction([
      this.prisma.publicacion.update({
        where: { id: BigInt(publicacionId) },
        data: {
          estadoModeracion: EstadoModeracion.APROBADA,
          fechaModeracion: new Date(),
          moderadoPor: String(moderadorId),
          comentarioModeracion: comentario ?? null,
        },
        include: {
          propietario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              calificacionPromedio: true,
              totalCalificaciones: true,
            },
          },
          imagenes: { select: { id: true, url: true, esPrincipal: true } },
          _count: { select: { reservas: true, calificaciones: true } },
        },
      }),
      this.prisma.moderaccionPublicacion.create({
        data: {
          accion: 'APROBAR',
          motivo: null,
          comentarios: comentario ?? null,
          estadoAnterior: estadoAnterior,
          estadoNuevo: EstadoModeracion.APROBADA,
          publicacionId: BigInt(publicacionId),
          moderadorId: admin.id,
        },
      }),
    ]);

    return actualizada as unknown as Publicacion;
  }

  /**
   * Rechazar una publicación (moderación)
   */
  async rechazarPublicacion(
    publicacionId: string,
    moderadorId: string,
    motivo?: string,
    comentario?: string,
  ): Promise<Publicacion> {
    const existente = await this.prisma.publicacion.findUnique({
      where: { id: BigInt(publicacionId) },
    });
    if (!existente) {
      throw new NotFoundException('Publicación no encontrada');
    }

    let admin = await this.prisma.administrador.findUnique({
      where: { usuarioId: BigInt(moderadorId) },
    });
    if (!admin) {
      const usuario = await this.prisma.usuario.findFirst({
        where: { id: BigInt(moderadorId), activo: true },
      });
      if (
        !usuario ||
        (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'SUPER_ADMIN')
      ) {
        throw new ForbiddenException(
          'El usuario autenticado no es administrador',
        );
      }
      admin = await this.prisma.administrador.create({
        data: { usuarioId: BigInt(moderadorId) },
      });
    }

    const estadoAnterior = existente.estadoModeracion;

    const [actualizada] = await this.prisma.$transaction([
      this.prisma.publicacion.update({
        where: { id: BigInt(publicacionId) },
        data: {
          estadoModeracion: EstadoModeracion.RECHAZADA,
          fechaModeracion: new Date(),
          moderadoPor: String(moderadorId),
          comentarioModeracion: comentario ?? motivo ?? null,
        },
        include: {
          propietario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              calificacionPromedio: true,
              totalCalificaciones: true,
            },
          },
          imagenes: { select: { id: true, url: true, esPrincipal: true } },
          _count: { select: { reservas: true, calificaciones: true } },
        },
      }),
      this.prisma.moderaccionPublicacion.create({
        data: {
          accion: 'RECHAZAR',
          motivo: motivo ?? null,
          comentarios: comentario ?? null,
          estadoAnterior: estadoAnterior,
          estadoNuevo: EstadoModeracion.RECHAZADA,
          publicacionId: BigInt(publicacionId),
          moderadorId: admin.id,
        },
      }),
    ]);

    return actualizada as unknown as Publicacion;
  }

  /**
   * Obtener una publicación por ID
   * @param id ID de la publicación
   * @returns Publicación encontrada
   */
  async obtenerPublicacionPorId(id: string): Promise<any> {
    try {
      const publicacion = await this.prisma.publicacion.findUnique({
        where: { id: BigInt(id) },
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
            },
          },
          imagenes: {
            orderBy: { orden: 'asc' },
          },
          calificaciones: {
            include: {
              usuarioCalificador: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                },
              },
            },
            orderBy: { fechaCreacion: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              reservas: true,
              calificaciones: true,
            },
          },
        },
      });

      if (!publicacion) {
        throw new NotFoundException('Publicación no encontrada');
      }

      // Verificar que la publicación no esté eliminada
      if (publicacion.estado === EstadoPublicacion.ELIMINADA) {
        throw new NotFoundException('Publicación no encontrada');
      }

      // Incrementar contador de visualizaciones
      await this.prisma.publicacion.update({
        where: { id: BigInt(id) },
        data: { visualizaciones: { increment: 1 } },
      });

      // Convertir precios Decimal a números para el frontend
      const publicacionConPreciosNumericos = {
        ...publicacion,
        totalReservas:
          publicacion._count?.reservas ?? publicacion.totalReservas,
        totalCalificaciones:
          publicacion._count?.calificaciones ?? publicacion.totalCalificaciones,
        precioPorDia: Number(publicacion.precioPorDia),
        precioPorSemana: publicacion.precioPorSemana
          ? Number(publicacion.precioPorSemana)
          : null,
        precioPorMes: publicacion.precioPorMes
          ? Number(publicacion.precioPorMes)
          : null,
        deposito: publicacion.deposito ? Number(publicacion.deposito) : null,
      };

      return publicacionConPreciosNumericos;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener la publicación');
    }
  }

  /**
   * Actualizar una publicación
   * @param id ID de la publicación
   * @param usuarioId ID del usuario que actualiza
   * @param actualizarPublicacionDto Datos a actualizar
   * @returns Publicación actualizada
   */
  async actualizarPublicacion(
    id: string,
    usuarioId: string,
    actualizarPublicacionDto: ActualizarPublicacionDto,
  ): Promise<Publicacion> {
    try {
      // Verificar que la publicación existe y pertenece al usuario
      const publicacionExistente = await this.prisma.publicacion.findUnique({
        where: { id: BigInt(id) },
        select: { propietarioId: true, estado: true },
      });

      if (!publicacionExistente) {
        throw new NotFoundException('Publicación no encontrada');
      }

      if (publicacionExistente.propietarioId !== BigInt(usuarioId)) {
        throw new ForbiddenException(
          'No tienes permisos para actualizar esta publicación',
        );
      }

      // Validar precios si se están actualizando
      if (
        actualizarPublicacionDto.precioPorDia ||
        actualizarPublicacionDto.precioPorSemana ||
        actualizarPublicacionDto.precioPorMes
      ) {
        this.validarPrecios(actualizarPublicacionDto);
      }

      // Actualizar la publicación
      const publicacionActualizada = await this.prisma.publicacion.update({
        where: { id: BigInt(id) },
        data: {
          ...actualizarPublicacionDto,
          // Si se actualiza contenido importante, marcar para revisión
          ...(this.requiereModeracion(actualizarPublicacionDto) && {
            estadoModeracion: EstadoModeracion.PENDIENTE_REVISION,
          }),
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
            },
          },
          imagenes: true,
        },
      });

      return publicacionActualizada;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar la publicación');
    }
  }

  /**
   * Eliminar una publicación (soft delete)
   * @param id ID de la publicación
   * @param usuarioId ID del usuario que elimina
   */
  async eliminarPublicacion(id: string, usuarioId: string): Promise<void> {
    try {
      // Verificar que la publicación existe y pertenece al usuario
      const publicacion = await this.prisma.publicacion.findUnique({
        where: { id: BigInt(id) },
        select: {
          propietarioId: true,
          estado: true,
          _count: {
            select: {
              reservas: {
                where: {
                  estado: {
                    in: ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'],
                  },
                },
              },
            },
          },
        },
      });

      if (!publicacion) {
        throw new NotFoundException('Publicación no encontrada');
      }

      if (publicacion.propietarioId !== BigInt(usuarioId)) {
        throw new ForbiddenException(
          'No tienes permisos para eliminar esta publicación',
        );
      }

      // Verificar que no tenga reservas activas
      if (publicacion._count.reservas > 0) {
        throw new BadRequestException(
          'No se puede eliminar una publicación con reservas activas',
        );
      }

      // Soft delete - cambiar estado a ELIMINADA
      await this.prisma.publicacion.update({
        where: { id: BigInt(id) },
        data: {
          estado: EstadoPublicacion.ELIMINADA,
          disponible: false,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar la publicación');
    }
  }

  /**
   * Obtener publicaciones de un usuario específico
   * @param usuarioId ID del usuario
   * @param filtros Filtros adicionales
   * @returns Publicaciones del usuario
   */
  async obtenerPublicacionesUsuario(
    usuarioId: string,
    filtros: FiltrosPublicacionDto,
  ) {
    // Para "Mis publicaciones", no aplicamos filtros de moderación
    // El usuario debe ver todas sus publicaciones independientemente del estado
    const condiciones: any = {
      propietarioId: BigInt(usuarioId),
      estado: EstadoPublicacion.ACTIVA, // Solo publicaciones activas (no eliminadas)
      // No filtramos por estadoModeracion para que vea todas sus publicaciones
    };

    // Aplicar filtros adicionales (búsqueda, categoría, etc.) pero sin moderación
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
      condiciones['departamento'] = {
        contains: filtros.departamento,
        mode: 'insensitive',
      };
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
            },
          },
          _count: {
            select: {
              reservas: true,
              calificaciones: true,
            },
          },
          reservas: {
            select: {
              id: true,
              estado: true,
            },
          },
        },
        orderBy: { fechaCreacion: 'desc' },
      });

      // Convertir precios Decimal a números para el frontend y agregar estadísticas de reservas
      const publicacionesConPreciosNumericos = publicaciones.map(
        (publicacion) => {
          // Calcular estadísticas de reservas por estado
          const estadisticasReservas = {
            total: publicacion.reservas.length,
            pendientes: publicacion.reservas.filter(
              (r) => r.estado === EstadoReserva.PENDIENTE,
            ).length,
            // En el esquema actual no existe el estado APROBADA; usamos CONFIRMADA como equivalente
            aprobadas: publicacion.reservas.filter(
              (r) => r.estado === EstadoReserva.CONFIRMADA,
            ).length,
            confirmadas: publicacion.reservas.filter(
              (r) => r.estado === EstadoReserva.CONFIRMADA,
            ).length,
            // EN_CURSO no existe en el esquema actual
            activas: publicacion.reservas.filter(
              (r) => r.estado === EstadoReserva.CONFIRMADA,
            ).length,
            completadas: publicacion.reservas.filter(
              (r) => r.estado === EstadoReserva.COMPLETADA,
            ).length,
            rechazadas: publicacion.reservas.filter(
              (r) => r.estado === EstadoReserva.RECHAZADA,
            ).length,
            // Unificamos cancelaciones en el estado CANCELADA
            canceladas: publicacion.reservas.filter(
              (r) => r.estado === EstadoReserva.CANCELADA,
            ).length,
          };

          // Remover el array de reservas para no enviarlo al frontend (solo necesitamos las estadísticas)
          const { reservas: _reservas, ...publicacionSinReservas } =
            publicacion;

          return {
            ...publicacionSinReservas,
            precioPorDia: Number(publicacion.precioPorDia),
            precioPorSemana: publicacion.precioPorSemana
              ? Number(publicacion.precioPorSemana)
              : null,
            precioPorMes: publicacion.precioPorMes
              ? Number(publicacion.precioPorMes)
              : null,
            deposito: publicacion.deposito
              ? Number(publicacion.deposito)
              : null,
            estadisticasReservas,
          };
        },
      );

      return publicacionesConPreciosNumericos;
    } catch (_error) {
      throw new BadRequestException(
        'Error al obtener las publicaciones del usuario',
      );
    }
  }

  /**
   * Obtener reservas activas (rangos ocupados) de una publicación
   */
  async obtenerReservasActivasPorPublicacion(id: string) {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: {
          publicacionId: BigInt(id),
          estado: {
            in: [
              EstadoReserva.PENDIENTE,
              EstadoReserva.CONFIRMADA,
              EstadoReserva.EN_CURSO,
            ],
          },
        },
        select: { fechaInicio: true, fechaFin: true },
        orderBy: { fechaInicio: 'asc' },
      });
      return reservas;
    } catch (_error) {
      throw new BadRequestException('Error al obtener reservas activas');
    }
  }

  /**
   * Verificar disponibilidad de una publicación en un rango de fechas
   */
  async verificarDisponibilidadPublicacion(
    id: string,
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    try {
      if (
        !fechaInicio ||
        !fechaFin ||
        isNaN(fechaInicio.getTime()) ||
        isNaN(fechaFin.getTime())
      ) {
        throw new BadRequestException(
          'Las fechas proporcionadas no son válidas',
        );
      }

      // Normalizar fechas
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(0, 0, 0, 0);

      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);

      if (fechaInicio < ahora) {
        throw new BadRequestException(
          'El rango de fechas no puede comenzar en el pasado',
        );
      }

      if (fechaInicio > fechaFin) {
        throw new BadRequestException(
          'El rango de fechas es inválido: fechaInicio es posterior a fechaFin',
        );
      }

      // Contar reservas activas que se solapan con el rango solicitado
      const solapadas = await this.prisma.reserva.count({
        where: {
          publicacionId: BigInt(id),
          estado: {
            in: [
              EstadoReserva.PENDIENTE,
              EstadoReserva.CONFIRMADA,
              EstadoReserva.EN_CURSO,
            ],
          },
          NOT: {
            OR: [
              { fechaFin: { lt: fechaInicio } },
              { fechaInicio: { gt: fechaFin } },
            ],
          },
        },
      });

      return { disponible: solapadas === 0 };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al verificar disponibilidad');
    }
  }

  // ========================================================================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ========================================================================

  /**
   * Validar coherencia de precios
   */
  private validarPrecios(
    datos: CrearPublicacionDto | ActualizarPublicacionDto,
  ): void {
    const { precioPorDia, precioPorSemana, precioPorMes } = datos;

    if (precioPorDia && precioPorDia <= 0) {
      throw new BadRequestException('El precio por día debe ser mayor a 0');
    }

    if (
      precioPorSemana &&
      precioPorDia &&
      precioPorSemana >= precioPorDia * 7
    ) {
      throw new BadRequestException(
        'El precio por semana debe ser menor al precio diario multiplicado por 7',
      );
    }

    if (precioPorMes && precioPorDia && precioPorMes >= precioPorDia * 30) {
      throw new BadRequestException(
        'El precio por mes debe ser menor al precio diario multiplicado por 30',
      );
    }
  }

  /**
   * Construir condiciones de filtrado para Prisma
   */
  private construirCondicionesFiltrado(filtros: FiltrosPublicacionDto): any {
    const condiciones: any = {
      estado: EstadoPublicacion.ACTIVA,
    };

    // Control de estado de moderación:
    // - Si incluirTodosEstadosModeracion es true, no aplicamos filtro por estadoModeracion
    // - Si se especifica estadoModeracion, lo usamos tal cual
    // - En otros casos, por defecto mostramos solo APROBADAS (para vistas públicas)
    if (filtros?.incluirTodosEstadosModeracion) {
      // No establecer condiciones.estadoModeracion para traer todos los estados
    } else if (filtros?.estadoModeracion) {
      condiciones.estadoModeracion = filtros.estadoModeracion;
    } else {
      condiciones.estadoModeracion = EstadoModeracion.APROBADA;
    }

    if (filtros.busqueda) {
      // Extraer palabras clave y sus variaciones del texto de búsqueda
      const palabrasClave = extraerPalabrasClave(filtros.busqueda);

      if (palabrasClave.length > 0) {
        // Crear condiciones de búsqueda para cada campo usando todas las palabras clave
        const condicionesBusqueda = [];

        // Buscar en título
        condicionesBusqueda.push(
          ...crearCondicionesBusqueda('titulo', palabrasClave),
        );

        // Buscar en descripción
        condicionesBusqueda.push(
          ...crearCondicionesBusqueda('descripcion', palabrasClave),
        );

        // Buscar en marca
        condicionesBusqueda.push(
          ...crearCondicionesBusqueda('marca', palabrasClave),
        );

        // Buscar en modelo
        condicionesBusqueda.push(
          ...crearCondicionesBusqueda('modelo', palabrasClave),
        );

        // También mantener la búsqueda original como fallback
        condicionesBusqueda.push(
          { titulo: { contains: filtros.busqueda, mode: 'insensitive' } },
          { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
          { marca: { contains: filtros.busqueda, mode: 'insensitive' } },
          { modelo: { contains: filtros.busqueda, mode: 'insensitive' } },
        );

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
      condiciones.departamento = {
        contains: filtros.departamento,
        mode: 'insensitive',
      };
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

    // Disponibilidad por rango de fechas: excluir publicaciones con reservas que se solapen
    if (
      (filtros as any) &&
      (filtros as any).fechaInicio &&
      (filtros as any).fechaFin
    ) {
      const fechaInicio = (filtros as any).fechaInicio as Date;
      const fechaFin = (filtros as any).fechaFin as Date;

      // Asegurar que el rango es válido
      if (fechaInicio > fechaFin) {
        throw new BadRequestException(
          'El rango de fechas es inválido: fechaInicio es posterior a fechaFin',
        );
      }

      // Publicaciones sin reservas activas que se solapen con el rango solicitado
      condiciones.reservas = {
        none: {
          estado: {
            in: [
              EstadoReserva.PENDIENTE,
              EstadoReserva.CONFIRMADA,
              EstadoReserva.EN_CURSO,
            ],
          },
          NOT: {
            OR: [
              { fechaFin: { lt: fechaInicio } }, // Reserva termina estrictamente antes de que inicie el rango
              { fechaInicio: { gt: fechaFin } }, // Reserva inicia estrictamente después de que termine el rango
            ],
          },
        },
      };

      // Solo publicaciones marcadas como disponibles
      condiciones.disponible = true;
    }

    return condiciones;
  }

  /**
   * Construir ordenamiento para Prisma
   */
  private construirOrdenamiento(
    ordenarPor: string,
    direccionOrden: 'asc' | 'desc',
  ): any {
    const camposValidos = [
      'fechaCreacion',
      'fechaActualizacion',
      'precioPorDia',
      'calificacionPromedio',
      'visualizaciones',
      'totalReservas',
    ];

    if (!camposValidos.includes(ordenarPor)) {
      ordenarPor = 'fechaCreacion';
    }

    return { [ordenarPor]: direccionOrden };
  }

  /**
   * Determina si una actualización requiere revisión de moderación
   */
  private requiereModeracion(
    datosActualizacion: ActualizarPublicacionDto,
  ): boolean {
    const camposCriticos = [
      'titulo',
      'descripcion',
      'categoria',
      'precioPorDia',
    ] as const;
    return camposCriticos.some(
      (campo) =>
        datosActualizacion[campo as keyof ActualizarPublicacionDto] !==
        undefined,
    );
  }

  async listarImagenes(publicacionId: string): Promise<any[]> {
    const pub = await this.prisma.publicacion.findUnique({
      where: { id: BigInt(publicacionId) },
      select: { id: true },
    });
    if (!pub) throw new NotFoundException('Publicación no encontrada');
    return await this.prisma.imagenPublicacion.findMany({
      where: { publicacionId: BigInt(publicacionId) },
      orderBy: { orden: 'asc' },
    });
  }

  async guardarImagenes(
    publicacionId: string,
    usuarioId: string,
    images: {
      url: string;
      descripcion?: string;
      orden?: number;
      esPrincipal?: boolean;
    }[],
  ): Promise<any[]> {
    if (!Array.isArray(images) || images.length === 0)
      throw new BadRequestException('Sin imágenes');
    if (images.length > 5)
      throw new BadRequestException('Máximo 5 imágenes por publicación');

    const existente = await this.prisma.publicacion.findUnique({
      where: { id: BigInt(publicacionId) },
      select: { propietarioId: true },
    });
    if (!existente) throw new NotFoundException('Publicación no encontrada');
    if (existente.propietarioId !== BigInt(usuarioId))
      throw new ForbiddenException('No autorizado');

    const actuales = await this.prisma.imagenPublicacion.count({
      where: { publicacionId: BigInt(publicacionId) },
    });
    if (actuales + images.length > 5)
      throw new BadRequestException('Se excede el máximo de 5 imágenes');

    const principalSolicitado = images.find((i) => i.esPrincipal === true);

    const maxOrden = await this.prisma.imagenPublicacion.aggregate({
      where: { publicacionId: BigInt(publicacionId) },
      _max: { orden: true },
    });
    let baseOrden = (maxOrden._max.orden ?? -1) + 1;

    const data = images.map((img) => ({
      url: img.url,
      descripcion: img.descripcion ?? null,
      orden: img.orden ?? baseOrden++,
      esPrincipal: img.esPrincipal === true,
      publicacionId: BigInt(publicacionId),
    }));

    const created = await this.prisma.$transaction(async (tx) => {
      if (principalSolicitado) {
        await tx.imagenPublicacion.updateMany({
          where: { publicacionId: BigInt(publicacionId) },
          data: { esPrincipal: false },
        });
      }
      await tx.imagenPublicacion.createMany({ data });
      const nuevas = await tx.imagenPublicacion.findMany({
        where: { publicacionId: BigInt(publicacionId) },
        orderBy: { orden: 'asc' },
      });
      return nuevas;
    });

    return created;
  }

  async setImagenPrincipal(
    publicacionId: string,
    usuarioId: string,
    imagenId: string,
  ): Promise<void> {
    const existente = await this.prisma.publicacion.findUnique({
      where: { id: BigInt(publicacionId) },
      select: { propietarioId: true },
    });
    if (!existente) throw new NotFoundException('Publicación no encontrada');
    if (existente.propietarioId !== BigInt(usuarioId))
      throw new ForbiddenException('No autorizado');

    const imagen = await this.prisma.imagenPublicacion.findUnique({
      where: { id: BigInt(imagenId) },
    });
    if (!imagen || imagen.publicacionId !== BigInt(publicacionId))
      throw new NotFoundException('Imagen no encontrada');

    await this.prisma.$transaction([
      this.prisma.imagenPublicacion.updateMany({
        where: { publicacionId: BigInt(publicacionId) },
        data: { esPrincipal: false },
      }),
      this.prisma.imagenPublicacion.update({
        where: { id: BigInt(imagenId) },
        data: { esPrincipal: true },
      }),
    ]);
  }

  async eliminarImagen(
    publicacionId: string,
    usuarioId: string,
    imagenId: string,
  ): Promise<void> {
    const existente = await this.prisma.publicacion.findUnique({
      where: { id: BigInt(publicacionId) },
      select: { propietarioId: true },
    });
    if (!existente) throw new NotFoundException('Publicación no encontrada');
    if (existente.propietarioId !== BigInt(usuarioId))
      throw new ForbiddenException('No autorizado');

    const imagen = await this.prisma.imagenPublicacion.findUnique({
      where: { id: BigInt(imagenId) },
    });
    if (!imagen || imagen.publicacionId !== BigInt(publicacionId))
      throw new NotFoundException('Imagen no encontrada');

    await this.prisma.imagenPublicacion.delete({
      where: { id: BigInt(imagenId) },
    });
  }
}
