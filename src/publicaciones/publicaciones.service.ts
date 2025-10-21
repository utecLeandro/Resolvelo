/**
 * Servicio de Publicaciones
 * Maneja toda la lógica de negocio relacionada con las publicaciones de equipos musicales
 * Implementa operaciones CRUD y búsquedas avanzadas
 */

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from './dto/actualizar-publicacion.dto';
import { FiltrosPublicacionDto } from './dto/filtros-publicacion.dto';
import { Publicacion, EstadoPublicacion, EstadoModeracion, EstadoReserva } from '@prisma/client';
import { extraerPalabrasClave, crearCondicionesBusqueda } from './utils/text-utils';

@Injectable()
export class PublicacionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva publicación de equipo musical
   * @param usuarioId ID del usuario propietario
   * @param crearPublicacionDto Datos de la publicación
   * @returns Publicación creada
   */
  async crearPublicacion(usuarioId: string, crearPublicacionDto: CrearPublicacionDto): Promise<Publicacion> {
    try {
      // Verificar que el usuario existe y está activo
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId, activo: true }
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado o inactivo');
      }

      // Validar que los precios sean coherentes
      this.validarPrecios(crearPublicacionDto);

      // Crear la publicación
      const publicacion = await this.prisma.publicacion.create({
        data: {
          ...crearPublicacionDto,
          propietarioId: usuarioId,
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
            }
          },
          imagenes: true,
        }
      });

      return publicacion;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
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
    const { pagina = 1, limite = 10, ordenarPor = 'fechaCreacion', direccionOrden = 'desc' } = filtros;
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



      // Convertir precios Decimal a números para el frontend
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
    } catch (error) {
      throw new BadRequestException('Error al obtener las publicaciones');
    }
  }

  /**
   * Obtener una publicación por ID
   * @param id ID de la publicación
   * @returns Publicación encontrada
   */
  async obtenerPublicacionPorId(id: string): Promise<any> {
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
            orderBy: { esPrincipal: 'desc' }
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
        throw new NotFoundException('Publicación no encontrada');
      }

      // Verificar que la publicación no esté eliminada
      if (publicacion.estado === EstadoPublicacion.ELIMINADA) {
        throw new NotFoundException('Publicación no encontrada');
      }

      // Incrementar contador de visualizaciones
      await this.prisma.publicacion.update({
        where: { id },
        data: { visualizaciones: { increment: 1 } }
      });

      // Convertir precios Decimal a números para el frontend
      const publicacionConPreciosNumericos = {
        ...publicacion,
        precioPorDia: Number(publicacion.precioPorDia),
        precioPorSemana: publicacion.precioPorSemana ? Number(publicacion.precioPorSemana) : null,
        precioPorMes: publicacion.precioPorMes ? Number(publicacion.precioPorMes) : null,
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
    actualizarPublicacionDto: ActualizarPublicacionDto
  ): Promise<Publicacion> {
    try {
      // Verificar que la publicación existe y pertenece al usuario
      const publicacionExistente = await this.prisma.publicacion.findUnique({
        where: { id },
        select: { propietarioId: true, estado: true }
      });

      if (!publicacionExistente) {
        throw new NotFoundException('Publicación no encontrada');
      }

      if (publicacionExistente.propietarioId !== usuarioId) {
        throw new ForbiddenException('No tienes permisos para actualizar esta publicación');
      }

      // Validar precios si se están actualizando
      if (actualizarPublicacionDto.precioPorDia || 
          actualizarPublicacionDto.precioPorSemana || 
          actualizarPublicacionDto.precioPorMes) {
        this.validarPrecios(actualizarPublicacionDto);
      }

      // Actualizar la publicación
      const publicacionActualizada = await this.prisma.publicacion.update({
        where: { id },
        data: {
          ...actualizarPublicacionDto,
          // Si se actualiza contenido importante, marcar para revisión
          ...(this.requiereModeracion(actualizarPublicacionDto) && {
            estadoModeracion: EstadoModeracion.PENDIENTE_REVISION
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
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
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
        throw new NotFoundException('Publicación no encontrada');
      }

      if (publicacion.propietarioId !== usuarioId) {
        throw new ForbiddenException('No tienes permisos para eliminar esta publicación');
      }

      // Verificar que no tenga reservas activas
      if (publicacion._count.reservas > 0) {
        throw new BadRequestException('No se puede eliminar una publicación con reservas activas');
      }

      // Soft delete - cambiar estado a ELIMINADA
      await this.prisma.publicacion.update({
        where: { id },
        data: { 
          estado: EstadoPublicacion.ELIMINADA,
          disponible: false
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
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
  async obtenerPublicacionesUsuario(usuarioId: string, filtros: FiltrosPublicacionDto) {
    // Para "Mis publicaciones", no aplicamos filtros de moderación
    // El usuario debe ver todas sus publicaciones independientemente del estado
    const condiciones: any = {
      propietarioId: usuarioId,
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

      // Convertir precios Decimal a números para el frontend y agregar estadísticas de reservas
      const publicacionesConPreciosNumericos = publicaciones.map(publicacion => {
        // Calcular estadísticas de reservas por estado
        const estadisticasReservas = {
          total: publicacion.reservas.length,
          pendientes: publicacion.reservas.filter(r => r.estado === EstadoReserva.PENDIENTE).length,
          aprobadas: publicacion.reservas.filter(r => r.estado === EstadoReserva.APROBADA).length,
          confirmadas: publicacion.reservas.filter(r => r.estado === EstadoReserva.CONFIRMADA).length,
          activas: publicacion.reservas.filter(r => r.estado === EstadoReserva.EN_CURSO).length,
          completadas: publicacion.reservas.filter(r => r.estado === EstadoReserva.COMPLETADA).length,
          rechazadas: publicacion.reservas.filter(r => r.estado === EstadoReserva.RECHAZADA).length,
          canceladas: publicacion.reservas.filter(r => r.estado === EstadoReserva.CANCELADA_USUARIO).length + publicacion.reservas.filter(r => r.estado === EstadoReserva.CANCELADA_PROPIETARIO).length,
        };

        // Remover el array de reservas para no enviarlo al frontend (solo necesitamos las estadísticas)
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
    } catch (error) {
      throw new BadRequestException('Error al obtener las publicaciones del usuario');
    }
  }

  /**
   * Obtener reservas activas (rangos ocupados) de una publicación
   */
  async obtenerReservasActivasPorPublicacion(id: string) {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: {
          publicacionId: id,
          estado: { in: [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA, EstadoReserva.EN_CURSO] },
        },
        select: { fechaInicio: true, fechaFin: true },
        orderBy: { fechaInicio: 'asc' },
      });
      return reservas;
    } catch (error) {
      throw new BadRequestException('Error al obtener reservas activas');
    }
  }

  /**
   * Verificar disponibilidad de una publicación en un rango de fechas
   */
  async verificarDisponibilidadPublicacion(id: string, fechaInicio: Date, fechaFin: Date) {
    try {
      if (!fechaInicio || !fechaFin || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new BadRequestException('Las fechas proporcionadas no son válidas');
      }
      if (fechaInicio > fechaFin) {
        throw new BadRequestException('El rango de fechas es inválido: fechaInicio es posterior a fechaFin');
      }

      // Contar reservas activas que se solapan con el rango solicitado
      const solapadas = await this.prisma.reserva.count({
        where: {
          publicacionId: id,
          estado: { in: [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA, EstadoReserva.EN_CURSO] },
          NOT: {
            OR: [
              { fechaFin: { lte: fechaInicio } },
              { fechaInicio: { gte: fechaFin } },
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
  private validarPrecios(datos: CrearPublicacionDto | ActualizarPublicacionDto): void {
    const { precioPorDia, precioPorSemana, precioPorMes } = datos;

    if (precioPorDia && precioPorDia <= 0) {
      throw new BadRequestException('El precio por día debe ser mayor a 0');
    }

    if (precioPorSemana && precioPorDia && precioPorSemana >= precioPorDia * 7) {
      throw new BadRequestException('El precio por semana debe ser menor al precio diario multiplicado por 7');
    }

    if (precioPorMes && precioPorDia && precioPorMes >= precioPorDia * 30) {
      throw new BadRequestException('El precio por mes debe ser menor al precio diario multiplicado por 30');
    }
  }

  /**
   * Construir condiciones de filtrado para Prisma
   */
  private construirCondicionesFiltrado(filtros: FiltrosPublicacionDto): any {
    const condiciones: any = {
      estado: EstadoPublicacion.ACTIVA,
      estadoModeracion: EstadoModeracion.APROBADA,
    };

    if (filtros.busqueda) {
      // Extraer palabras clave y sus variaciones del texto de búsqueda
      const palabrasClave = extraerPalabrasClave(filtros.busqueda);
      
      if (palabrasClave.length > 0) {
        // Crear condiciones de búsqueda para cada campo usando todas las palabras clave
        const condicionesBusqueda = [];
        
        // Buscar en título
        condicionesBusqueda.push(...crearCondicionesBusqueda('titulo', palabrasClave));
        
        // Buscar en descripción
        condicionesBusqueda.push(...crearCondicionesBusqueda('descripcion', palabrasClave));
        
        // Buscar en marca
        condicionesBusqueda.push(...crearCondicionesBusqueda('marca', palabrasClave));
        
        // Buscar en modelo
        condicionesBusqueda.push(...crearCondicionesBusqueda('modelo', palabrasClave));
        
        // También mantener la búsqueda original como fallback
        condicionesBusqueda.push(
          { titulo: { contains: filtros.busqueda, mode: 'insensitive' } },
          { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
          { marca: { contains: filtros.busqueda, mode: 'insensitive' } },
          { modelo: { contains: filtros.busqueda, mode: 'insensitive' } }
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

    // Disponibilidad por rango de fechas: excluir publicaciones con reservas que se solapen
    if (filtros as any && (filtros as any).fechaInicio && (filtros as any).fechaFin) {
      const fechaInicio = (filtros as any).fechaInicio as Date;
      const fechaFin = (filtros as any).fechaFin as Date;

      // Asegurar que el rango es válido
      if (fechaInicio > fechaFin) {
        throw new BadRequestException('El rango de fechas es inválido: fechaInicio es posterior a fechaFin');
      }

      // Publicaciones sin reservas activas que se solapen con el rango solicitado
      condiciones.reservas = {
        none: {
          estado: { in: [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA, EstadoReserva.EN_CURSO] },
          NOT: {
            OR: [
              { fechaFin: { lte: fechaInicio } }, // Reserva termina antes o el mismo día que inicia el rango
              { fechaInicio: { gte: fechaFin } }, // Reserva inicia después o el mismo día que termina el rango
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
  private construirOrdenamiento(ordenarPor: string, direccionOrden: 'asc' | 'desc'): any {
    const camposValidos = [
      'fechaCreacion', 'fechaActualizacion', 'precioPorDia', 
      'calificacionPromedio', 'visualizaciones', 'totalReservas'
    ];

    if (!camposValidos.includes(ordenarPor)) {
      ordenarPor = 'fechaCreacion';
    }

    return { [ordenarPor]: direccionOrden };
  }

  /**
   * Determina si una actualización requiere revisión de moderación
   */
  private requiereModeracion(datosActualizacion: ActualizarPublicacionDto): boolean {
    const camposCriticos = ['titulo', 'descripcion', 'categoria', 'precioPorDia'] as const;
    return camposCriticos.some(campo => datosActualizacion[campo as keyof ActualizarPublicacionDto] !== undefined);
  }
}