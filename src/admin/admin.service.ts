import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listarUsuarios(params: {
    pagina?: number;
    limite?: number;
    busqueda?: string;
    rol?: string;
    activo?: string;
  }) {
    const pagina = Math.max(1, params.pagina ?? 1);
    const limite = Math.min(100, Math.max(1, params.limite ?? 20));
    const skip = (pagina - 1) * limite;

    const where: any = {};
    if (params.busqueda) {
      const q = params.busqueda.trim();
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { apellido: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { documentoIdentidad: { contains: q } },
      ];
    }
    if (params.rol) {
      where.rol = params.rol;
    }
    if (params.activo === 'true' || params.activo === 'false') {
      where.activo = params.activo === 'true';
    }

    const [totalElementos, usuarios] = await Promise.all([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limite,
        orderBy: { fechaCreacion: 'desc' },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          rol: true,
          activo: true,
          estadoVerificacion: true,
          fechaCreacion: true,
        },
      }),
    ]);

    return {
      usuarios,
      paginacion: {
        paginaActual: pagina,
        totalPaginas: Math.ceil(totalElementos / limite),
        totalElementos,
        elementosPorPagina: limite,
      },
    };
  }

  async cambiarEstadoUsuario(adminUsuarioId: string, objetivoUsuarioId: string, activo: boolean, motivo?: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: objetivoUsuarioId } });
    if (!usuario) {
      throw new NotFoundException('Usuario objetivo no encontrado');
    }

    if (usuario.activo === activo) {
      throw new BadRequestException(`El usuario ya está ${activo ? 'habilitado' : 'deshabilitado'}`);
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id: objetivoUsuarioId },
      data: { activo },
      select: { id: true, nombre: true, apellido: true, email: true, rol: true, activo: true },
    });

    // Registrar acción administrativa
    // Buscar el registro del administrador (si existe)
    const admin = await this.prisma.administrador.findUnique({ where: { usuarioId: adminUsuarioId } });
    const tipo = activo ? 'MODIFICAR_USUARIO' : 'SUSPENDER_USUARIO';

    if (admin) {
      await this.prisma.accionAdministrativa.create({
        data: {
          tipo: tipo as any,
          descripcion: activo ? 'Habilitar usuario' : 'Deshabilitar usuario',
          detalles: motivo || null,
          usuarioObjetivoId: objetivoUsuarioId,
          administradorId: admin.id,
          exitosa: true,
        },
      });
    }

    return { message: 'Estado de usuario actualizado', usuario: actualizado };
  }

  async verificarUsuario(adminUsuarioId: string, objetivoUsuarioId: string, motivo?: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: objetivoUsuarioId } });
    if (!usuario) {
      throw new NotFoundException('Usuario objetivo no encontrado');
    }

    if (usuario.estadoVerificacion === 'VERIFICADA') {
      throw new BadRequestException('El usuario ya está verificado');
    }
    if (usuario.estadoVerificacion !== 'PENDIENTE') {
      throw new BadRequestException(`No se puede verificar un usuario con estado '${usuario.estadoVerificacion}'.`);
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id: objetivoUsuarioId },
      data: { estadoVerificacion: 'VERIFICADA' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        estadoVerificacion: true,
        fechaCreacion: true,
      },
    });

    const admin = await this.prisma.administrador.findUnique({ where: { usuarioId: adminUsuarioId } });
    if (admin) {
      await this.prisma.accionAdministrativa.create({
        data: {
          tipo: 'MODIFICAR_USUARIO' as any,
          descripcion: 'Verificar usuario',
          detalles: motivo || null,
          usuarioObjetivoId: objetivoUsuarioId,
          administradorId: admin.id,
          exitosa: true,
        },
      });
    }

    return { message: 'Usuario verificado correctamente', usuario: actualizado };
  }
}