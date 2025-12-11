import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcesarPagoDto, RespuestaPagoDto } from './dto/procesar-pago.dto';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { MP_DEFAULT_ACCESS_TOKEN } from '../config/mercadopago.config';
import axios from 'axios';
import { ProcesarPagoBrickDto } from './dto/payment-brick.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { normalizeCiUy } from '../auth/validators/ci-uy.validator';
import { Transaccion, Reserva, Publicacion, Usuario } from '@prisma/client';

export interface RespuestaPreferenciaMpDto {
  ok: boolean;
  preferenciaId: string;
  transaccionId: string;
  init_point?: string;
  sandbox_init_point?: string;
  redirectUrl: string;
}

type TransaccionConDetalles = Transaccion & {
  reserva:
    | (Reserva & { publicacion: Pick<Publicacion, 'precioPorDia' | 'titulo'> })
    | null;
  usuario: Pick<
    Usuario,
    'email' | 'nombre' | 'apellido' | 'documentoIdentidad'
  >;
};

@Injectable()
export class TransaccionesService {
  constructor(
    private prisma: PrismaService,
    @Optional() private notificaciones?: NotificacionesService,
  ) {}

  /**
   * Genera una liquidación pendiente para el propietario
   */
  async generarLiquidacion(reservaId: bigint) {
    try {
      // 1. Verificar si ya existe liquidación para esta reserva
      const liquidacionExistente = await this.prisma.transaccion.findFirst({
        where: {
          reservaId: reservaId,
          tipo: 'LIQUIDACION',
        },
      });

      if (liquidacionExistente) {
        return liquidacionExistente;
      }

      // 2. Obtener datos de la reserva y el pago original
      const reserva = await this.prisma.reserva.findUnique({
        where: { id: reservaId },
        include: {
          transacciones: {
            where: {
              tipo: 'PAGO_RESERVA',
              estado: 'COMPLETADA',
            },
          },
        },
      });

      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }

      const pagoOriginal = reserva.transacciones[0];
      if (!pagoOriginal) {
        // Si no hay pago original, no generamos liquidación (ej. reserva gratuita o error)
        console.warn(
          `Intento de liquidación sin pago previo para reserva ${reservaId}`,
        );
        return null;
      }

      // 3. Calcular montos
      // Usamos los montos guardados en el pago original si existen, o recalculamos
      const montoTotal = Number(pagoOriginal.monto);
      const comisionPlataforma = Number(
        pagoOriginal.comisionPlataforma || montoTotal * 0.03,
      );
      const comisionPasarela = Number(
        pagoOriginal.comisionPasarela || montoTotal * 0.02,
      );
      const montoLiquidar = montoTotal - comisionPlataforma - comisionPasarela;

      // 4. Crear transacción de liquidación
      return await this.prisma.transaccion.create({
        data: {
          tipo: 'LIQUIDACION',
          estado: 'PENDIENTE', // Queda pendiente para pago manual
          monto: montoLiquidar,
          montoNeto: montoLiquidar,
          comisionPlataforma: comisionPlataforma,
          comisionPasarela: comisionPasarela,
          descripcion: `Liquidación por alquiler #${reservaId}`,
          usuarioId: reserva.propietarioId,
          reservaId: reservaId,
          fechaProcesamiento: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error generando liquidación: ${error.message}`);
      // No lanzamos excepción para no romper el flujo de finalización de reserva,
      // pero logueamos el error grave.
      return null;
    }
  }

  /**
   * Obtiene liquidaciones pendientes (Para Admin)
   */
  async obtenerLiquidacionesPendientes() {
    try {
      return await this.prisma.transaccion.findMany({
        where: {
          tipo: 'LIQUIDACION',
          estado: 'PENDIENTE',
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
          reserva: {
            include: {
              publicacion: {
                select: {
                  titulo: true,
                },
              },
            },
          },
        },
        orderBy: {
          fechaCreacion: 'asc',
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener liquidaciones pendientes: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * Marca una liquidación como completada (Pago realizado manualmente)
   */
  async marcarLiquidacionCompletada(
    id: string,
    referenciaPago: string,
    notas?: string,
  ) {
    try {
      const liquidacion = await this.prisma.transaccion.findUnique({
        where: { id: BigInt(id) },
      });

      if (!liquidacion) {
        throw new NotFoundException('Liquidación no encontrada');
      }

      if (liquidacion.tipo !== 'LIQUIDACION') {
        throw new BadRequestException(
          'La transacción no es de tipo LIQUIDACION',
        );
      }

      if (liquidacion.estado !== 'PENDIENTE') {
        throw new BadRequestException(
          `La liquidación ya está en estado ${liquidacion.estado}`,
        );
      }

      return await this.prisma.transaccion.update({
        where: { id: BigInt(id) },
        data: {
          estado: 'COMPLETADA',
          fechaCompletado: new Date(),
          referenciaExterna: referenciaPago,
          notasInternas: notas,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al completar liquidación: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * Simula el procesamiento de un pago externo
   * Por ahora siempre devuelve aprobado
   */
  private async simularPagoExterno(
    _monto: number,
    _metodoPago: string,
  ): Promise<{
    aprobado: boolean;
    referenciaExterna: string;
    mensaje: string;
  }> {
    // Simular delay de API externa
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generar referencia externa simulada
    const referenciaExterna = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Por ahora siempre aprobado (simulación)
    return {
      aprobado: true,
      referenciaExterna,
      mensaje: 'Pago procesado exitosamente (simulado)',
    };
  }

  /**
   * Procesa el pago de una reserva
   */
  async procesarPago(
    procesarPagoDto: ProcesarPagoDto,
  ): Promise<RespuestaPagoDto> {
    const { reservaId, metodoPago, descripcion } = procesarPagoDto;

    try {
      // 1. Verificar que la reserva existe y está en estado CONFIRMADA
      const reserva = await this.prisma.reserva.findUnique({
        where: { id: BigInt(reservaId) },
        include: {
          publicacion: {
            select: {
              precioPorDia: true,
              titulo: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });

      if (!reserva) {
        throw new NotFoundException('Reserva no encontrada');
      }

      if (reserva.estado !== 'CONFIRMADA') {
        throw new BadRequestException(
          'La reserva debe estar confirmada para proceder al pago',
        );
      }

      // 2. Verificar que no existe ya una transacción completada para esta reserva
      const transaccionExistente = await this.prisma.transaccion.findFirst({
        where: {
          reservaId: BigInt(reservaId),
          estado: 'COMPLETADA',
        },
      });

      if (transaccionExistente) {
        throw new BadRequestException(
          'Esta reserva ya tiene un pago completado',
        );
      }

      // 3. Calcular el monto total
      const fechaInicio = new Date(reserva.fechaInicio);
      const fechaFin = new Date(reserva.fechaFin);
      const diasReserva =
        Math.ceil(
          (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;
      const montoTotal = Number(reserva.publicacion.precioPorDia) * diasReserva;

      // 4. Crear transacción en estado PROCESANDO
      const transaccion = await this.prisma.transaccion.create({
        data: {
          tipo: 'PAGO_RESERVA',
          estado: 'PROCESANDO',
          monto: montoTotal,
          metodoPago: metodoPago || 'TARJETA_CREDITO',
          descripcion:
            descripcion || `Pago de reserva para ${reserva.publicacion.titulo}`,
          usuarioId: reserva.usuarioId,
          reservaId: BigInt(reservaId),
          fechaProcesamiento: new Date(),
        },
      });

      // 5. Simular llamada a API externa de pagos
      const resultadoPago = await this.simularPagoExterno(
        montoTotal,
        metodoPago,
      );

      if (resultadoPago.aprobado) {
        // 6. Actualizar transacción como completada
        const txCompletada = await this.prisma.transaccion.update({
          where: { id: transaccion.id },
          data: {
            estado: 'COMPLETADA',
            referenciaExterna: resultadoPago.referenciaExterna,
            fechaCompletado: new Date(),
            montoNeto: montoTotal * 0.95, // Simular comisión del 5%
            comisionPlataforma: montoTotal * 0.03,
            comisionPasarela: montoTotal * 0.02,
          },
        });

        // 7. Actualizar estado de la reserva a EN_CURSO
        await this.prisma.reserva.update({
          where: { id: BigInt(reservaId) },
          data: { estado: 'EN_CURSO' },
        });

        if (this.notificaciones) {
          try {
            await this.notificaciones.emitirPagoCompletado(
              reserva,
              txCompletada,
            );
          } catch {}
        }

        return {
          exito: true,
          transaccionId: String(transaccion.id),
          referenciaExterna: resultadoPago.referenciaExterna,
          mensaje: resultadoPago.mensaje,
          fechaProcesamiento: new Date(),
        };
      } else {
        // 6. Marcar transacción como fallida
        await this.prisma.transaccion.update({
          where: { id: transaccion.id },
          data: {
            estado: 'FALLIDA',
            referenciaExterna: resultadoPago.referenciaExterna,
          },
        });

        throw new BadRequestException(
          `Error en el pago: ${resultadoPago.mensaje}`,
        );
      }
    } catch (error) {
      console.error('Error procesando pago:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        `Error al procesar el pago: ${error.message}`,
      );
    }
  }

  /**
   * Reembolsa una transacción completada asociada a una reserva
   */
  async reembolsarTransaccion(reservaId: bigint) {
    try {
      // 1. Buscar la transacción completada
      const transaccion = await this.prisma.transaccion.findFirst({
        where: {
          reservaId: reservaId,
          estado: 'COMPLETADA',
        },
      });

      if (!transaccion) {
        // No hay transacción para reembolsar, no es un error, simplemente no hacemos nada
        return null;
      }

      if (!transaccion.referenciaExterna) {
        throw new BadRequestException(
          'No se puede reembolsar una transacción sin referencia externa',
        );
      }

      // 2. Realizar reembolso en MercadoPago
      // Usamos axios directamente para asegurar compatibilidad con la API de refunds
      await axios.post(
        `https://api.mercadopago.com/v1/payments/${transaccion.referenciaExterna}/refunds`,
        {},
        {
          headers: {
            Authorization: `Bearer ${MP_DEFAULT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `refund-${transaccion.id}`,
          },
        },
      );

      // 3. Actualizar estado de la transacción
      const transaccionReembolsada = await this.prisma.transaccion.update({
        where: { id: transaccion.id },
        data: {
          estado: 'REEMBOLSADA',
        },
      });

      return transaccionReembolsada;
    } catch (error) {
      console.error('Error al reembolsar transacción:', error);
      throw new BadRequestException(
        `Error al reembolsar transacción: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * Obtener transacciones de un usuario
   */
  async obtenerTransaccionesUsuario(usuarioId: string) {
    return this.prisma.transaccion.findMany({
      where: { usuarioId: BigInt(usuarioId) },
      include: {
        reserva: {
          include: {
            publicacion: {
              select: {
                titulo: true,
                precioPorDia: true,
              },
            },
          },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  /**
   * Obtener detalles de una transacción
   */
  async obtenerTransaccion(id: string) {
    const transaccion = await this.prisma.transaccion.findUnique({
      where: { id: BigInt(id) },
      include: {
        reserva: {
          include: {
            publicacion: {
              select: {
                titulo: true,
                precioPorDia: true,
                imagenes: {
                  select: {
                    id: true,
                    url: true,
                    descripcion: true,
                    orden: true,
                    esPrincipal: true,
                  },
                },
              },
            },
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!transaccion) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaccion;
  }

  /**
   * Crea una preferencia de Mercado Pago y devuelve la URL para redirigir al checkout
   */
  async crearPreferenciaMercadoPago(
    reservaId: string,
    descripcion?: string,
  ): Promise<RespuestaPreferenciaMpDto> {
    // Carga definitiva del Access Token de Mercado Pago
    // Nota: Se establece un valor por defecto para evitar depender de .env en desarrollo
    const accessToken = process.env.MP_ACCESS_TOKEN || MP_DEFAULT_ACCESS_TOKEN;
    if (!accessToken) {
      throw new BadRequestException(
        'Falta configurar MP_ACCESS_TOKEN en el entorno',
      );
    }

    const reserva = await this.prisma.reserva.findUnique({
      where: { id: BigInt(reservaId) },
      include: {
        publicacion: { select: { precioPorDia: true, titulo: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reserva.estado !== 'CONFIRMADA') {
      throw new BadRequestException(
        'La reserva debe estar confirmada para proceder al pago',
      );
    }

    const fechaInicio = new Date(reserva.fechaInicio);
    const fechaFin = new Date(reserva.fechaFin);
    const diasReserva =
      Math.ceil(
        (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    // Calcular montos
    const montoPropietario =
      Number(reserva.publicacion.precioPorDia) * diasReserva;
    const feePercentage = Number(process.env.PLATFORM_FEE_PERCENTAGE) || 0.1;
    const comisionPlataforma = montoPropietario * feePercentage;
    const montoTotal = montoPropietario + comisionPlataforma;

    const transaccion = await this.prisma.transaccion.create({
      data: {
        tipo: 'PAGO_RESERVA',
        estado: 'PENDIENTE',
        monto: montoTotal,
        metodoPago: 'MERCADO_PAGO',
        descripcion:
          descripcion || `Pago de reserva para ${reserva.publicacion.titulo}`,
        usuarioId: reserva.usuarioId,
        reservaId: BigInt(reservaId),
        fechaProcesamiento: new Date(),
        montoNeto: montoPropietario, // Guardamos lo que corresponde al propietario
        comisionPlataforma: comisionPlataforma, // Guardamos nuestra ganancia
      },
    });

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const frontendBase = 'https://develop.d2jhmkfagiypdq.amplifyapp.com';
    const ensureUrl = (raw: string | undefined, fallbackPath: string) => {
      const t = (raw ?? '').trim();
      let candidate = t || `${frontendBase}${fallbackPath}`;
      try {
        new URL(candidate);
      } catch {
        candidate = `${frontendBase}${fallbackPath}`;
      }
      return candidate;
    };
    const successUrl = ensureUrl(process.env.MP_SUCCESS_URL, '/pago-exitoso');
    const failureUrl = ensureUrl(process.env.MP_FAILURE_URL, '/pago-error');
    const pendingUrl = ensureUrl(process.env.MP_PENDING_URL, '/pago-exitoso');
    const _isLocalFrontend = /^http:\/\/(127\.0\.0\.1|localhost)/i.test(
      frontendBase,
    );

    const body: any = {
      items: [
        {
          title: `Alquiler: ${reserva.publicacion.titulo} (${diasReserva} días)`,
          description: descripcion || `Reserva ${reserva.id}`,
          quantity: 1,
          currency_id: 'UYU',
          unit_price: Number(montoPropietario.toFixed(2)),
        },
        {
          title: 'Tarifa de Servicio ReSolVelo',
          description: 'Comisión por uso de plataforma',
          quantity: 1,
          currency_id: 'UYU',
          unit_price: Number(comisionPlataforma.toFixed(2)),
        },
      ],
      payer: {
        name: reserva.usuario.nombre || 'Cliente',
        email: reserva.usuario.email,
      },
      metadata: {
        reservaId,
        usuarioId: String(reserva.usuarioId),
        transaccionId: String(transaccion.id),
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },

      binary_mode: true,
      statement_descriptor: 'ReSolVelo',
      external_reference: String(transaccion.id),
    };

    // No usar auto_return en sandbox para evitar validaciones adicionales de MP

    // Agregar notification_url solo si está configurada explícitamente y es HTTPS válido
    const rawNotificationUrl = process.env.MP_NOTIFICATION_URL?.trim();
    if (rawNotificationUrl) {
      const isHttps = /^https:\/\//i.test(rawNotificationUrl);
      if (isHttps) {
        body.notification_url = rawNotificationUrl;
      } else {
        console.warn(
          '[MP] MP_NOTIFICATION_URL no es HTTPS, se omite para evitar error 400:',
          rawNotificationUrl,
        );
      }
    }

    let result: any;
    // Log del cuerpo para diagnosticar errores de validación
    console.log('[MP] Preference.create body:', JSON.stringify(body, null, 2));
    if (rawNotificationUrl) {
      console.log('[MP] MP_NOTIFICATION_URL (env):', rawNotificationUrl);
    }
    try {
      result = await preference.create({ body });
    } catch (err: any) {
      // Log detallado del error para facilitar el diagnóstico
      console.error('❌ [MP] Error creando preferencia:', {
        message: err?.message,
        status: err?.status || err?.error?.status,
        cause: err?.cause || err?.error?.cause,
        error: err?.error || err,
      });
      const msg =
        err?.error?.message ||
        err?.message ||
        JSON.stringify(err?.error || err);
      throw new BadRequestException(`MP create preference error: ${msg}`);
    }
    console.log('🧾 [MP] Preferencia creada:', {
      id: result?.id,
      init_point: result?.init_point,
      sandbox_init_point: result?.sandbox_init_point,
    });

    await this.prisma.transaccion.update({
      where: { id: transaccion.id },
      data: { referenciaExterna: result.id },
    });

    const sandbox = (process.env.MP_SANDBOX || 'true').toLowerCase() === 'true';
    // Fallbacks por si la librería retorna los campos en distintas formas
    const redirectUrl = sandbox
      ? result?.sandbox_init_point || result?.init_point
      : result?.init_point || result?.sandbox_init_point;

    return {
      ok: true,
      preferenciaId: result.id,
      transaccionId: String(transaccion.id),
      init_point: result?.init_point,
      sandbox_init_point: result?.sandbox_init_point,
      redirectUrl,
    };
  }

  /**
   * Procesa el webhook de Mercado Pago para actualizar el estado de las transacciones
   */
  async procesarWebhookMercadoPago(payload: any, query: any) {
    try {
      const accessToken = process.env.MP_ACCESS_TOKEN;
      if (!accessToken) {
        throw new BadRequestException(
          'Falta configurar MP_ACCESS_TOKEN en el entorno',
        );
      }

      const topic = query?.topic || payload?.topic || payload?.type;
      const id = query?.id || payload?.data?.id || payload?.id;

      console.log('📥 [MP Webhook] Evento recibido:', { topic, id });

      if (!id) {
        throw new BadRequestException('Webhook sin ID de pago');
      }

      // Obtener detalle del pago desde la API de MP para conocer el estado
      const { Payment } = await import('mercadopago');
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      const paymentDetail: any = await payment.get({ id: Number(id) });
      console.log('🧾 [MP Webhook] Detalle de pago:', {
        id: paymentDetail?.id,
        status: paymentDetail?.status,
        external_reference: paymentDetail?.external_reference,
        metadata: paymentDetail?.metadata,
      });
      try {
        console.log(
          '[MP Webhook] Payment detail full:',
          JSON.stringify(paymentDetail, null, 2),
        );
      } catch {}

      const transaccionId =
        paymentDetail?.external_reference || payload?.metadata?.transaccionId;
      if (!transaccionId) {
        throw new BadRequestException(
          'No se pudo asociar el pago a una transacción',
        );
      }

      const estadoPago = String(paymentDetail?.status || '').toUpperCase();

      if (estadoPago === 'APPROVED') {
        // Marcar transacción como completada y actualizar reserva
        const transaccion = await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'COMPLETADA',
            fechaCompletado: new Date(),
            referenciaExterna: String(paymentDetail?.id || ''),
            montoNeto: undefined,
            comisionPlataforma: undefined,
            comisionPasarela: undefined,
            notasInternas: JSON.stringify(paymentDetail),
          },
        });

        // Actualizar reserva a EN_CURSO
        if (transaccion?.reservaId) {
          await this.prisma.reserva.update({
            where: { id: transaccion.reservaId },
            data: { estado: 'EN_CURSO' },
          });
          if (this.notificaciones) {
            try {
              const reservaFull = await this.prisma.reserva.findUnique({
                where: { id: transaccion.reservaId },
                include: {
                  publicacion: {
                    select: {
                      id: true,
                      titulo: true,
                      marca: true,
                      modelo: true,
                    },
                  },
                },
              });
              if (reservaFull)
                await this.notificaciones.emitirPagoCompletado(
                  reservaFull,
                  transaccion,
                );
            } catch {}
          }
        }
      } else if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'PENDIENTE',
            referenciaExterna: String(paymentDetail?.id || ''),
            notasInternas: JSON.stringify(paymentDetail),
          },
        });
      } else {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'FALLIDA',
            referenciaExterna: String(paymentDetail?.id || ''),
            notasInternas: JSON.stringify(paymentDetail),
          },
        });
      }

      return { ok: true };
    } catch (error) {
      console.error('❌ [MP Webhook] Error procesando webhook:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Error procesando webhook');
    }
  }

  /**
   * Verifica el estado de pago directamente en la API de MP utilizando external_reference
   * y actualiza la transacción/reserva en base al resultado. Útil como fallback cuando
   * el webhook no funciona (desarrollo sin HTTPS) o MP no redirige de vuelta.
   */
  async verificarEstadoMercadoPagoPorTransaccion(transaccionId: string) {
    try {
      if (!transaccionId) {
        throw new BadRequestException('Falta transaccionId');
      }
      const accessToken =
        process.env.MP_ACCESS_TOKEN || MP_DEFAULT_ACCESS_TOKEN;
      if (!accessToken) {
        throw new BadRequestException(
          'Falta configurar MP_ACCESS_TOKEN en el entorno',
        );
      }

      // Obtener la transacción actual (para conocer reservaId y preference_id guardado en referenciaExterna)
      const tx = await this.prisma.transaccion.findUnique({
        where: { id: BigInt(transaccionId) },
        include: { reserva: true },
      });
      if (!tx) {
        throw new NotFoundException('Transacción no encontrada');
      }

      // Si ya está completada, devolver tal cual
      if (tx.estado === 'COMPLETADA') {
        return tx;
      }

      // Intentar buscar pagos por external_reference (seteado con transaccion.id al crear la preferencia)
      const baseUrl = 'https://api.mercadopago.com/v1/payments/search';
      const headers = { Authorization: `Bearer ${accessToken}` };
      let results: any[] = [];
      try {
        const { data: dataExt } = await axios.get(baseUrl, {
          headers,
          params: {
            external_reference: transaccionId,
            sort: 'date_created',
            criteria: 'desc',
          },
        });
        results = Array.isArray(dataExt?.results) ? dataExt.results : [];
      } catch {}
      if (!results.length && tx.referenciaExterna) {
        try {
          const { data: dataPref } = await axios.get(baseUrl, {
            headers,
            params: {
              preference_id: tx.referenciaExterna,
              sort: 'date_created',
              criteria: 'desc',
            },
          });
          results = Array.isArray(dataPref?.results) ? dataPref.results : [];
        } catch {}
      }

      const ultimo: any = results.length ? results[0] : null;
      const estadoPago = String(ultimo?.status || '').toUpperCase();
      console.log('🔎 [MP] Verificación por external_reference/preference:', {
        transaccionId,
        estadoPago,
        paymentId: ultimo?.id,
      });
      try {
        if (ultimo) {
          console.log(
            '[MP Verify] Payment search result full:',
            JSON.stringify(ultimo, null, 2),
          );
        }
      } catch {}

      if (estadoPago === 'APPROVED') {
        const actualizada: any = await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'COMPLETADA',
            fechaCompletado: new Date(),
            referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ''),
            notasInternas: ultimo ? JSON.stringify(ultimo) : tx.notasInternas,
          },
          include: { reserva: true },
        });
        if (actualizada?.reservaId) {
          await this.prisma.reserva.update({
            where: { id: actualizada.reservaId },
            data: { estado: 'EN_CURSO' },
          });
          if (this.notificaciones && actualizada.reserva) {
            try {
              await this.notificaciones.emitirPagoCompletado(
                actualizada.reserva,
                actualizada,
              );
            } catch {}
          }
        }
        return actualizada;
      }
      if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'PENDIENTE',
            referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ''),
            notasInternas: ultimo ? JSON.stringify(ultimo) : tx.notasInternas,
          },
        });
      } else if (estadoPago === 'REJECTED' || estadoPago === 'CANCELLED') {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'FALLIDA',
            referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ''),
            notasInternas: ultimo ? JSON.stringify(ultimo) : tx.notasInternas,
          },
        });
      }

