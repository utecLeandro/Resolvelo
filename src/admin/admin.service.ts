import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { RolUsuario } from '@prisma/client';

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
    const roles = Object.values(RolUsuario);
    return {
      roles: roles.map((rol) => ({
        clave: rol,
        nombre: rol.replace(/_/g, ' '), // Formato legible
      })),
    };
  }

  async cambiarEstadoUsuario(id: string, activo: boolean, motivo?: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: BigInt(id) },
      data: {
        activo: activo,
        // TODO: Registrar motivo en log de auditoria si existiera tabla
      },
    });

    return {
      message: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente`,
      usuario: {
        id: usuarioActualizado.id.toString(),
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol,
        activo: usuarioActualizado.activo,
        estadoVerificacion: usuarioActualizado.estadoVerificacion,
        fechaCreacion: usuarioActualizado.fechaCreacion.toISOString(),
      },
    };
  }

  async verificarUsuario(id: string, motivo?: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id: BigInt(id) },
      data: {
        estadoVerificacion: 'VERIFICADA',
        // No modificamos emailVerificado ni telefonoVerificado automáticamente
        // para no interferir con el proceso de verificación propio del usuario
        // TODO: Registrar motivo
      },
    });

    return {
      message: 'Usuario verificado correctamente',
      usuario: {
        id: usuarioActualizado.id.toString(),
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol,
        activo: usuarioActualizado.activo,
        estadoVerificacion: usuarioActualizado.estadoVerificacion,
        fechaCreacion: usuarioActualizado.fechaCreacion.toISOString(),
      },
    };
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
    rol?: string,
    activo?: boolean,
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { apellido: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (rol) {
        where.rol = rol;
      }

      if (typeof activo === 'boolean') {
        where.activo = activo;
      }

      const [total, usuarios] = await Promise.all([
        this.prisma.usuario.count({ where }),
        this.prisma.usuario.findMany({
          where,
          skip,
          take: limit,
          orderBy: { fechaCreacion: 'desc' },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
            fechaCreacion: true,
            telefono: true,
            activo: true,
            estadoVerificacion: true,
          },
        }),
      ]);

      return {
        usuarios: usuarios.map((u) => ({
          id: u.id.toString(),
          nombre: u.nombre,
          apellido: u.apellido,
          email: u.email,
          rol: u.rol,
          activo: u.activo,
          estadoVerificacion: u.estadoVerificacion,
          fechaCreacion: u.fechaCreacion.toISOString(),
        })),
        paginacion: {
          paginaActual: page,
          totalPaginas: Math.ceil(total / limit),
          totalElementos: total,
          elementosPorPagina: limit,
        },
      };
    } catch (error) {
      console.error('Error en listarUsuarios:', error);
      throw error;
    }
  }

  async listarPublicacionesAdmin(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    estado?: string,
    estadoModeracion?: string,
    incluirTodosEstadosModeracion: boolean = false,
    categoria?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where.OR = [
          { titulo: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (categoria) {
        where.categoria = categoria;
      }

      if (estado && estado !== 'TODOS') {
        // Validar que el estado sea válido para evitar errores de Prisma
        const estadosValidos = ['ACTIVA', 'PAUSADA', 'INACTIVA', 'ELIMINADA'];
        if (estadosValidos.includes(estado)) {
          where.estado = estado;
        }
      }

      if (estadoModeracion) {
        where.estadoModeracion = estadoModeracion;
      } else if (!incluirTodosEstadosModeracion) {
        // Por defecto o si no se incluyen todos, quizás mostrar solo pendientes?
        // El frontend parece controlar esto explícitamente, pero si no viene nada:
        // where.estadoModeracion = 'PENDIENTE_REVISION'; 
        // Dejamos que el frontend controle qué ver.
      }

      const [total, publicaciones] = await Promise.all([
        this.prisma.publicacion.count({ where }),
        this.prisma.publicacion.findMany({
          where,
          skip,
          take: limit,
          orderBy: { fechaCreacion: 'desc' },
          include: {
            propietario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        }),
      ]);

      return {
        publicaciones: publicaciones.map((p) => ({
          id: p.id.toString(),
          titulo: p.titulo,
          descripcion: p.descripcion,
          categoria: p.categoria,
          precioPorDia: Number(p.precioPorDia),
          estado: p.estado,
          estadoModeracion: p.estadoModeracion,
          fechaCreacion: p.fechaCreacion.toISOString(),
          propietarioId: p.propietarioId.toString(),
          propietario: {
            id: p.propietario.id.toString(),
            nombre: p.propietario.nombre,
            apellido: p.propietario.apellido,
            email: p.propietario.email,
          },
        })),
        paginacion: {
          paginaActual: page,
          totalPaginas: Math.ceil(total / limit),
          totalElementos: total,
          elementosPorPagina: limit,
        },
      };
    } catch (error) {
      console.error('Error en listarPublicacionesAdmin:', error);
      throw error;
    }
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
                numeroCuenta: this.encryptionService.decrypt(
                  datosBancarios.numeroCuenta,
                ),
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

    if (
      liquidacion.tipo !== 'LIQUIDACION' ||
      liquidacion.estado !== 'PENDIENTE'
    ) {
      throw new NotFoundException(
        'La transacción no es una liquidación pendiente',
      );
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
