import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subject } from 'rxjs';
import * as nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class NotificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  private sse = new Subject<{ usuarioId: string; data: any }>();

  get stream() {
    return this.sse.asObservable();
  }

  emitir(usuarioId: string | number | bigint, data: any) {
    try {
      this.sse.next({ usuarioId: String(usuarioId), data });
    } catch {}
  }

  async listar(usuarioId: string | number | bigint) {
    if (!usuarioId) throw new BadRequestException('Usuario no autenticado');
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
      },
      select: { fechaUltimoAcceso: true },
    });
    const ultimoVisto = usuario?.fechaUltimoAcceso ?? new Date(0);

    const reservasRecibidas = await this.prisma.reserva.findMany({
      where: {
        propietarioId:
          typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
      },
      orderBy: { fechaCreacion: 'desc' },
      take: 20,
      select: {
        id: true,
        fechaCreacion: true,
        fechaInicio: true,
        fechaFin: true,
        estado: true,
        usuario: { select: { id: true, nombre: true, apellido: true } },
        publicacion: {
          select: {
            id: true,
            titulo: true,
            categoria: true,
            marca: true,
            modelo: true,
          },
        },
      },
    });

    const reservasActualizadas = await this.prisma.reserva.findMany({
      where: {
        OR: [
          {
            usuarioId:
              typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
          },
          {
            propietarioId:
              typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
          },
        ],
        fechaActualizacion: { gt: ultimoVisto },
      },
      orderBy: { fechaActualizacion: 'desc' },
      take: 20,
      select: {
        id: true,
        fechaActualizacion: true,
        estado: true,
        usuarioId: true,
        propietarioId: true,
        publicacion: { select: { id: true, titulo: true } },
      },
    });

    const mensajes = await this.prisma.mensaje.findMany({
      where: {
        receptorId:
          typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
      },
      orderBy: { fechaCreacion: 'desc' },
      take: 20,
      select: {
        id: true,
        contenido: true,
        fechaCreacion: true,
        leido: true,
        reservaId: true,
        emisor: {
          select: { id: true, nombre: true, apellido: true, avatarUrl: true },
        },
      },
    });

    const calificaciones = await this.prisma.calificacion.findMany({
      where: {
        publicacion: {
          propietarioId:
            typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
        },
      },
      orderBy: { fechaCreacion: 'desc' },
      take: 20,
      select: {
        id: true,
        puntuacion: true,
        comentario: true,
        fechaCreacion: true,
        publicacion: { select: { id: true, titulo: true } },
        usuarioCalificador: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    const moderaciones = await this.prisma.moderaccionPublicacion.findMany({
      where: {
        publicacion: {
          propietarioId:
            typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
        },
      },
      orderBy: { fechaCreacion: 'desc' },
      take: 20,
      select: {
        id: true,
        accion: true,
        estadoNuevo: true,
        motivo: true,
        comentarios: true,
        fechaCreacion: true,
        publicacion: { select: { id: true, titulo: true } },
      },
    });

    const items = [
      ...reservasRecibidas.map((r) => ({
        id: `res_${r.id}`,
        tipo: 'PUBLICACION_EVENTO',
        titulo: `Nueva reserva en \"${r.publicacion?.titulo ?? ''}\"`,
        mensaje:
          `${r.usuario?.nombre ?? ''} ${r.usuario?.apellido ?? ''} reservó del ${new Date(r.fechaInicio).toLocaleDateString()} al ${new Date(r.fechaFin).toLocaleDateString()}${r.publicacion?.marca || r.publicacion?.modelo ? ` · ${[r.publicacion?.marca, r.publicacion?.modelo].filter(Boolean).join(' ')}` : ''}`.trim(),
        timestamp: r.fechaCreacion,
        read: r.fechaCreacion <= ultimoVisto,
        icon: 'bell',
        data: { reservaId: r.id, publicacionId: r.publicacion?.id },
      })),
      ...reservasActualizadas.map((r) => ({
        id: `res_estado_${r.id}_${r.estado}`,
        tipo: 'PUBLICACION_EVENTO',
        titulo: `Reserva \"${r.publicacion?.titulo ?? ''}\"`,
        mensaje: `Estado actualizado a ${r.estado}`,
        timestamp: r.fechaActualizacion,
        read: r.fechaActualizacion <= ultimoVisto,
        icon: 'document',
        data: { reservaId: r.id, publicacionId: r.publicacion?.id },
      })),
      ...mensajes.map((m) => ({
        id: `msg_${m.id}`,
        tipo: 'MENSAJE',
        titulo:
          `Nuevo mensaje de ${m.emisor?.nombre ?? ''} ${m.emisor?.apellido ?? ''}`.trim(),
        mensaje: m.contenido,
        timestamp: m.fechaCreacion,
        read: !!m.leido,
        icon: 'bell',
        data: { reservaId: m.reservaId, emisorId: m.emisor?.id },
      })),
      ...calificaciones.map((c) => ({
        id: `cal_${c.id}`,
        tipo: 'RESEÑA',
        titulo: `Nueva reseña en "${c.publicacion?.titulo ?? ''}"`,
        mensaje:
          `${c.usuarioCalificador?.nombre ?? ''} ${c.usuarioCalificador?.apellido ?? ''} calificó ${c.puntuacion}/5${c.comentario ? ': ' + c.comentario : ''}`.trim(),
        timestamp: c.fechaCreacion,
        read: c.fechaCreacion <= ultimoVisto,
        icon: 'star',
        data: { publicacionId: c.publicacion?.id },
      })),
      ...moderaciones.map((m) => ({
        id: `mod_${m.id}`,
        tipo: 'PUBLICACION_EVENTO',
        titulo: `Moderación de publicación "${m.publicacion?.titulo ?? ''}"`,
        mensaje:
          `${m.accion} → ${m.estadoNuevo}${m.motivo ? ' (' + m.motivo + ')' : ''}`.trim(),
        timestamp: m.fechaCreacion,
        read: m.fechaCreacion <= ultimoVisto,
        icon: 'document',
        data: { publicacionId: m.publicacion?.id },
      })),
    ];

    items.sort(
      (a: any, b: any) =>
        new Date(b.timestamp as any).getTime() -
        new Date(a.timestamp as any).getTime(),
    );

    const noLeidas = items.filter((i) => !i.read).length;
    return { items, noLeidas };
  }

  async marcarLeidas(usuarioId: string | number | bigint) {
    if (!usuarioId) throw new BadRequestException('Usuario no autenticado');
    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: {
          id: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
        },
        data: { fechaUltimoAcceso: new Date() },
      }),
      this.prisma.mensaje.updateMany({
        where: {
          receptorId:
            typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
          leido: false,
        },
        data: { leido: true, fechaLectura: new Date() },
      }),
    ]);
    return { ok: true };
  }

  async enviarEmail(
    usuarioId: string | number | bigint,
    asunto: string,
    html: string,
  ) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: {
          id: typeof usuarioId === 'bigint' ? usuarioId : BigInt(usuarioId),
        },
        select: { email: true, nombre: true, notificacionesEmail: true },
      });
      if (!usuario?.email || usuario?.notificacionesEmail === false) return;
      const from = (process.env.EMAIL_FROM || 'noreply@resolvelo.com').trim();
      const region = (process.env.AWS_REGION || 'us-east-1').trim();
      try {
        const ses = new SESClient({ region });
        const command = new SendEmailCommand({
          Source: from,
          Destination: { ToAddresses: [usuario.email] },
          Message: {
            Subject: { Data: asunto, Charset: 'UTF-8' },
            Body: { Html: { Data: html, Charset: 'UTF-8' } },
          },
        });
        await ses.send(command);
      } catch (_e1) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '127.0.0.1',
            port: Number(process.env.SMTP_PORT || 1025),
            secure: false,
            auth:
              process.env.SMTP_USER && process.env.SMTP_PASS
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                : undefined,
            connectionTimeout: 2000,
            greetingTimeout: 2000,
            socketTimeout: 3000,
          });
          await transporter.sendMail({
            from,
            to: usuario.email,
            subject: asunto,
            html,
          });
        } catch (e2) {
          try {
            console.warn('[Notificaciones] fallo email', (e2 as any)?.message);
          } catch {}
        }
      }
    } catch (e) {
      try {
        console.warn('[Notificaciones] fallo email', (e as any)?.message);
      } catch {}
    }
  }

  async emitirReservaNueva(propietarioId: string, reserva: any) {
    const item = {
      id: `res_nueva_${reserva.id}`,
      tipo: 'PUBLICACION_EVENTO',
      titulo: `Nueva reserva en "${reserva.publicacion?.titulo ?? ''}"`,
      mensaje:
        `${reserva.usuario?.nombre ?? 'Usuario'} ${reserva.usuario?.apellido ?? ''} reservó el ${new Date().toLocaleString()} · del ${new Date(reserva.fechaInicio).toLocaleDateString()} al ${new Date(reserva.fechaFin).toLocaleDateString()}${reserva.publicacion?.marca || reserva.publicacion?.modelo ? ` · ${[reserva.publicacion?.marca, reserva.publicacion?.modelo].filter(Boolean).join(' ')}` : ''}`.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      icon: 'bell',
      data: { reservaId: reserva.id, publicacionId: reserva.publicacion?.id },
    };
    this.emitir(propietarioId, { tipo: 'PUSH', item });
    const originFromCors = process.env.CORS_ORIGIN?.split(',')[0]?.trim();
    const frontendBase = (
      process.env.FRONTEND_URL ||
      originFromCors ||
      'https://develop.d2jhmkfagiypdq.amplifyapp.com'
    ).replace(/\/$/, '');
    const link = `${frontendBase}/mis-publicaciones?pub=${encodeURIComponent(String(reserva.publicacion?.id))}`;
    const html = `
      <p>Tienes una nueva solicitud de reserva.</p>
      <p><strong>Reservó:</strong> ${reserva.usuario?.nombre ?? 'Usuario'} ${reserva.usuario?.apellido ?? ''}</p>
      <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Equipo:</strong> ${reserva.publicacion?.titulo ?? ''}${reserva.publicacion?.marca || reserva.publicacion?.modelo ? ` · ${[reserva.publicacion?.marca, reserva.publicacion?.modelo].filter(Boolean).join(' ')}` : ''}</p>
      <p><strong>Periodo:</strong> ${new Date(reserva.fechaInicio).toLocaleDateString()} → ${new Date(reserva.fechaFin).toLocaleDateString()}</p>
      <p><a href="${link}">Ver detalles</a></p>
    `;
    await this.enviarEmail(propietarioId, 'Nueva solicitud de reserva', html);
  }

  async emitirCambioEstado(
    reserva: any,
    anterior: string | null,
    actual: string,
  ) {
    const baseTitulo = `Reserva "${reserva.publicacion?.titulo ?? ''}"`;
    const texto = `Estado: ${anterior ?? 'PENDIENTE'} → ${actual}`;
    const item = {
      id: `res_estado_${reserva.id}_${actual}`,
      tipo: 'PUBLICACION_EVENTO',
      titulo: baseTitulo,
      mensaje: texto,
      timestamp: new Date().toISOString(),
      read: false,
      icon: 'document',
      data: { reservaId: reserva.id, publicacionId: reserva.publicacion?.id },
    };
    this.emitir(reserva.propietarioId, { tipo: 'PUSH', item });
    this.emitir(reserva.usuarioId, { tipo: 'PUSH', item });
    const originFromCors = process.env.CORS_ORIGIN?.split(',')[0]?.trim();
    const frontendBase = (
      process.env.FRONTEND_URL ||
      originFromCors ||
      'https://develop.d2jhmkfagiypdq.amplifyapp.com'
    ).replace(/\/$/, '');
    const linkArrendatario = `${frontendBase}/mis-reservas`;
    const linkPropietario = `${frontendBase}/mis-publicaciones?pub=${encodeURIComponent(String(reserva.publicacion?.id))}`;
    await this.enviarEmail(
      reserva.usuarioId,
      `Actualización de reserva: ${actual}`,
      `<p>Tu reserva cambió de estado.</p><p><a href="${linkArrendatario}">Ver</a></p>`,
    );
    await this.enviarEmail(
      reserva.propietarioId,
      `Actualización de reserva: ${actual}`,
      `<p>Una de tus reservas cambió de estado.</p><p><a href="${linkPropietario}">Ver</a></p>`,
    );
  }

  async emitirPagoCompletado(reserva: any, transaccion: any) {
    const titulo = `Pago confirmado en "${reserva.publicacion?.titulo ?? ''}"`;
    const fecha = transaccion?.fechaCompletado
      ? new Date(transaccion.fechaCompletado)
      : new Date();
    const item = {
      id: `res_pago_${reserva.id}_${transaccion?.id ?? ''}`,
      tipo: 'PUBLICACION_EVENTO',
      titulo,
      mensaje: `El arrendatario pagó la reserva el ${fecha.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      read: false,
      icon: 'document',
      data: {
        reservaId: reserva.id,
        publicacionId: reserva.publicacion?.id,
        transaccionId: transaccion?.id,
      },
    };
    this.emitir(reserva.propietarioId, { tipo: 'PUSH', item });
    const originFromCors = process.env.CORS_ORIGIN?.split(',')[0]?.trim();
    const frontendBase = (
      process.env.FRONTEND_URL ||
      originFromCors ||
      'https://develop.d2jhmkfagiypdq.amplifyapp.com'
    ).replace(/\/$/, '');
    const link = `${frontendBase}/mis-publicaciones?pub=${encodeURIComponent(String(reserva.publicacion?.id))}`;
    const html = `
      <p>Se confirmó el pago de una reserva.</p>
      <p><strong>Fecha y hora:</strong> ${fecha.toLocaleString()}</p>
      <p><strong>Equipo:</strong> ${reserva.publicacion?.titulo ?? ''}</p>
      <p><a href="${link}">Ver detalles</a></p>
    `;
    await this.enviarEmail(
      reserva.propietarioId,
      'Pago confirmado de reserva',
      html,
    );
  }
}
