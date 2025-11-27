import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CrearCalificacionDto } from './dto/crear-calificacion.dto'

@Injectable()
export class CalificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(usuarioId: string, dto: CrearCalificacionDto) {
    const reserva = await this.prisma.reserva.findUnique({ where: { id: dto.reservaId } })
    if (!reserva) throw new NotFoundException('Reserva no encontrada')
    if (reserva.usuarioId !== usuarioId) throw new ForbiddenException('No autorizado para calificar esta reserva')
    if (reserva.estado !== 'COMPLETADA') throw new BadRequestException('Solo se puede calificar reservas completadas')
    const yaExiste = await this.prisma.calificacion.findFirst({ where: { reservaId: dto.reservaId, usuarioCalificadorId: usuarioId } })
    if (yaExiste) throw new BadRequestException('Ya has calificado esta reserva')

    try {
      const calificacion = await this.prisma.calificacion.create({
        data: {
          reservaId: dto.reservaId,
          publicacionId: reserva.publicacionId,
          usuarioCalificadorId: usuarioId,
          usuarioCalificadoId: reserva.propietarioId,
          puntuacion: dto.puntuacion,
          comentario: dto.comentario ?? null,
        },
        include: {
          usuarioCalificador: { select: { id: true, nombre: true, apellido: true } },
        },
      })

      const aggPub = await this.prisma.calificacion.aggregate({
        where: { publicacionId: reserva.publicacionId },
        _avg: { puntuacion: true },
        _count: { _all: true },
      })
      await this.prisma.publicacion.update({
        where: { id: reserva.publicacionId },
        data: {
          calificacionPromedio: aggPub._avg.puntuacion ?? null,
          totalCalificaciones: aggPub._count._all ?? 0,
        },
      })

      const aggUser = await this.prisma.calificacion.aggregate({
        where: { usuarioCalificadoId: reserva.propietarioId },
        _avg: { puntuacion: true },
        _count: { _all: true },
      })
      await this.prisma.usuario.update({
        where: { id: reserva.propietarioId },
        data: {
          calificacionPromedio: aggUser._avg.puntuacion ?? null,
          totalCalificaciones: aggUser._count._all ?? 0,
        },
      })

      return { success: true, data: calificacion }
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error
      }
      throw new BadRequestException(error?.message || 'Error al crear la calificación')
    }
  }

  async listarPorPublicacion(publicacionId: string, take = 10, skip = 0) {
    const calificaciones = await this.prisma.calificacion.findMany({
      where: { publicacionId },
      include: {
        usuarioCalificador: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
      take,
      skip,
    })
    return { success: true, data: calificaciones }
  }
}
