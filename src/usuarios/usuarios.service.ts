import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { DatosBancariosDto } from './dto/datos-bancarios.dto';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async obtenerPorId(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
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
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async actualizarPerfil(id: string, data: ActualizarPerfilDto) {
    const tieneCambios = Object.keys(data).length > 0;
    if (!tieneCambios) {
      throw new BadRequestException('No se enviaron cambios para actualizar');
    }

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });
    if (!usuarioExistente) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id: BigInt(id) },
      data: {
        nombre: data.nombre ?? undefined,
        apellido: data.apellido ?? undefined,
        telefono: data.telefono ?? undefined,
        direccion: data.direccion ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        avatarUrl: true,
      },
    });

    return {
      message: 'Perfil actualizado correctamente',
      usuario: actualizado,
    };
  }

  async actualizarAvatar(id: string, avatarUrl: string) {
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id: BigInt(id) },
    });
    if (!usuarioExistente) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const actualizado = await this.prisma.usuario.update({
      where: { id: BigInt(id) },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
    return actualizado;
  }

  async obtenerDatosBancarios(usuarioId: string) {
    const datos = await this.prisma.datosBancarios.findUnique({
      where: { usuarioId: BigInt(usuarioId) },
    });

    if (!datos) {
      return null;
    }

    return {
      banco: datos.banco,
      tipoCuenta: datos.tipoCuenta,
      numeroCuenta: this.encryptionService.decrypt(datos.numeroCuenta),
      moneda: datos.moneda,
      titular: datos.titular,
    };
  }

  async guardarDatosBancarios(usuarioId: string, datos: DatosBancariosDto) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: BigInt(usuarioId) },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const numeroCuentaEncriptado = this.encryptionService.encrypt(datos.numeroCuenta);

    const datosGuardados = await this.prisma.datosBancarios.upsert({
      where: { usuarioId: BigInt(usuarioId) },
      update: {
        banco: datos.banco,
        tipoCuenta: datos.tipoCuenta,
        numeroCuenta: numeroCuentaEncriptado,
        moneda: datos.moneda,
        titular: datos.titular,
      },
      create: {
        usuarioId: BigInt(usuarioId),
        banco: datos.banco,
        tipoCuenta: datos.tipoCuenta,
        numeroCuenta: numeroCuentaEncriptado,
        moneda: datos.moneda,
        titular: datos.titular,
      },
    });

    return {
      message: 'Datos bancarios guardados correctamente',
      datos: {
        banco: datosGuardados.banco,
        tipoCuenta: datosGuardados.tipoCuenta,
        numeroCuenta: '********' + datos.numeroCuenta.slice(-4), // Solo mostramos los últimos 4 dígitos por seguridad en la respuesta
        moneda: datosGuardados.moneda,
        titular: datosGuardados.titular,
      },
    };
  }
}

