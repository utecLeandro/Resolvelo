import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { EstadoTransaccion, RolUsuario } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async obtenerIngresos() {
    const reservas = await this.prisma.reserva.findMany({
      where: {
        estado: 'COMPLETADA',
      },
      include: {
        publicacion: {
          select: {
            titulo: true,
          },
        },
        propietario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
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
      orderBy: {
        fechaFin: 'desc',
      },
    });

    return reservas.map((reserva) => ({
      id: reserva.id.toString(),
      fecha: reserva.fechaFin,
      publicacion: reserva.publicacion.titulo,
      propietario: `${reserva.propietario.nombre} ${reserva.propietario.apellido}`,
      arrendatario: `${reserva.usuario.nombre} ${reserva.usuario.apellido}`,
      montoTotal: reserva.precioTotal,
      comision: reserva.comisionPlataforma,
    }));
  }

  async listarRoles() {
    return Object.values(RolUsuario);
  }

  async cambiarRolUsuario(
    adminId: string | number,
    usuarioObjetivoId: string,
    nuevoRol: RolUsuario,
  ) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(usuarioObjetivoId) },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar el rol
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: BigInt(usuarioObjetivoId) },
      data: {
        rol: nuevoRol,
        fechaAsignacionRol: new Date(),
        asignadoPor: adminId.toString(),
      },
    });

    return {
      success: true,
      message: `Rol de usuario actualizado a ${nuevoRol}`,
      data: {
        id: usuarioActualizado.id.toString(),
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol,
      },
    };
  }

  async listarUsuarios(
    page: number = 1,
    limit: number = 10,
    search: string = '',
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search } }, // Case-insensitive en Postgres por defecto o con mode: 'insensitive' si se configura
        { apellido: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [total, usuarios] = await Promise.all([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaRegistro: 'desc' },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          rol: true,
          fechaRegistro: true,
          telefono: true,
          estado: true,
        },
      }),
    ]);

    return {
      data: usuarios.map((u) => ({
        ...u,
        id: u.id.toString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listarPublicacionesAdmin(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    estado?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.titulo = { contains: search };
    }

    if (estado && estado !== 'TODOS') {
      where.estado = estado;
    }

    const [total, publicaciones] = await Promise.all([
      this.prisma.publicacion.count({ where }),
      this.prisma.publicacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaCreacion: 'desc' },
        include: {
          usuario: {
            select: {
              nombre: true,
              apellido: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      data: publicaciones.map((p) => ({
        id: p.id.toString(),
        titulo: p.titulo,
        descripcion: p.descripcion,
        precioPorDia: p.precioPorDia,
        estado: p.estado,
        fechaCreacion: p.fechaCreacion,
        propietario: {
          nombre: `${p.usuario.nombre} ${p.usuario.apellido}`,
          email: p.usuario.email,
        },
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

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
    return this.mapearLiquidaciones(liquidaciones);
  }

  async obtenerHistorialLiquidaciones() {
    const liquidaciones = await this.prisma.transaccion.findMany({
      where: {
        tipo: 'LIQUIDACION',
        estado: 'COMPLETADA',
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
      orderBy: { fechaCompletado: 'desc' },
    });

    return this.mapearLiquidaciones(liquidaciones);
  }

  private mapearLiquidaciones(liquidaciones: any[]) {
    return liquidaciones.map((liq) => {
      const datosBancarios = liq.reserva.propietario.datosBancarios;
      return {
        id: liq.id,
        monto: liq.monto,
        fechaCreacion: liq.fechaCreacion,
        fechaCompletado: liq.fechaCompletado,
        estado: liq.estado,
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
