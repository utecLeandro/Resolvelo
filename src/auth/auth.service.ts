/**
 * Servicio de autenticación.
 * Maneja lógica de registro con hash + salt y verificación mock.
 */
import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un usuario con email y contraseña aplicando OWASP: hash + salt.
   * Inicialmente en estado pendiente de verificación.
   */
  async register(data: RegisterDto) {
    try {
      // Generar salt único por usuario
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12', 10));
      // Hashear contraseña con bcrypt y salt
      const passwordHash = await bcrypt.hash(data.password, salt);

      // Crear usuario en la base de datos usando Prisma
      const usuario = await this.prisma.usuario.create({
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          telefono: data.telefono || null,
          documentoIdentidad: data.documentoIdentidad,
          passwordHash,
          passwordSalt: salt,
          estadoVerificacion: 'PENDIENTE',
          emailVerificado: false,
          telefonoVerificado: false,
          perfilPublico: true,
          activo: true,
        },
      });

      // Simular servicio externo de verificación (por ahora responde OK)
      const verificationOk = true; // mock

      // Generar token JWT mock (en el futuro usar @nestjs/jwt)
      const mockToken = `mock_jwt_token_${usuario.id}_${Date.now()}`;

      return {
        access_token: mockToken,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          estadoVerificacion: usuario.estadoVerificacion,
          emailVerificado: usuario.emailVerificado,
        },
        message: 'Cuenta creada. Verificación pendiente.',
        verification: verificationOk ? 'OK' : 'FAILED',
      };
    } catch (error: any) {
      // Manejar error de email duplicado
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException('El email ya está registrado');
      }
      // Re-lanzar otros errores
      throw error;
    }
  }

  /**
   * Autentica un usuario con email y contraseña
   * Valida credenciales y genera token JWT (mock por ahora)
   */
  async login(data: LoginDto) {
    // Buscar usuario por email
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // Verificar contraseña usando bcrypt
    const passwordValida = await bcrypt.compare(data.password, usuario.passwordHash);
    
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Generar token JWT (mock por ahora - en el futuro usar @nestjs/jwt)
    const mockToken = `mock_jwt_token_${usuario.id}_${Date.now()}`;

    return {
      access_token: mockToken,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        estadoVerificacion: usuario.estadoVerificacion,
        emailVerificado: usuario.emailVerificado,
      },
    };
  }
}