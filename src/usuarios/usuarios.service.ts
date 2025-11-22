import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarPerfilDto } from "./dto/actualizar-perfil.dto";

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerPorId(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        ciudad: true,
        departamento: true,
        codigoPostal: true,
        avatarUrl: true,
        perfilPublico: true,
        estadoVerificacion: true,
        documentoIdentidad: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException("Usuario no encontrado");
    }

    return usuario;
  }

  async actualizarPerfil(id: string, data: ActualizarPerfilDto) {
    const tieneCambios = Object.keys(data).length > 0;
    if (!tieneCambios) {
      throw new BadRequestException("No se enviaron cambios para actualizar");
    }

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id },
    });
    if (!usuarioExistente) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: data.nombre ?? undefined,
        apellido: data.apellido ?? undefined,
        telefono: data.telefono ?? undefined,
        direccion: data.direccion ?? undefined,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
      },
    });

    return {
      message: "Perfil actualizado correctamente",
      usuario: actualizado,
    };
  }
}
