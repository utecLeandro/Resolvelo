import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcesarPagoDto, RespuestaPagoDto } from './dto/procesar-pago.dto';

@Injectable()
export class TransaccionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Simula el procesamiento de un pago externo
   * Por ahora siempre devuelve aprobado
   */
  private async simularPagoExterno(monto: number, metodoPago: string): Promise<{
    aprobado: boolean;
    referenciaExterna: string;
    mensaje: string;
  }> {
    // Simular delay de API externa
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generar referencia externa simulada
    const referenciaExterna = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Por ahora siempre aprobado (simulación)
    return {
      aprobado: true,
      referenciaExterna,
      mensaje: 'Pago procesado exitosamente (simulado)'
    };
  }

  /**
   * Procesa el pago de una reserva
   */
  async procesarPago(procesarPagoDto: ProcesarPagoDto): Promise<RespuestaPagoDto> {
    const { reservaId, metodoPago, descripcion } = procesarPagoDto;

    try {
      // 1. Verificar que la reserva existe y está en estado CONFIRMADA
      const reserva = await this.prisma.reserva.findUnique({
        where: { id: reservaId },
        include: {
          publicacion: {
            select: {
              precioPorDia: true,
              titulo: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        }
      });

      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }

      if (reserva.estado !== 'CONFIRMADA') {
        throw new BadRequestException('La reserva debe estar confirmada para proceder al pago');
      }

      // 2. Verificar que no existe ya una transacción completada para esta reserva
      const transaccionExistente = await this.prisma.transaccion.findFirst({
        where: {
          reservaId: reservaId,
          estado: 'COMPLETADA'
        }
      });

      if (transaccionExistente) {
        throw new BadRequestException('Esta reserva ya tiene un pago completado');
      }

      // 3. Calcular el monto total
      const fechaInicio = new Date(reserva.fechaInicio);
      const fechaFin = new Date(reserva.fechaFin);
      const diasReserva = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const montoTotal = Number(reserva.publicacion.precioPorDia) * diasReserva;

      // 4. Crear transacción en estado PROCESANDO
      const transaccion = await this.prisma.transaccion.create({
        data: {
          tipo: 'PAGO_RESERVA',
          estado: 'PROCESANDO',
          monto: montoTotal,
          metodoPago: metodoPago || 'TARJETA_CREDITO',
          descripcion: descripcion || `Pago de reserva para ${reserva.publicacion.titulo}`,
          usuarioId: reserva.usuarioId,
          reservaId: reservaId,
          fechaProcesamiento: new Date()
        }
      });

      // 5. Simular llamada a API externa de pagos
      const resultadoPago = await this.simularPagoExterno(montoTotal, metodoPago);

      if (resultadoPago.aprobado) {
        // 6. Actualizar transacción como completada
        await this.prisma.transaccion.update({
          where: { id: transaccion.id },
          data: {
            estado: 'COMPLETADA',
            referenciaExterna: resultadoPago.referenciaExterna,
            fechaCompletado: new Date(),
            montoNeto: montoTotal * 0.95, // Simular comisión del 5%
            comisionPlataforma: montoTotal * 0.03,
            comisionPasarela: montoTotal * 0.02
          }
        });

        // 7. Actualizar estado de la reserva a EN_CURSO
        await this.prisma.reserva.update({
          where: { id: reservaId },
          data: { estado: 'EN_CURSO' }
        });

        return {
          exito: true,
          transaccionId: transaccion.id,
          referenciaExterna: resultadoPago.referenciaExterna,
          mensaje: resultadoPago.mensaje,
          fechaProcesamiento: new Date()
        };
      } else {
        // 6. Marcar transacción como fallida
        await this.prisma.transaccion.update({
          where: { id: transaccion.id },
          data: {
            estado: 'FALLIDA',
            referenciaExterna: resultadoPago.referenciaExterna
          }
        });

        throw new BadRequestException(`Error en el pago: ${resultadoPago.mensaje}`);
      }

    } catch (error) {
      console.error('Error procesando pago:', error);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Error al procesar el pago: ${error.message}`);
    }
  }

  /**
   * Obtener transacciones de un usuario
   */
  async obtenerTransaccionesUsuario(usuarioId: string) {
    return this.prisma.transaccion.findMany({
      where: { usuarioId },
      include: {
        reserva: {
          include: {
            publicacion: {
              select: {
                titulo: true,
                precioPorDia: true
              }
            }
          }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
  }

  /**
   * Obtener detalles de una transacción
   */
  async obtenerTransaccion(id: string) {
    const transaccion = await this.prisma.transaccion.findUnique({
      where: { id },
      include: {
        reserva: {
          include: {
            publicacion: {
              select: {
                titulo: true,
                precioPorDia: true
              }
            },
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!transaccion) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaccion;
  }
}