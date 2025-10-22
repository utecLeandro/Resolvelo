/**
 * Servicio de autenticación.
 * Maneja lógica de registro con hash + salt y verificación mock.
 */
import { Injectable, UnauthorizedException, NotFoundException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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

      // Generar token JWT real
      const payload = { sub: usuario.id, email: usuario.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
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
      // BD no disponible (Prisma no puede conectar)
      if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
        throw new ServiceUnavailableException('Base de datos no disponible. Verifica la conexión a RDS o la configuración de DATABASE_URL.');
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
    try {
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

      // Generar token JWT real
      const payload = { sub: usuario.id, email: usuario.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          estadoVerificacion: usuario.estadoVerificacion,
          emailVerificado: usuario.emailVerificado,
        },
      };
    } catch (error: any) {
      if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
        throw new ServiceUnavailableException('Base de datos no disponible. Verifica la conexión a RDS o la configuración de DATABASE_URL.');
      }
      throw error;
    }
  }

  /**
   * Obtiene el perfil del usuario a partir del encabezado Authorization con token JWT.
   */
  async obtenerPerfilDesdeToken(authHeader: string) {
    try {
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : authHeader;

      if (!token) {
        throw new UnauthorizedException('Token no proporcionado');
      }

      // Verificar y decodificar el token JWT
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Token inválido');
      }

      const usuario = await this.prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          direccion: true,
          avatarUrl: true,
          calificacionPromedio: true,
          totalCalificaciones: true,
          documentoIdentidad: true,
        },
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return usuario;
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
        throw new ServiceUnavailableException('Base de datos no disponible. Verifica la conexión a RDS o la configuración de DATABASE_URL.');
      }
      throw error;
    }
  }
}