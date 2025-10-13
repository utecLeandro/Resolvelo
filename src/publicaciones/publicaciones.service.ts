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
import { Publicacion, EstadoPublicacion, EstadoModeracion } from '@prisma/client';

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
        this.prisma.publicacion.count({ where: condiciones })
      ]);

      return {
        publicaciones,
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
  async obtenerPublicacionPorId(id: string): Promise<Publicacion> {
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

      // Incrementar contador de visualizaciones
      await this.prisma.publicacion.update({
        where: { id },
        data: { visualizaciones: { increment: 1 } }
      });

      return publicacion;
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
   * Obtener publicaciones del usuario
   * @param usuarioId ID del usuario
   * @param filtros Filtros adicionales
   * @returns Publicaciones del usuario
   */
  async obtenerPublicacionesUsuario(usuarioId: string, filtros: FiltrosPublicacionDto) {
    const condiciones = {
      propietarioId: usuarioId,
      ...this.construirCondicionesFiltrado(filtros)
    };

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
          }
        },
        orderBy: { fechaCreacion: 'desc' }
      });

      return publicaciones;
    } catch (error) {
      throw new BadRequestException('Error al obtener las publicaciones del usuario');
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
  private construirCondicionesFiltrado(filtros: FiltrosPublicacionDto) {
    const condiciones: any = {
      estado: EstadoPublicacion.ACTIVA,
      estadoModeracion: EstadoModeracion.APROBADA,
    };

    if (filtros.busqueda) {
      condiciones.OR = [
        { titulo: { contains: filtros.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
        { marca: { contains: filtros.busqueda, mode: 'insensitive' } },
        { modelo: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
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

    return condiciones;
  }

  /**
   * Construir ordenamiento para Prisma
   */
  private construirOrdenamiento(ordenarPor: string, direccionOrden: 'asc' | 'desc') {
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