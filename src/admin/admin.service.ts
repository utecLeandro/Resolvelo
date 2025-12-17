import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { EstadoTransaccion } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async obtenerLiquidacionesPendientes() {
    const liquidaciones = await this.prisma.transaccion.findMany({
      where: {
        tipo: 'LIQUIDACION',
        estado: 'PENDIENTE',
      },
      include: {
        reserva: {
          include: {
            propietario: {
              include: {
                datosBancarios: true,
              },
            },
            publicacion: true,
          },
        },
      },
      orderBy: { fechaCreacion: 'asc' },
    });

    // Desencriptamos los datos sensibles antes de enviarlos al admin
    return liquidaciones.map((liq) => {
      const datosBancarios = liq.reserva.propietario.datosBancarios;
      return {
        id: liq.id,
        monto: liq.monto,
        fechaCreacion: liq.fechaCreacion,
        reserva: {
          id: liq.reserva.id,
          titulo: liq.reserva.publicacion.titulo,
        },
        propietario: {
          id: liq.reserva.propietario.id,
          nombre: `${liq.reserva.propietario.nombre} ${liq.reserva.propietario.apellido}`,
          email: liq.reserva.propietario.email,
          datosBancarios: datosBancarios
            ? {
                banco: datosBancarios.banco,
                tipoCuenta: datosBancarios.tipoCuenta,
                numeroCuenta: this.encryptionService.decrypt(datosBancarios.numeroCuenta),
                moneda: datosBancarios.moneda,
                titular: datosBancarios.titular,
              }
            : null,
        },
      };
    });
  }

  async procesarLiquidacion(id: string) {
    const liquidacion = await this.prisma.transaccion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!liquidacion) {
      throw new NotFoundException('Liquidación no encontrada');
    }

    if (liquidacion.tipo !== 'LIQUIDACION' || liquidacion.estado !== 'PENDIENTE') {
      throw new NotFoundException('La transacción no es una liquidación pendiente');
    }

    // Aquí iría la lógica real de pago o integración con banco/API
    // Por ahora, solo marcamos como completada

    return this.prisma.transaccion.update({
      where: { id: BigInt(id) },
      data: {
        estado: 'COMPLETADA',
        fechaProcesamiento: new Date(),
        fechaCompletado: new Date(),
      },
    });
  }
}
