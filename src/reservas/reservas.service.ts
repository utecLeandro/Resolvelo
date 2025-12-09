import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { emailTemplates } from '../email/email.templates';
import { EstadoReserva } from '@prisma/client';

@Injectable()
export class ReservasService {
  private readonly logger = new Logger(ReservasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async crearReserva(crearReservaDto: CrearReservaDto) {
    const {
      usuarioId,
      publicacionId,
      propietarioId,
      fechaInicio,
      fechaFin,
      precioTotal,
      comisionPlataforma,
      tipoEntrega,
      direccionEntrega,
      telefonoContacto,
      notasUsuario,
    } = crearReservaDto;

    // Verificar que la publicación existe
    const publicacion = await this.prisma.publicacion.findUnique({
      where: { id: BigInt(publicacionId) },
      include: { propietario: true },
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(usuarioId) },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el propietario existe
    const propietario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(propietarioId) },
    });

    if (!propietario) {
      throw new NotFoundException('Propietario no encontrado');
    }

    // Validar que el propietario de la publicación sea el mismo que el indicado
    if (publicacion.propietarioId !== BigInt(propietarioId)) {
      throw new BadRequestException(
        'El propietario especificado no coincide con el propietario de la publicación',
      );
    }

    // Validar fechas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const ahora = new Date();

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new BadRequestException('Las fechas proporcionadas no son válidas');
    }

    if (inicio <= ahora) {
      throw new BadRequestException('La fecha de inicio debe ser en el futuro');
    }

    if (fin < inicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior o igual a la fecha de inicio',
      );
    }

    // Verificar solapamiento de fechas (reservas activas)
    const reservasConflictivas = await this.prisma.reserva.findMany({
      where: {
        publicacionId: BigInt(publicacionId),
        estado: {
          in: [
            EstadoReserva.PENDIENTE,
            EstadoReserva.CONFIRMADA,
            EstadoReserva.EN_CURSO,
          ],
        },
        OR: [
          {
            fechaInicio: { lte: fin },
            fechaFin: { gte: inicio },
          },
        ],
      },
    });

    if (reservasConflictivas.length > 0) {
      throw new BadRequestException(
        'Ya existe una reserva para las fechas seleccionadas',
      );
    }

    // Crear la reserva
    const reserva = await this.prisma.reserva.create({
      data: {
        fechaInicio: inicio,
        fechaFin: fin,
        precioTotal: precioTotal,
        comisionPlataforma: comisionPlataforma,
        tipoEntrega: tipoEntrega,
        direccionEntrega: direccionEntrega,
        telefonoContacto: telefonoContacto,
        notasUsuario: notasUsuario,
        usuario: { connect: { id: BigInt(usuarioId) } },
        publicacion: { connect: { id: BigInt(publicacionId) } },
        propietario: { connect: { id: BigInt(propietarioId) } },
        estado: EstadoReserva.PENDIENTE,
      },
      include: {
        usuario: true,
        publicacion: true,
        propietario: true,
      },
    });

    // Enviar correo al propietario
    try {
      const frontendUrl = 'https://develop.d2jhmkfagiypdq.amplifyapp.com';
      const linkGestion = `${frontendUrl}/reservas-recibidas`;
      await this.emailService.sendMail(
        reserva.propietario.email,
        `Nueva solicitud de reserva: ${reserva.publicacion.titulo}`,
        emailTemplates.reservaCreadaPropietario(
          reserva.propietario.nombre,
          reserva.usuario.nombre,
          reserva.publicacion.titulo,
          reserva.fechaInicio.toLocaleDateString(),
          reserva.fechaFin.toLocaleDateString(),
          linkGestion,
        ),
      );

      // Enviar correo de confirmación al arrendatario
      const linkDetalle = `${frontendUrl}/mis-reservas`;
      await this.emailService.sendMail(
        reserva.usuario.email,
        `Solicitud enviada: ${reserva.publicacion.titulo}`,
        emailTemplates.reservaCreadaArrendatario(
          reserva.usuario.nombre,
          reserva.publicacion.titulo,
          reserva.fechaInicio.toLocaleDateString(),
          reserva.fechaFin.toLocaleDateString(),
          linkDetalle,
        ),
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar correos de nueva reserva (ID: ${reserva.id})`,
        error instanceof Error ? error.stack : error,
      );
    }

    return {
      success: true,
      data: reserva,
      message: 'Reserva creada exitosamente',
    };
  }

  async obtenerReservaPorId(id: string) {
    try {
      const reserva = await this.prisma.reserva.findUnique({
        where: { id: BigInt(id) },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              avatarUrl: true,
            },
          },
          propietario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              avatarUrl: true,
            },
          },
          publicacion: {
            include: {
              imagenes: true,
            },
          },
          transacciones: true,
        },
      });

      if (!reserva) {
        return { success: false, message: 'Reserva no encontrada' };
      }

      return { success: true, data: reserva };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener reserva: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async obtenerSolicitudesPendientes(propietarioId: string | number | bigint) {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: {
          propietarioId: BigInt(propietarioId),
          estado: EstadoReserva.PENDIENTE,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              avatarUrl: true,
            },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              precioPorDia: true,
              imagenes: true,
            },
          },
        },
        orderBy: { fechaCreacion: 'desc' },
      });

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener solicitudes pendientes: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async obtenerTodasLasSolicitudes(propietarioId: string | number | bigint) {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: {
          propietarioId: BigInt(propietarioId),
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              avatarUrl: true,
            },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              precioPorDia: true,
              imagenes: true,
            },
          },
        },
        orderBy: { fechaCreacion: 'desc' },
      });

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener todas las solicitudes: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async obtenerReservasArrendatario(arrendatarioId: string | number | bigint) {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: {
          usuarioId: BigInt(arrendatarioId),
        },
        include: {
          publicacion: {
            include: {
              propietario: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  email: true,
                  telefono: true,
                },
              },
              imagenes: true,
            },
          },
          transacciones: true,
        },
        orderBy: { fechaCreacion: 'desc' },
      });

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener reservas del arrendatario: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async confirmarReserva(id: string) {
    return this.actualizarReserva(id, { estado: EstadoReserva.CONFIRMADA });
  }

  async rechazarReserva(id: string) {
    return this.actualizarReserva(id, { estado: EstadoReserva.RECHAZADA });
  }

  async activarReserva(id: string) {
    // En el schema actual no existe EN_CURSO, así que usamos CONFIRMADA o vemos si se actualizó el schema.
    // El enum en schema.prisma muestra: PENDIENTE, CONFIRMADA, EN_CURSO, COMPLETADA, CANCELADA, RECHAZADA.
    // Así que SÍ existe EN_CURSO.
    return this.actualizarReserva(id, { estado: EstadoReserva.EN_CURSO });
  }

  async cancelarReserva(id: string) {
    return this.actualizarReserva(id, { estado: EstadoReserva.CANCELADA });
  }

  async finalizarReserva(id: string) {
    return this.actualizarReserva(id, { estado: EstadoReserva.COMPLETADA });
  }

  async obtenerReservasActivasPropietario(
    propietarioId: string | number | bigint,
  ) {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: {
          propietarioId: BigInt(propietarioId),
          estado: {
            in: [EstadoReserva.CONFIRMADA, EstadoReserva.EN_CURSO],
          },
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              avatarUrl: true,
            },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              precioPorDia: true,
              imagenes: true,
            },
          },
          transacciones: true,
        },
        orderBy: { fechaInicio: 'asc' },
      });

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener reservas activas: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async obtenerHistorialReservasPropietario(
    propietarioId: string | number | bigint,
  ) {
    try {
      const reservas = await this.prisma.reserva.findMany({
        where: {
          propietarioId: BigInt(propietarioId),
          estado: {
            in: [
              EstadoReserva.COMPLETADA,
              EstadoReserva.CANCELADA,
              EstadoReserva.RECHAZADA,
            ],
          },
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              avatarUrl: true,
            },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              precioPorDia: true,
              imagenes: true,
            },
          },
        },
        orderBy: { fechaFin: 'desc' },
      });

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener historial: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async actualizarReserva(
    id: string,
    data: {
      estado?: EstadoReserva;
      fechaInicio?: Date;
      fechaFin?: Date;
      precioTotal?: number;
    },
  ) {
    try {
      const reservaExistente = await this.prisma.reserva.findUnique({
        where: { id: BigInt(id) },
        select: { estado: true, usuario: true, publicacion: true },
      });

      if (!reservaExistente) {
        throw new NotFoundException('Reserva no encontrada');
      }

      const anterior = reservaExistente.estado;
      const actual = data.estado;

      const reserva = await this.prisma.reserva.update({
        where: { id: BigInt(id) },
        data: data,
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
        },
      });

      // Enviar notificaciones por cambio de estado
      if (actual && anterior !== actual) {
        this.logger.log(
          `📧 Intentando enviar notificación. Cambio de estado: ${anterior} -> ${actual} (Reserva: ${id})`,
        );
        try {
          const frontendUrl = 'https://develop.d2jhmkfagiypdq.amplifyapp.com';
          const linkDetalle = `${frontendUrl}/mis-reservas`;
          await this.emailService.sendMail(
            reserva.usuario.email,
            `Actualización de reserva: ${reserva.publicacion.titulo}`,
            emailTemplates.estadoReservaArrendatario(
              reserva.usuario.nombre,
              actual,
              reserva.publicacion.titulo,
              linkDetalle,
            ),
          );
          this.logger.log(
            `Notificación de cambio de estado enviada para reserva ${id} a ${reserva.usuario.email}`,
          );
        } catch (error) {
          this.logger.error(
            `Error al enviar notificación de cambio de estado (Reserva: ${id})`,
            error instanceof Error ? error.stack : error,
          );
        }
      } else {
        this.logger.log(
          `ℹ️ No se envía notificación. Actual: ${actual}, Anterior: ${anterior}, Igual: ${actual === anterior} (Reserva: ${id})`,
        );
      }

      return {
        success: true,
        data: reserva,
        message: 'Reserva actualizada exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar la reserva: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
