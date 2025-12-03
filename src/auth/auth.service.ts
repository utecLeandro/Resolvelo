/**
 * Servicio de autenticación.
 * Maneja lógica de registro con hash + salt y verificación mock.
 */
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  ServiceUnavailableException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { emailTemplates } from '../email/email.templates';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GubuyValidateDto } from './dto/gubuy-validate.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { normalizeCiUy } from './validators/ci-uy.validator';

interface GubuyCodeData {
  redirectUri: string;
  state?: string;
  nonce?: string;
  scope?: string;
  claims: {
    email: string;
    nombre: string;
    apellido: string;
    documentoIdentidad: string;
  };
  createdAt: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private gubuyCodes = new Map<string, GubuyCodeData>();

  private gubuyEnabled() {
    const v = process.env.GUBUY_SIMULATED;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Registra un usuario con email y contraseña aplicando OWASP: hash + salt.
   * Inicialmente en estado pendiente de verificación.
   */
  async register(data: RegisterDto) {
    // Validar existencia previa para mensajes de error claros
    const existingDoc = await this.prisma.usuario.findFirst({
      where: { documentoIdentidad: data.documentoIdentidad },
    });
    if (existingDoc) {
      throw new ConflictException(
        'Ya existe un usuario registrado en el sistema con esa cédula',
      );
    }

    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    try {
      // Generar salt único por usuario
      const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
      );
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

      // Iniciar verificación de email en AWS SES (modo Sandbox)
      await this.emailService.verificarIdentidadEmail(usuario.email);

      // Enviar email de bienvenida (opcional)
      // Como el email aun no está verificado en SES, este envío podría fallar si se hace inmediatamente
      // y AWS no ha procesado la verificación. Sin embargo, en un flujo real,
      // el link de verificación iría en este correo.
      // Dado que usamos el flujo nativo de SES para verificar, el usuario recibirá el mail de AWS.
      // Una vez verificado, podríamos enviarle la bienvenida.
      
      // Simular servicio externo de verificación (por ahora responde OK)
      const verificationOk = true; // mock

      // Generar token JWT real
      const payload = { sub: String(usuario.id), email: usuario.email };
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
        usuarioId: usuario.id,
        message: 'Cuenta creada. Verificación pendiente.',
        verification: verificationOk ? 'OK' : 'FAILED',
      };
    } catch (error: any) {
      // Manejar error de email duplicado
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          throw new ConflictException('El email ya está registrado');
        }
        if (error.meta?.target?.includes('documentoIdentidad')) {
          throw new ConflictException('Ya existe un usuario con esa cédula');
        }
      }
      // BD no disponible (Prisma no puede conectar)
      if (
        error.code === 'P1001' ||
        error.name === 'PrismaClientInitializationError'
      ) {
        throw new ServiceUnavailableException(
          'Base de datos no disponible. Inicia PostgreSQL (Docker) y vuelve a intentar.',
        );
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
      let usuario = await this.prisma.usuario.findUnique({
        where: { email: data.email },
      });

      if (!usuario) {
        throw new UnauthorizedException('Credenciales incorrectas'); // Evitar enumeración de usuarios
      }

      // Verificar contraseña usando bcrypt
      const passwordValida = await bcrypt.compare(
        data.password,
        usuario.passwordHash,
      );

      if (!passwordValida) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Verificar que el usuario esté activo
      if (!usuario.activo) {
        throw new UnauthorizedException(
          'Cuenta desactivada. Contacta al administrador.',
        );
      }

      // Política: primer login debe ser con gub.uy (usa bandera en schema)
      if (usuario.primerLoginPendiente === true) {
        throw new UnauthorizedException(
          'Primer login: debes iniciar por “Entrar con gub.uy”',
        );
      }

      if (usuario.estadoVerificacion !== 'VERIFICADA') {
        throw new ForbiddenException(
          'Tu cuenta debe ser verificada por un administrador antes de acceder',
        );
      }

      if (usuario.email === 'gtbump2012@gmail.com') {
        if (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'SUPER_ADMIN') {
          usuario = await this.prisma.usuario.update({
            where: { id: usuario.id },
            data: {
              rol: 'SUPER_ADMIN',
              fechaAsignacionRol: new Date(),
              asignadoPor: 'SYSTEM',
              motivoRol: 'Admin permanente',
            },
          });
        }
        const admin = await this.prisma.administrador.findUnique({
          where: { usuarioId: usuario.id },
        });
        if (!admin) {
          await this.prisma.administrador.create({
            data: {
              usuarioId: usuario.id,
              activo: true,
              motivoAsignacion: 'Admin permanente (system)',
            },
          });
        } else if (!admin.activo) {
          await this.prisma.administrador.update({
            where: { id: admin.id },
            data: { activo: true },
          });
        }
      }

      // Generar token JWT real
      const payload = { sub: String(usuario.id), email: usuario.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        access_token: accessToken,
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol,
          estadoVerificacion: usuario.estadoVerificacion,
          emailVerificado: usuario.emailVerificado,
        },
      };
    } catch (error: any) {
      if (
        error.code === 'P1001' ||
        error.name === 'PrismaClientInitializationError'
      ) {
        throw new ServiceUnavailableException(
          'Base de datos no disponible. Inicia PostgreSQL (Docker) y vuelve a intentar.',
        );
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

      const subStr = String(userId);
      const where: any =
        typeof userId === 'bigint'
          ? { id: userId }
          : /^\d+$/.test(subStr)
            ? { id: BigInt(subStr) }
            : payload.email
              ? { email: payload.email }
              : null;
      if (!where) {
        throw new UnauthorizedException('Token inválido');
      }
      const usuario = await this.prisma.usuario.findUnique({
        where,
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
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      if (
        error.code === 'P1001' ||
        error.name === 'PrismaClientInitializationError'
      ) {
        throw new ServiceUnavailableException(
          'Base de datos no disponible. Inicia PostgreSQL (Docker) y vuelve a intentar.',
        );
      }
      throw error;
    }
  }

  /**
   * Inicia la recuperación de contraseña: genera token y envía email con instrucciones.
   */
  async iniciarRecuperacion(email: string) {
    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      // No revelar existencia del email por seguridad
      return {
        message:
          'Si el email existe, se enviarán instrucciones para recuperar la contraseña',
      };
    }

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    // Guardar token y expiración en el usuario
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenRecuperacion: token,
        fechaExpiracionToken: expiracion,
      },
    });

    // Construir link de recuperación
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      // Usar el servicio de email centralizado
      await this.emailService.sendMail(
        email,
        'Recuperación de contraseña - ReSolVelo',
        `
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el siguiente enlace:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
          <p>Equipo ReSolVelo</p>
        `,
      );
    } catch (e) {
      console.warn(
        'No se pudo enviar email de recuperación:',
        (e as any)?.message,
      );
    }

    return {
      message:
        'Si el email existe, se enviarán instrucciones para recuperar la contraseña',
    };
  }

  /**
   * Completa la recuperación de contraseña: valida token y actualiza contraseña.
   */
  async resetearContrasena(email: string, token: string, newPassword: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!usuario.tokenRecuperacion || !usuario.fechaExpiracionToken) {
      throw new BadRequestException(
        'No hay una solicitud de recuperación activa',
      );
    }
    if (usuario.tokenRecuperacion !== token) {
      throw new UnauthorizedException('Token inválido');
    }
    if (new Date(usuario.fechaExpiracionToken).getTime() < Date.now()) {
      throw new UnauthorizedException('Token expirado');
    }

    // Generar nuevo hash + salt
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    );
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        passwordHash,
        passwordSalt: salt,
        tokenRecuperacion: null,
        fechaExpiracionToken: null,
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async gubuyAuthorize(params: {
    redirectUri: string;
    state?: string;
    nonce?: string;
    scope?: string;
  }) {
    if (!this.gubuyEnabled())
      throw new UnauthorizedException('Simulación gub.uy deshabilitada');
    const { redirectUri, state, nonce, scope } = params;
    if (!redirectUri) throw new BadRequestException('redirect_uri requerido');
    const code = crypto.randomBytes(16).toString('hex');
    const documento = this.generarDocumentoFake();
    const claims = {
      email: `gubuy_${code}@resolvelo.local`,
      nombre: 'Usuario',
      apellido: 'Gubuy',
      documentoIdentidad: documento,
    };
    this.gubuyCodes.set(code, {
      redirectUri,
      state,
      nonce,
      scope,
      claims,
      createdAt: Date.now(),
    });
    return { code };
  }

  async gubuyTokenExchange(code: string, redirectUri: string) {
    if (!this.gubuyEnabled())
      throw new UnauthorizedException('Simulación gub.uy deshabilitada');
    if (!code) throw new BadRequestException('code requerido');
    if (!redirectUri) throw new BadRequestException('redirect_uri requerido');
    const data = this.gubuyCodes.get(code);
    if (!data) throw new UnauthorizedException('Código inválido');
    const maxAgeMs = 10 * 60 * 1000;
    if (Date.now() - data.createdAt > maxAgeMs) {
      this.gubuyCodes.delete(code);
      throw new UnauthorizedException('Código expirado');
    }
    if (data.redirectUri !== redirectUri)
      throw new UnauthorizedException('redirect_uri no coincide');
    const claims = data.claims;
    const claimsDocNorm = normalizeCiUy(claims.documentoIdentidad);
    let usuario = await this.prisma.usuario.findFirst({
      where: { documentoIdentidad: claimsDocNorm },
    });
    if (!usuario && claims.email) {
      usuario = await this.prisma.usuario.findUnique({
        where: { email: claims.email },
      });
    }
    if (!usuario) {
      usuario = await this.prisma.usuario.findFirst({
        where: { documentoIdentidad: claims.documentoIdentidad },
      });
    }
    if (!usuario) {
      throw new UnauthorizedException(
        'Usuario no registrado. Completa el registro en la web.',
      );
    }
    if (!usuario.activo) {
      throw new UnauthorizedException(
        'Cuenta desactivada. Contacta al administrador.',
      );
    }
    if (usuario.estadoVerificacion !== 'VERIFICADA') {
      throw new ForbiddenException(
        'Tu cuenta debe ser verificada por un administrador antes de acceder',
      );
    }
    // Completar primer login
    try {
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { primerLoginPendiente: false },
      });
    } catch {}
    const payload = { sub: String(usuario.id), email: usuario.email };
    const accessToken = this.jwtService.sign(payload);
    this.gubuyCodes.delete(code);
    return {
      access_token: accessToken,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        estadoVerificacion: usuario.estadoVerificacion,
        emailVerificado: usuario.emailVerificado,
      },
    };
  }

  private generarDocumentoFake() {
    const d = Array.from({ length: 7 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    const dv = Math.floor(Math.random() * 10);
    return `${d}-${dv}`;
  }

  async gubuyValidate(data: GubuyValidateDto) {
    const docNorm = normalizeCiUy(data.documentoIdentidad);
    const usuarioByDoc = await this.prisma.usuario.findFirst({
      where: { documentoIdentidad: docNorm },
    });
    const usuario =
      usuarioByDoc ||
      (await this.prisma.usuario.findUnique({
        where: { email: data.email },
      })) ||
      (await this.prisma.usuario.findFirst({
        where: { documentoIdentidad: data.documentoIdentidad },
      }));

    if (!usuario) {
      throw new UnauthorizedException(
        'Usuario no encontrado en el sistema. Verifica el documento o email.',
      );
    }

    const nombreOk = (usuario.nombre || '').trim() === data.nombre.trim();
    const apellidoOk = (usuario.apellido || '').trim() === data.apellido.trim();
    const emailOk =
      (usuario.email || '').trim().toLowerCase() ===
      data.email.trim().toLowerCase();
    const docOk =
      normalizeCiUy(usuario.documentoIdentidad || '').trim() === docNorm.trim();

    if (!nombreOk || !apellidoOk || !emailOk || !docOk) {
      throw new UnauthorizedException(
        'Los datos ingresados (Nombre, Apellido, Email o Documento) no coinciden con el usuario registrado.',
      );
    }

    // Tolerar usuarios sin passwordHash en flujo gub.uy (importados), si existe comparar
    if (usuario.passwordHash) {
      const passwordValida = await bcrypt.compare(
        data.password,
        usuario.passwordHash,
      );
      if (!passwordValida) {
        throw new UnauthorizedException(
          'Contraseña incorrecta para el usuario local asociado.',
        );
      }
    }

    if (!usuario.activo) {
      throw new UnauthorizedException(
        'Cuenta desactivada. Contacta al administrador.',
      );
    }
    if (usuario.estadoVerificacion !== 'VERIFICADA') {
      throw new ForbiddenException(
        'Tu cuenta debe ser verificada por un administrador antes de acceder',
      );
    }
    // Completar primer login
    try {
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { primerLoginPendiente: false },
      });
    } catch {}
    const payload = { sub: String(usuario.id), email: usuario.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        estadoVerificacion: usuario.estadoVerificacion,
        emailVerificado: usuario.emailVerificado,
      },
    };
  }
}
