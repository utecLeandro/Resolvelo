import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearReservaDto } from "./dto/crear-reserva.dto";

export interface UpdateReservaDto {
  estado?:
    | "PENDIENTE"
    | "CONFIRMADA"
    | "EN_CURSO"
    | "CANCELADA"
    | "COMPLETADA"
    | "RECHAZADA";
  fechaInicio?: string;
  fechaFin?: string;
  precioTotal?: number;
  tipoEntrega?: string;
  direccionEntrega?: string;
  telefonoContacto?: string;
  notasUsuario?: string;
  notasPropietario?: string;
}

@Injectable()
export class ReservasService {
  constructor(private prisma: PrismaService) {}

  async obtenerSolicitudesPendientes(propietarioId: string) {
    try {
      console.log(
        "🔍 [SERVICE] obtenerSolicitudesPendientes - Buscando solicitudes para propietarioId:",
        propietarioId,
      );
      const solicitudes = await this.prisma.reserva.findMany({
        where: {
          propietarioId: propietarioId,
          estado: "PENDIENTE",
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
              fechaCreacion: true,
            },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              categoria: true,
              precioPorDia: true,
              marca: true,
              modelo: true,
            },
          },
        },
        orderBy: {
          fechaCreacion: "desc",
        },
      });

      console.log("📋 [SERVICE] obtenerSolicitudesPendientes - Resultados:", {
        propietarioId,
        cantidadEncontradas: solicitudes.length,
        solicitudes: solicitudes.map((s) => ({
          id: s.id,
          usuarioId: s.usuarioId,
          propietarioId: s.propietarioId,
          publicacionTitulo: s.publicacion?.titulo,
        })),
      });

      return {
        success: true,
        message: "Solicitudes pendientes obtenidas exitosamente",
        data: solicitudes,
        total: solicitudes.length,
      };
    } catch (error) {
      console.error("Error al obtener solicitudes pendientes:", error);
      throw new HttpException(
        "Error interno del servidor al obtener solicitudes pendientes",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async obtenerTodasLasSolicitudes(propietarioId: string) {
    try {
      console.log(
        "🔍 [SERVICE] obtenerTodasLasSolicitudes - Buscando todas las solicitudes para propietarioId:",
        propietarioId,
      );
      const solicitudes = await this.prisma.reserva.findMany({
        where: {
          propietarioId: propietarioId,
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
              fechaCreacion: true,
            },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
              categoria: true,
              precioPorDia: true,
              marca: true,
              modelo: true,
            },
          },
        },
        orderBy: {
          fechaCreacion: "desc",
        },
      });

      console.log("📋 [SERVICE] obtenerTodasLasSolicitudes - Resultados:", {
        propietarioId,
        cantidadEncontradas: solicitudes.length,
        solicitudes: solicitudes.map((s) => ({
          id: s.id,
          estado: s.estado,
          usuarioId: s.usuarioId,
          propietarioId: s.propietarioId,
          publicacionTitulo: s.publicacion?.titulo,
        })),
      });

      return {
        success: true,
        message: "Todas las solicitudes obtenidas exitosamente",
        data: solicitudes,
        total: solicitudes.length,
      };
    } catch (error) {
      console.error("Error al obtener todas las solicitudes:", error);
      throw new HttpException(
        "Error interno del servidor al obtener todas las solicitudes",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async crearReserva(createReservaDto: CrearReservaDto) {
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
        },
      });

      if (!publicacion) {
        throw new NotFoundException("La publicación especificada no existe");
      }

      if (publicacion.estado !== "ACTIVA") {
        throw new BadRequestException(
          "La publicación no está disponible para reservas",
        );
      }

      // 2. Validar que el usuario existe
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: createReservaDto.usuarioId },
        select: { id: true, nombre: true, email: true },
      });

      if (!usuario) {
        throw new NotFoundException("El usuario especificado no existe");
      }

      // 3. Validar que el propietario existe y coincide con la publicación
      if (publicacion.propietarioId !== createReservaDto.propietarioId) {
        throw new BadRequestException(
          "El propietario especificado no coincide con el propietario de la publicación",
        );
      }

      // 4. Validar fechas adicionales (las validaciones básicas ya están en el DTO)
      const fechaInicio = new Date(createReservaDto.fechaInicio);
      const fechaFin = new Date(createReservaDto.fechaFin);
      const ahora = new Date();
      const hoyInicio = new Date(ahora);
      hoyInicio.setHours(0, 0, 0, 0);
      const inicioReservaDia = new Date(fechaInicio);
      inicioReservaDia.setHours(0, 0, 0, 0);

      // Verificar que las fechas sean válidas
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        throw new BadRequestException(
          "Las fechas proporcionadas no son válidas",
        );
      }

      if (inicioReservaDia < hoyInicio) {
        throw new BadRequestException(
          "La fecha de inicio debe ser hoy o futura",
        );
      }

      // Verificar que la fecha de fin no sea anterior a la fecha de inicio (permitir mismo día)
      if (fechaFin < fechaInicio) {
        throw new BadRequestException(
          "La fecha de fin no puede ser anterior a la fecha de inicio",
        );
      }

      // 5. Verificar que no existan reservas conflictivas (solapamiento de fechas)
      const reservasConflictivas = await this.prisma.reserva.findMany({
        where: {
          publicacionId: createReservaDto.publicacionId,
          estado: {
            in: ["PENDIENTE", "CONFIRMADA", "EN_CURSO"],
          },
          OR: [
            {
              // La nueva reserva empieza durante una reserva existente
              AND: [
                { fechaInicio: { lte: fechaInicio } },
                { fechaFin: { gt: fechaInicio } },
              ],
            },
            {
              // La nueva reserva termina durante una reserva existente
              AND: [
                { fechaInicio: { lt: fechaFin } },
                { fechaFin: { gte: fechaFin } },
              ],
            },
            {
              // La nueva reserva engloba completamente una reserva existente
              AND: [
                { fechaInicio: { gte: fechaInicio } },
                { fechaFin: { lte: fechaFin } },
              ],
            },
          ],
        },
      });

      if (reservasConflictivas.length > 0) {
        throw new BadRequestException(
          "Ya existe una reserva para estas fechas. Por favor, selecciona otras fechas.",
        );
      }

      // 6. Verificar que el usuario no esté intentando reservar su propia publicación
      if (createReservaDto.usuarioId === createReservaDto.propietarioId) {
        throw new BadRequestException(
          "No puedes reservar tu propia publicación",
        );
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
          estado: "PENDIENTE",
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
        message: "Reserva creada exitosamente",
      };
    } catch (error: any) {
      // Si es una excepción conocida, la relanzamos
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Para otros errores, devolvemos una respuesta genérica
      throw new BadRequestException(
        `Error al crear la reserva: ${error.message}`,
      );
    }
  }

  async obtenerReservas(usuarioId?: string) {
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
        orderBy: {
          fechaCreacion: "desc",
        },
      });

      console.log("📋 [SERVICE] obtenerReservasArrendatario - Resultados:", {
        usuarioId,
        cantidadEncontradas: reservas.length,
        reservas: reservas.map((r) => ({
          id: r.id,
          usuarioId: r.usuarioId,
          propietarioId: r.propietarioId,
          publicacionTitulo: r.publicacion.titulo,
        })),
      });

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: "Error al obtener las reservas",
      };
    }
  }

  async obtenerReservaPorId(id: string) {
    try {
      const reserva = await this.prisma.reserva.findUnique({
        where: { id },
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
              descripcion: true,
            },
          },
        },
      });

      if (!reserva) {
        throw new NotFoundException("Reserva no encontrada");
      }

      return {
        success: true,
        data: reserva,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Error al obtener la reserva: ${error.message}`,
      );
    }
  }

  async obtenerReservasArrendatario(usuarioId: string) {
    try {
      console.log(
        "🔍 [SERVICE] obtenerReservasArrendatario - Buscando reservas para usuarioId:",
        usuarioId,
      );
      const reservas = await this.prisma.reserva.findMany({
        where: {
          usuarioId: usuarioId,
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
                  telefono: true,
                },
              },
            },
          },
          transacciones: {
            select: {
              id: true,
              monto: true,
              estado: true,
              fechaCreacion: true,
              metodoPago: true,
            },
            orderBy: {
              fechaCreacion: "desc",
            },
          },
        },
        orderBy: {
          fechaCreacion: "desc",
        },
      });

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Error al obtener las reservas del arrendatario: ${error.message}`,
      );
    }
  }

  async actualizarReserva(id: string, data: UpdateReservaDto) {
    try {
      // Verificar que la reserva existe
      const reservaExistente = await this.prisma.reserva.findUnique({
        where: { id },
      });

      if (!reservaExistente) {
        throw new NotFoundException("Reserva no encontrada");
      }

      const updateData: any = {};

      if (data.estado) updateData.estado = data.estado;
      if (data.fechaInicio) updateData.fechaInicio = new Date(data.fechaInicio);
      if (data.fechaFin) updateData.fechaFin = new Date(data.fechaFin);
      if (data.precioTotal) updateData.precioTotal = data.precioTotal;

      const reserva = await this.prisma.reserva.update({
        where: { id },
        data: updateData,
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

      return {
        success: true,
        data: reserva,
        message: "Reserva actualizada exitosamente",
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Error al actualizar la reserva: ${error.message}`,
      );
    }
  }

  async cancelarReserva(id: string) {
    return this.actualizarReserva(id, { estado: "CANCELADA" });
  }

  async confirmarReserva(id: string) {
    return this.actualizarReserva(id, { estado: "CONFIRMADA" });
  }

  async aceptarReserva(id: string) {
    return this.actualizarReserva(id, { estado: "CONFIRMADA" });
  }

  async rechazarReserva(id: string) {
    return this.actualizarReserva(id, { estado: "RECHAZADA" });
  }

  async activarReserva(id: string) {
    // Activar la reserva marcándola como EN_CURSO, alineado con el flujo de pago confirmado
    // y los endpoints de Mercado Pago que establecen EN_CURSO al aprobarse.
    return this.actualizarReserva(id, { estado: "EN_CURSO" });
  }

  /**
   * Obtener reservas activas del propietario (CONFIRMADA, EN_CURSO)
   */
  async obtenerReservasActivasPropietario(propietarioId: string) {
    try {
      console.log(
        "🔍 [SERVICE] obtenerReservasActivasPropietario - Buscando reservas para propietarioId:",
        propietarioId,
      );

      const reservas = await this.prisma.reserva.findMany({
        where: {
          propietarioId: propietarioId,
          estado: "EN_CURSO",
          transacciones: {
            some: {
              tipo: "PAGO_RESERVA",
              estado: "COMPLETADA",
            },
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
            },
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
              imagenes: true,
            },
          },
          transacciones: {
            select: {
              id: true,
              monto: true,
              estado: true,
              fechaCreacion: true,
              metodoPago: true,
            },
            orderBy: {
              fechaCreacion: "desc",
            },
          },
        },
        orderBy: {
          fechaInicio: "asc",
        },
      });

      console.log(
        "📋 [SERVICE] obtenerReservasActivasPropietario - Resultados:",
        {
          propietarioId,
          cantidadEncontradas: reservas.length,
          reservas: reservas.map((r) => ({
            id: r.id,
            estado: r.estado,
            fechaInicio: r.fechaInicio,
            fechaFin: r.fechaFin,
            publicacionTitulo: r.publicacion?.titulo,
          })),
        },
      );

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error: any) {
      console.error(
        "❌ [SERVICE] Error en obtenerReservasActivasPropietario:",
        error,
      );
      throw new BadRequestException(
        `Error al obtener las reservas activas del propietario: ${error.message}`,
      );
    }
  }

  /**
   * Obtener historial de reservas del propietario (COMPLETADA, CANCELADA, RECHAZADA)
   */
  async obtenerHistorialReservasPropietario(propietarioId: string) {
    try {
      console.log(
        "🔍 [SERVICE] obtenerHistorialReservasPropietario - Buscando historial para propietarioId:",
        propietarioId,
      );

      const reservas = await this.prisma.reserva.findMany({
        where: {
          propietarioId: propietarioId,
          // Unificamos estados de cancelación en 'CANCELADA' según el esquema actual
          estado: { in: ["COMPLETADA", "CANCELADA", "RECHAZADA"] },
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
            },
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
              imagenes: true,
            },
          },
          transacciones: {
            select: {
              id: true,
              monto: true,
              estado: true,
              fechaCreacion: true,
              metodoPago: true,
            },
            orderBy: {
              fechaCreacion: "desc",
            },
          },
        },
        orderBy: {
          fechaCreacion: "desc",
        },
      });

      console.log(
        "📋 [SERVICE] obtenerHistorialReservasPropietario - Resultados:",
        {
          propietarioId,
          cantidadEncontradas: reservas.length,
          reservas: reservas.map((r) => ({
            id: r.id,
            estado: r.estado,
            fechaInicio: r.fechaInicio,
            fechaFin: r.fechaFin,
            publicacionTitulo: r.publicacion?.titulo,
          })),
        },
      );

      return {
        success: true,
        data: reservas,
        count: reservas.length,
      };
    } catch (error: any) {
      console.error(
        "❌ [SERVICE] Error en obtenerHistorialReservasPropietario:",
        error,
      );
      throw new BadRequestException(
        `Error al obtener el historial de reservas del propietario: ${error.message}`,
      );
    }
  }
}
