import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EnviarMensajeDto } from './dto/enviar-mensaje.dto';

@Injectable()
export class MensajesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  async listarPorReserva(reservaId: string, usuarioId: string) {
    console.log('[MensajesService] listarPorReserva', { reservaId, usuarioId });
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: BigInt(reservaId) },
      include: {
        publicacion: {
          select: {
            id: true,
            titulo: true,
            ciudad: true,
            departamento: true,
            precioPorDia: true,
            imagenes: {
              where: { esPrincipal: true },
              orderBy: { orden: 'asc' },
              take: 1,
              select: { url: true },
            },
          },
        },
        usuario: {
          select: { id: true, nombre: true, apellido: true, avatarUrl: true },
        },
        propietario: {
          select: { id: true, nombre: true, apellido: true, avatarUrl: true },
        },
      },
    });
    if (!reserva) throw new BadRequestException('Reserva no encontrada');
    const usuarioIdBig = BigInt(usuarioId);
    if (
      usuarioIdBig !== reserva.usuarioId &&
      usuarioIdBig !== reserva.propietarioId
    )
      throw new ForbiddenException('Acceso denegado');
    const mensajes = await this.prisma.mensaje.findMany({
      where: { reservaId: BigInt(reservaId) },
      orderBy: { fechaCreacion: 'asc' },
    });

    const esArrendatario = usuarioIdBig === reserva.usuarioId;
    const contraparte = esArrendatario ? reserva.propietario : reserva.usuario;
    const imagenPrincipalUrl = reserva.publicacion?.imagenes?.[0]?.url || null;

    const info = {
      contraparte,
      publicacion: {
        id: reserva.publicacion?.id,
        titulo: reserva.publicacion?.titulo,
        ciudad: reserva.publicacion?.ciudad,
        departamento: reserva.publicacion?.departamento,
        precioPorDia: reserva.publicacion?.precioPorDia
          ? Number(reserva.publicacion.precioPorDia)
          : null,
        imagenPrincipalUrl,
      },
      reserva: {
        id: reservaId,
        fechaInicio: (reserva as any).fechaInicio,
        fechaFin: (reserva as any).fechaFin,
        estado: (reserva as any).estado,
        tipoEntrega: (reserva as any).tipoEntrega,
        direccionEntrega: (reserva as any).direccionEntrega,
        precioTotal: (reserva as any).precioTotal
          ? Number((reserva as any).precioTotal)
          : null,
      },
      yo: {
        id: usuarioIdBig,
        rol: esArrendatario ? 'ARRENDATARIO' : 'PROPIETARIO',
      },
    };
    return { mensajes, info };
  }

  async marcarLeidos(reservaId: string, usuarioId: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: BigInt(reservaId) },
      select: { usuarioId: true, propietarioId: true },
    });
    if (!reserva) throw new BadRequestException('Reserva no encontrada');
    const usuarioIdBig = BigInt(usuarioId);
    if (
      usuarioIdBig !== reserva.usuarioId &&
      usuarioIdBig !== reserva.propietarioId
    )
      throw new ForbiddenException('Acceso denegado');
    await this.prisma.mensaje.updateMany({
      where: {
        reservaId: BigInt(reservaId),
        receptorId: usuarioIdBig,
        leido: false,
      },
      data: { leido: true, fechaLectura: new Date() },
    });
    return { ok: true };
  }

  async enviarMensaje(dto: EnviarMensajeDto, emisorId: string) {
    console.log('[MensajesService] enviarMensaje', { dto, emisorId });
    const contenido = (dto.contenido || '').trim();
    if (!contenido || contenido.length > 2000)
      throw new BadRequestException('Contenido inválido');
    if (/<script/i.test(contenido))
      throw new BadRequestException('Contenido no permitido');

    const reserva = await this.prisma.reserva.findUnique({
      where: { id: BigInt(dto.reservaId) },
      select: {
        id: true,
        usuarioId: true,
        propietarioId: true,
        publicacionId: true,
      },
    });
    if (!reserva) throw new BadRequestException('Reserva no encontrada');
    if (
      BigInt(emisorId) !== reserva.usuarioId &&
      BigInt(emisorId) !== reserva.propietarioId
    )
      throw new ForbiddenException('No autorizado');

    const ahora = new Date();
    const haceUnMin = new Date(ahora.getTime() - 60 * 1000);
    const enviadosUltimoMinuto = await this.prisma.mensaje.count({
      where: { emisorId: BigInt(emisorId), fechaCreacion: { gte: haceUnMin } },
    });
    if (enviadosUltimoMinuto >= 5)
      throw new HttpException(
        'Demasiados mensajes en poco tiempo',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    const receptorId =
      dto.receptorId && dto.receptorId.length > 0
        ? dto.receptorId
        : BigInt(emisorId) === reserva.usuarioId
          ? reserva.propietarioId
          : reserva.usuarioId;
    const mensaje = await this.prisma.mensaje.create({
      data: {
        contenido,
        emisorId: BigInt(emisorId),
        receptorId:
          typeof receptorId === 'bigint' ? receptorId : BigInt(receptorId),
        reservaId: reserva.id,
      },
    });
    console.log('[MensajesService] creado', {
      id: mensaje.id,
      reservaId: reserva.id,
      emisorId,
      receptorId,
    });

    const totalMensajes = await this.prisma.mensaje.count({
      where: { reservaId: reserva.id },
    });
    if (totalMensajes === 1) {
      this.enviarEmailNotificacionPrimerMensaje(
        String(reserva.id),
        String(receptorId),
        String(mensaje.id),
      ).catch(() => {});
    }
    return { mensaje };
  }

  async enviarEmailNotificacionPrimerMensaje(
    reservaId: string,
    receptorId: string,
    mensajeId: string,
  ) {
    try {
      const reserva = await this.prisma.reserva.findUnique({
        where: { id: BigInt(reservaId) },
        include: { publicacion: { select: { titulo: true } } },
      });
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5174';
      const link = `${frontendBase}/mensajes/reserva/${encodeURIComponent(reservaId)}?m=${encodeURIComponent(mensajeId)}`;
      const asunto = `Nuevo mensaje sobre "${reserva?.publicacion?.titulo || 'tu reserva'}"`;
      const html = `<p>Tienes nuevos mensajes sin leer.</p><p><a href="${link}">Abrir chat</a></p>`;
      await this.notificaciones.enviarEmail(receptorId, asunto, html);
    } catch (e) {
      console.warn(
        'Fallo al enviar email de notificación:',
        (e as any)?.message,
      );
    }
  }

  async listarMisConversaciones(usuarioId: string) {
    console.log('[MensajesService] listarMisConversaciones', { usuarioId });
    const reservas = await this.prisma.reserva.findMany({
      where: {
        OR: [
          { usuarioId: BigInt(usuarioId) },
          { propietarioId: BigInt(usuarioId) },
        ],
      },
      include: {
        publicacion: {
          select: {
            id: true,
            titulo: true,
            imagenes: {
              where: { esPrincipal: true },
              orderBy: { orden: 'asc' },
              take: 1,
              select: { url: true },
            },
          },
        },
        usuario: {
          select: { id: true, nombre: true, apellido: true, avatarUrl: true },
        },
        propietario: {
          select: { id: true, nombre: true, apellido: true, avatarUrl: true },
        },
        mensajes: { orderBy: { fechaCreacion: 'desc' }, take: 1 },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    const conUnread = await Promise.all(
      reservas.map(async (r) => {
        const noLeidos = await this.prisma.mensaje.count({
          where: {
            reservaId: r.id,
            receptorId: BigInt(usuarioId),
            leido: false,
          },
        });
        const esArrendatario = BigInt(usuarioId) === r.usuarioId;
        const contraparte = esArrendatario ? r.propietario : r.usuario;
        const imagenPrincipalUrl = r.publicacion?.imagenes?.[0]?.url || null;
        return {
          reservaId: r.id,
          publicacion: {
            id: r.publicacion?.id,
            titulo: r.publicacion?.titulo,
            imagenPrincipalUrl,
          },
          ultimoMensaje: r.mensajes[0] || null,
          noLeidos,
          contraparte,
        };
      }),
    );
    return { conversaciones: conUnread };
  }
}