      // Devolver el estado actual desde DB
      return await this.prisma.transaccion.findUnique({
        where: { id: BigInt(transaccionId) },
        include: { reserva: true },
      });
    } catch (error) {
      console.error('❌ [MP] Error verificando estado por transacción:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Error verificando estado de pago');
    }
  }

  async verificarEstadoMercadoPagoPorPreference(preferenceId: string) {
    try {
      if (!preferenceId) {
        throw new BadRequestException('Falta preferenceId');
      }
      const accessToken =
        process.env.MP_ACCESS_TOKEN || MP_DEFAULT_ACCESS_TOKEN;
      if (!accessToken) {
        throw new BadRequestException(
          'Falta configurar MP_ACCESS_TOKEN en el entorno',
        );
      }
      const baseUrl = 'https://api.mercadopago.com/v1/payments/search';
      const headers = { Authorization: `Bearer ${accessToken}` };
      let results: any[] = [];
      try {
        const { data } = await axios.get(baseUrl, {
          headers,
          params: {
            preference_id: preferenceId,
            sort: 'date_created',
            criteria: 'desc',
          },
        });
        results = Array.isArray(data?.results) ? data.results : [];
      } catch {}
      // Si no hay pagos en /v1/payments, intentar obtenerlos desde merchant_orders
      let ultimo: any = results.length ? results[0] : null;
      if (!ultimo) {
        try {
          const { data: mo } = await axios.get(
            'https://api.mercadopago.com/merchant_orders/search',
            { headers, params: { preference_id: preferenceId } },
          );
          const elements: any[] = Array.isArray(mo?.elements)
            ? mo.elements
            : [];
          const order = elements.length ? elements[0] : null;
          const pagos: any[] = Array.isArray(order?.payments)
            ? order.payments
            : [];
          // Seleccionar el último pago o el primero con status
          if (pagos.length) {
            // Normalizar estructura del pago para reutilizar lógica
            const p =
              pagos.find(
                (x) => String(x?.status || '').toUpperCase() === 'APPROVED',
              ) || pagos[0];
            ultimo = {
              id: p?.id,
              status: p?.status,
              external_reference: order?.external_reference,
              date_approved: p?.date_approved,
              transaction_amount:
                p?.total_paid_amount ?? p?.transaction_amount ?? p?.amount,
              description: order?.description,
            };
          }
        } catch {}
      }
      const estadoPago = String(ultimo?.status || '').toUpperCase();
      let transaccionId = String(ultimo?.external_reference || '');
      if (!transaccionId) {
        const txPref = await this.prisma.transaccion.findFirst({
          where: { referenciaExterna: preferenceId },
        });
        transaccionId = String(txPref?.id || '');
      }
      if (!transaccionId) {
        throw new NotFoundException(
          'No se encontró transacción asociada a la preferencia',
        );
      }
      if (estadoPago === 'APPROVED') {
        const actualizada = await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'COMPLETADA',
            fechaCompletado: new Date(),
            referenciaExterna: String(ultimo?.id || preferenceId),
            notasInternas: ultimo ? JSON.stringify(ultimo) : undefined,
          },
          include: { reserva: true },
        });
        if (actualizada?.reservaId) {
          await this.prisma.reserva.update({
            where: { id: actualizada.reservaId },
            data: { estado: 'EN_CURSO' },
          });
        }
        return actualizada;
      }
      if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'PENDIENTE',
            referenciaExterna: String(ultimo?.id || preferenceId),
            notasInternas: ultimo ? JSON.stringify(ultimo) : undefined,
          },
        });
      } else if (estadoPago === 'REJECTED' || estadoPago === 'CANCELLED') {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'FALLIDA',
            referenciaExterna: String(ultimo?.id || preferenceId),
            notasInternas: ultimo ? JSON.stringify(ultimo) : undefined,
          },
        });
      }
      return await this.prisma.transaccion.findUnique({
        where: { id: BigInt(transaccionId) },
        include: { reserva: true },
      });
    } catch (error) {
      console.error('❌ [MP] Error verificando estado por preference:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Error verificando estado por preference');
    }
  }

  /**
   * Confirmación manual del pago desde el frontend cuando el webhook no llega (desarrollo/sandbox).
   * Consulta el pago en la API de Mercado Pago por paymentId y actualiza la transacción/reserva.
   */
  async confirmarPagoMercadoPago(paymentId: string) {
    try {
      const accessToken =
        process.env.MP_ACCESS_TOKEN || MP_DEFAULT_ACCESS_TOKEN;
      if (!accessToken) {
        throw new BadRequestException(
          'Falta configurar MP_ACCESS_TOKEN en el entorno',
        );
      }

      const { Payment } = await import('mercadopago');
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      const paymentDetail: any = await payment.get({ id: Number(paymentId) });
      console.log('🧾 [MP Confirm] Detalle de pago:', {
        id: paymentDetail?.id,
        status: paymentDetail?.status,
        external_reference: paymentDetail?.external_reference,
        metadata: paymentDetail?.metadata,
      });
      try {
        console.log(
          '[MP Confirm] Payment detail full:',
          JSON.stringify(paymentDetail, null, 2),
        );
      } catch {}

      const transaccionId = paymentDetail?.external_reference;
      if (!transaccionId) {
        throw new NotFoundException(
          'No se encontró transacción asociada al pago',
        );
      }

      const estadoPago = String(paymentDetail?.status || '').toUpperCase();
      if (estadoPago === 'APPROVED') {
        const transaccion = await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'COMPLETADA',
            fechaCompletado: new Date(),
            referenciaExterna: String(paymentDetail?.id || ''),
            montoNeto: undefined,
            comisionPlataforma: undefined,
            comisionPasarela: undefined,
            notasInternas: JSON.stringify(paymentDetail),
          },
        });
        if (transaccion?.reservaId) {
          await this.prisma.reserva.update({
            where: { id: transaccion.reservaId },
            data: { estado: 'EN_CURSO' },
          });
          if (this.notificaciones) {
            try {
              const reservaFull = await this.prisma.reserva.findUnique({
                where: { id: transaccion.reservaId },
                include: {
                  publicacion: {
                    select: {
                      id: true,
                      titulo: true,
                      marca: true,
                      modelo: true,
                    },
                  },
                },
              });
              if (reservaFull)
                await this.notificaciones.emitirPagoCompletado(
                  reservaFull,
                  transaccion,
                );
            } catch {}
          }
        }
      } else if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'PENDIENTE',
            referenciaExterna: String(paymentDetail?.id || ''),
            notasInternas: JSON.stringify(paymentDetail),
          },
        });
      } else {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'FALLIDA',
            referenciaExterna: String(paymentDetail?.id || ''),
            notasInternas: JSON.stringify(paymentDetail),
          },
        });
      }

      // Devolver la transacción actualizada para que el frontend pueda decidir la redirección
      return await this.obtenerTransaccion(transaccionId);
    } catch (error) {
      console.error('❌ [MP Confirm] Error confirmando pago:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Error confirmando pago');
    }
  }

  async procesarPagoBrick(body: ProcesarPagoBrickDto) {
    try {
      const accessToken =
        process.env.MP_ACCESS_TOKEN || MP_DEFAULT_ACCESS_TOKEN;
      if (!accessToken) {
        throw new BadRequestException(
          'Falta configurar MP_ACCESS_TOKEN en el entorno',
        );
      }

      const client = new MercadoPagoConfig({ accessToken });
      const { Payment } = await import('mercadopago');
      const payment = new Payment(client);

      // Resolver transaccionId: recibido explícito o por preferenceId
      let transaccionId = String(body.transaccionId || '');
      if (!transaccionId && body.preferenceId) {
        const tx = await this.prisma.transaccion.findFirst({
          where: { referenciaExterna: body.preferenceId },
        });
        transaccionId = String(tx?.id || '');
      }
      if (!transaccionId) {
        throw new BadRequestException(
          'No se pudo asociar el pago a una transacción',
        );
      }

      const txFull: TransaccionConDetalles | null =
        await this.prisma.transaccion.findUnique({
          where: { id: BigInt(transaccionId) },
          include: {
            reserva: {
              include: {
                publicacion: { select: { precioPorDia: true, titulo: true } },
              },
            },
            usuario: {
              select: {
                email: true,
                nombre: true,
                apellido: true,
                documentoIdentidad: true,
              },
            },
          },
        });
      let montoCalculado = Number(body.transaction_amount || 0);
      try {
        if (
          txFull?.reserva?.fechaInicio &&
          txFull?.reserva?.fechaFin &&
          txFull?.reserva?.publicacion?.precioPorDia
        ) {
          const inicio = new Date(txFull.reserva.fechaInicio);
          const fin = new Date(txFull.reserva.fechaFin);
          const dias =
            Math.ceil(
              (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
            ) + 1;
          montoCalculado =
            Number(txFull.reserva.publicacion.precioPorDia) * dias;
        }
      } catch {}

      // Construir body para Payment.create (alineado con v2)
      const amount = Number(montoCalculado || body.transaction_amount);
      const issuerIdNum =
        body.issuer_id !== undefined &&
        body.issuer_id !== null &&
        body.issuer_id !== ''
          ? Number(body.issuer_id)
          : undefined;

      const payerBase: any = { ...(body.payer || {}) };
      // Normalizar email
      if (!payerBase.email && txFull?.usuario?.email) {
        payerBase.email = txFull.usuario.email;
      }
      // Normalizar identificación (sandbox/local)
      if (!payerBase.identification && txFull?.usuario?.documentoIdentidad) {
        payerBase.identification = {
          type: 'CI',
          number: normalizeCiUy(String(txFull.usuario.documentoIdentidad)),
        };
      }

      const payload: any = {
        token: body.token,
        payment_method_id: body.payment_method_id,
        transaction_amount: amount,
        installments: body.installments ?? 1,
        issuer_id: issuerIdNum,
        payer: payerBase,
        binary_mode: true,
        external_reference: transaccionId,
        // Información adicional útil para antifraude/reportes
        additional_info: {
          items: [
            {
              title: txFull?.reserva?.publicacion?.titulo || 'Pago de reserva',
              description: `Reserva ${txFull?.reservaId || ''}`,
              quantity: 1,
              unit_price: amount,
            },
          ],
          payer: {
            first_name:
              (body.payer as any)?.first_name ||
              txFull?.usuario?.nombre ||
              undefined,
            last_name:
              (body.payer as any)?.last_name ||
              txFull?.usuario?.apellido ||
              undefined,
          },
        },
      };
      // Limpiar campos vacíos de nivel superior
      Object.keys(payload).forEach((k) => {
        if (
          payload[k] === undefined ||
          payload[k] === null ||
          payload[k] === ''
        ) {
          delete payload[k];
        }
      });

      console.log(
        '🧾 [MP Brick] Payment.create body:',
        JSON.stringify(payload, null, 2),
      );
      const result: any = await payment.create({ body: payload });
      console.log('🧾 [MP Brick] Payment.create result:', {
        id: result?.id,
        status: result?.status,
        status_detail: result?.status_detail,
        external_reference: result?.external_reference,
      });
      try {
        console.log(
          '[MP Brick] Payment result full:',
          JSON.stringify(result, null, 2),
        );
      } catch {}

      const estadoPago = String(result?.status || '').toUpperCase();
      if (estadoPago === 'APPROVED') {
        const transaccion = await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'COMPLETADA',
            fechaCompletado: new Date(),
            referenciaExterna: String(result?.id || ''),
            notasInternas: JSON.stringify(result),
          },
          include: { reserva: true },
        });
        if (transaccion?.reservaId) {
          await this.prisma.reserva.update({
            where: { id: transaccion.reservaId },
            data: { estado: 'EN_CURSO' },
          });
          if (this.notificaciones) {
            try {
              const res = await this.prisma.reserva.findUnique({
                where: { id: transaccion.reservaId },
                include: {
                  publicacion: { select: { titulo: true, id: true } },
                },
              });
              if (res)
                await this.notificaciones.emitirPagoCompletado(
                  res,
                  transaccion,
                );
            } catch {}
          }
        }
        return transaccion;
      }
      if (estadoPago === 'PENDING' || estadoPago === 'IN_PROCESS') {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'PENDIENTE',
            referenciaExterna: String(result?.id || ''),
            notasInternas: JSON.stringify(result),
          },
        });
      } else {
        await this.prisma.transaccion.update({
          where: { id: BigInt(transaccionId) },
          data: {
            estado: 'FALLIDA',
            referenciaExterna: String(result?.id || ''),
            notasInternas: JSON.stringify(result),
          },
        });
      }
      return await this.prisma.transaccion.findUnique({
        where: { id: BigInt(transaccionId) },
        include: { reserva: true },
      });
    } catch (error: any) {
      console.error('❌ [MP Brick] Error creando pago:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      const msg = String(
        error?.message ||
          error?.error?.message ||
          'Error creando pago con Brick',
      );
      const code = String(
        error?.cause?.[0]?.code || error?.error?.cause?.[0]?.code || '',
      );
      const desc = String(
        error?.cause?.[0]?.description ||
          error?.error?.cause?.[0]?.description ||
          '',
      );
      throw new BadRequestException(code ? `${msg} (${code}: ${desc})` : msg);
    }
  }
}
