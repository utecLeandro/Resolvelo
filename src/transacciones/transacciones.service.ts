import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ProcesarPagoDto, RespuestaPagoDto } from "./dto/procesar-pago.dto";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { MP_DEFAULT_ACCESS_TOKEN } from "../config/mercadopago.config";

export interface RespuestaPreferenciaMpDto {
  ok: boolean;
  preferenciaId: string;
  transaccionId: string;
  init_point?: string;
  sandbox_init_point?: string;
  redirectUrl: string;
}

@Injectable()
export class TransaccionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Simula el procesamiento de un pago externo
   * Por ahora siempre devuelve aprobado
   */
  private async simularPagoExterno(
    monto: number,
    metodoPago: string,
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
      mensaje: "Pago procesado exitosamente (simulado)",
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
        where: { id: reservaId },
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
        throw new NotFoundException("Reserva no encontrada");
      }

      if (reserva.estado !== "CONFIRMADA") {
        throw new BadRequestException(
          "La reserva debe estar confirmada para proceder al pago",
        );
      }

      // 2. Verificar que no existe ya una transacción completada para esta reserva
      const transaccionExistente = await this.prisma.transaccion.findFirst({
        where: {
          reservaId: reservaId,
          estado: "COMPLETADA",
        },
      });

      if (transaccionExistente) {
        throw new BadRequestException(
          "Esta reserva ya tiene un pago completado",
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
          tipo: "PAGO_RESERVA",
          estado: "PROCESANDO",
          monto: montoTotal,
          metodoPago: metodoPago || "TARJETA_CREDITO",
          descripcion:
            descripcion || `Pago de reserva para ${reserva.publicacion.titulo}`,
          usuarioId: reserva.usuarioId,
          reservaId: reservaId,
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
        await this.prisma.transaccion.update({
          where: { id: transaccion.id },
          data: {
            estado: "COMPLETADA",
            referenciaExterna: resultadoPago.referenciaExterna,
            fechaCompletado: new Date(),
            montoNeto: montoTotal * 0.95, // Simular comisión del 5%
            comisionPlataforma: montoTotal * 0.03,
            comisionPasarela: montoTotal * 0.02,
          },
        });

        // 7. Actualizar estado de la reserva a EN_CURSO
        await this.prisma.reserva.update({
          where: { id: reservaId },
          data: { estado: "EN_CURSO" },
        });

        return {
          exito: true,
          transaccionId: transaccion.id,
          referenciaExterna: resultadoPago.referenciaExterna,
          mensaje: resultadoPago.mensaje,
          fechaProcesamiento: new Date(),
        };
      } else {
        // 6. Marcar transacción como fallida
        await this.prisma.transaccion.update({
          where: { id: transaccion.id },
          data: {
            estado: "FALLIDA",
            referenciaExterna: resultadoPago.referenciaExterna,
          },
        });

        throw new BadRequestException(
          `Error en el pago: ${resultadoPago.mensaje}`,
        );
      }
    } catch (error) {
      console.error("Error procesando pago:", error);

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
                precioPorDia: true,
              },
            },
          },
        },
      },
      orderBy: { fechaCreacion: "desc" },
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
                precioPorDia: true,
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
      throw new NotFoundException("Transacción no encontrada");
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
        "Falta configurar MP_ACCESS_TOKEN en el entorno",
      );
    }

    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
      include: {
        publicacion: { select: { precioPorDia: true, titulo: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    });

    if (!reserva) {
      throw new NotFoundException("Reserva no encontrada");
    }

    if (reserva.estado !== "CONFIRMADA") {
      throw new BadRequestException(
        "La reserva debe estar confirmada para proceder al pago",
      );
    }

    const fechaInicio = new Date(reserva.fechaInicio);
    const fechaFin = new Date(reserva.fechaFin);
    const diasReserva =
      Math.ceil(
        (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    const montoTotal = Number(reserva.publicacion.precioPorDia) * diasReserva;

    const transaccion = await this.prisma.transaccion.create({
      data: {
        tipo: "PAGO_RESERVA",
        estado: "PENDIENTE",
        monto: montoTotal,
        metodoPago: "MERCADO_PAGO",
        descripcion:
          descripcion || `Pago de reserva para ${reserva.publicacion.titulo}`,
        usuarioId: reserva.usuarioId,
        reservaId,
        fechaProcesamiento: new Date(),
      },
    });

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const rawFrontendBase = process.env.FRONTEND_URL;
    const frontendBase = rawFrontendBase?.trim() || "http://localhost:5173";
    const ensureUrl = (raw: string | undefined, fallbackPath: string) => {
      const t = (raw ?? "").trim();
      let candidate = t || `${frontendBase}${fallbackPath}`;
      try {
        new URL(candidate);
      } catch {
        candidate = `${frontendBase}${fallbackPath}`;
      }
      return candidate;
    };
    const successUrl = ensureUrl(process.env.MP_SUCCESS_URL, "/pago-exitoso");
    const failureUrl = ensureUrl(process.env.MP_FAILURE_URL, "/pago-error");
    const pendingUrl = ensureUrl(process.env.MP_PENDING_URL, "/pago-exitoso");
    const isLocalFrontend = /^http:\/\/(127\.0\.0\.1|localhost)/i.test(
      frontendBase,
    );

    const body: any = {
      items: [
        {
          title: `Pago de reserva: ${reserva.publicacion.titulo}`,
          description: descripcion || `Reserva ${reserva.id}`,
          quantity: 1,
          currency_id: "UYU",
          unit_price: Number(montoTotal),
        },
      ],
      payer: {
        name: reserva.usuario.nombre || "Cliente",
        email: reserva.usuario.email,
      },
      metadata: {
        reservaId,
        usuarioId: reserva.usuarioId,
        transaccionId: transaccion.id,
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      ...(isLocalFrontend ? {} : { auto_return: "approved" }),
      // Mantener binary_mode en false para permitir estados 'pending' en sandbox
      binary_mode: false,
      statement_descriptor: "ReSolVelo",
      external_reference: transaccion.id,
    };

    // Agregar notification_url solo si está configurada explícitamente y es HTTPS válido
    const rawNotificationUrl = process.env.MP_NOTIFICATION_URL?.trim();
    if (rawNotificationUrl) {
      const isHttps = /^https:\/\//i.test(rawNotificationUrl);
      if (isHttps) {
        body.notification_url = rawNotificationUrl;
      } else {
        console.warn(
          "[MP] MP_NOTIFICATION_URL no es HTTPS, se omite para evitar error 400:",
          rawNotificationUrl,
        );
      }
    }

    let result: any;
    // Log del cuerpo para diagnosticar errores de validación
    console.log("[MP] Preference.create body:", JSON.stringify(body, null, 2));
    if (rawNotificationUrl) {
      console.log("[MP] MP_NOTIFICATION_URL (env):", rawNotificationUrl);
    }
    try {
      result = await preference.create({ body });
    } catch (err: any) {
      // Log detallado del error para facilitar el diagnóstico
      console.error("❌ [MP] Error creando preferencia:", {
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
    console.log("🧾 [MP] Preferencia creada:", {
      id: result?.id,
      init_point: result?.init_point,
      sandbox_init_point: result?.sandbox_init_point,
    });

    await this.prisma.transaccion.update({
      where: { id: transaccion.id },
      data: { referenciaExterna: result.id },
    });

    const sandbox = (process.env.MP_SANDBOX || "true").toLowerCase() === "true";
    // Fallbacks por si la librería retorna los campos en distintas formas
    const redirectUrl = sandbox
      ? result?.sandbox_init_point || result?.init_point
      : result?.init_point || result?.sandbox_init_point;

    return {
      ok: true,
      preferenciaId: result.id,
      transaccionId: transaccion.id,
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
          "Falta configurar MP_ACCESS_TOKEN en el entorno",
        );
      }

      const topic = query?.topic || payload?.topic || payload?.type;
      const id = query?.id || payload?.data?.id || payload?.id;

      console.log("📥 [MP Webhook] Evento recibido:", { topic, id });

      if (!id) {
        throw new BadRequestException("Webhook sin ID de pago");
      }

      // Obtener detalle del pago desde la API de MP para conocer el estado
      const { Payment } = await import("mercadopago");
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      const paymentDetail: any = await payment.get({ id: Number(id) });
      console.log("🧾 [MP Webhook] Detalle de pago:", {
        id: paymentDetail?.id,
        status: paymentDetail?.status,
        external_reference: paymentDetail?.external_reference,
        metadata: paymentDetail?.metadata,
      });

      const transaccionId =
        paymentDetail?.external_reference || payload?.metadata?.transaccionId;
      if (!transaccionId) {
        throw new BadRequestException(
          "No se pudo asociar el pago a una transacción",
        );
      }

      const estadoPago = String(paymentDetail?.status || "").toUpperCase();

      if (estadoPago === "APPROVED") {
        // Marcar transacción como completada y actualizar reserva
        const transaccion = await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "COMPLETADA",
            fechaCompletado: new Date(),
            referenciaExterna: String(paymentDetail?.id || ""),
            montoNeto: undefined,
            comisionPlataforma: undefined,
            comisionPasarela: undefined,
          },
        });

        // Actualizar reserva a EN_CURSO
        if (transaccion?.reservaId) {
          await this.prisma.reserva.update({
            where: { id: transaccion.reservaId },
            data: { estado: "EN_CURSO" },
          });
        }
      } else if (estadoPago === "PENDING" || estadoPago === "IN_PROCESS") {
        await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "PENDIENTE",
            referenciaExterna: String(paymentDetail?.id || ""),
          },
        });
      } else {
        await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "FALLIDA",
            referenciaExterna: String(paymentDetail?.id || ""),
          },
        });
      }

      return { ok: true };
    } catch (error) {
      console.error("❌ [MP Webhook] Error procesando webhook:", error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException("Error procesando webhook");
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
        throw new BadRequestException("Falta transaccionId");
      }
      const accessToken =
        process.env.MP_ACCESS_TOKEN || MP_DEFAULT_ACCESS_TOKEN;
      if (!accessToken) {
        throw new BadRequestException(
          "Falta configurar MP_ACCESS_TOKEN en el entorno",
        );
      }

      // Obtener la transacción actual (para conocer reservaId y preference_id guardado en referenciaExterna)
      const tx = await this.prisma.transaccion.findUnique({
        where: { id: transaccionId },
        include: { reserva: true },
      });
      if (!tx) {
        throw new NotFoundException("Transacción no encontrada");
      }

      // Si ya está completada, devolver tal cual
      if (tx.estado === "COMPLETADA") {
        return tx;
      }

      // Intentar buscar pagos por external_reference (seteado con transaccion.id al crear la preferencia)
      const fetch = (await import("node-fetch")).default as any;
      const baseUrl = "https://api.mercadopago.com/v1/payments/search";
      const urlByExternal = `${baseUrl}?external_reference=${encodeURIComponent(transaccionId)}&sort=date_created&criteria=desc`;
      const respExt = await fetch(urlByExternal, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const dataExt = await respExt.json();
      let results: any[] = Array.isArray(dataExt?.results)
        ? dataExt.results
        : [];

      // Si no hubo resultados, intentar por preference_id usando tx.referenciaExterna (id de la preferencia)
      if (!results.length && tx.referenciaExterna) {
        const urlByPref = `${baseUrl}?preference_id=${encodeURIComponent(tx.referenciaExterna)}&sort=date_created&criteria=desc`;
        const respPref = await fetch(urlByPref, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const dataPref = await respPref.json();
        results = Array.isArray(dataPref?.results) ? dataPref.results : [];
      }

      const ultimo: any = results.length ? results[0] : null;
      const estadoPago = String(ultimo?.status || "").toUpperCase();
      console.log("🔎 [MP] Verificación por external_reference/preference:", {
        transaccionId,
        estadoPago,
        paymentId: ultimo?.id,
      });

      if (estadoPago === "APPROVED") {
        const actualizada = await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "COMPLETADA",
            fechaCompletado: new Date(),
            referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ""),
          },
          include: { reserva: true },
        });
        if (actualizada?.reservaId) {
          await this.prisma.reserva.update({
            where: { id: actualizada.reservaId },
            data: { estado: "EN_CURSO" },
          });
        }
        return actualizada;
      }
      if (estadoPago === "PENDING" || estadoPago === "IN_PROCESS") {
        await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "PENDIENTE",
            referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ""),
          },
        });
      } else if (estadoPago === "REJECTED" || estadoPago === "CANCELLED") {
        await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "FALLIDA",
            referenciaExterna: String(ultimo?.id || tx.referenciaExterna || ""),
          },
        });
      }

      // Devolver el estado actual desde DB
      return await this.prisma.transaccion.findUnique({
        where: { id: transaccionId },
        include: { reserva: true },
      });
    } catch (error) {
      console.error("❌ [MP] Error verificando estado por transacción:", error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException("Error verificando estado de pago");
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
          "Falta configurar MP_ACCESS_TOKEN en el entorno",
        );
      }

      const { Payment } = await import("mercadopago");
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      const paymentDetail: any = await payment.get({ id: Number(paymentId) });
      console.log("🧾 [MP Confirm] Detalle de pago:", {
        id: paymentDetail?.id,
        status: paymentDetail?.status,
        external_reference: paymentDetail?.external_reference,
        metadata: paymentDetail?.metadata,
      });

      const transaccionId = paymentDetail?.external_reference;
      if (!transaccionId) {
        throw new NotFoundException(
          "No se encontró transacción asociada al pago",
        );
      }

      const estadoPago = String(paymentDetail?.status || "").toUpperCase();
      if (estadoPago === "APPROVED") {
        const transaccion = await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "COMPLETADA",
            fechaCompletado: new Date(),
            referenciaExterna: String(paymentDetail?.id || ""),
            montoNeto: undefined,
            comisionPlataforma: undefined,
            comisionPasarela: undefined,
          },
        });
        if (transaccion?.reservaId) {
          await this.prisma.reserva.update({
            where: { id: transaccion.reservaId },
            data: { estado: "EN_CURSO" },
          });
        }
      } else if (estadoPago === "PENDING" || estadoPago === "IN_PROCESS") {
        await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "PENDIENTE",
            referenciaExterna: String(paymentDetail?.id || ""),
          },
        });
      } else {
        await this.prisma.transaccion.update({
          where: { id: transaccionId },
          data: {
            estado: "FALLIDA",
            referenciaExterna: String(paymentDetail?.id || ""),
          },
        });
      }

      // Devolver la transacción actualizada para que el frontend pueda decidir la redirección
      return await this.obtenerTransaccion(transaccionId);
    } catch (error) {
      console.error("❌ [MP Confirm] Error confirmando pago:", error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException("Error confirmando pago");
    }
  }
}
