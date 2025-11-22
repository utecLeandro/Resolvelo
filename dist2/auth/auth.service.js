"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(data) {
        try {
            const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12', 10));
            const passwordHash = await bcrypt.hash(data.password, salt);
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
            const verificationOk = true;
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
        }
        catch (error) {
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
                throw new common_1.ServiceUnavailableException('Base de datos no disponible. Inicia PostgreSQL (Docker) y vuelve a intentar.');
            }
            throw error;
        }
    }
    async login(data) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { email: data.email },
            });
            if (!usuario) {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            if (!usuario.activo) {
                throw new common_1.UnauthorizedException('Cuenta desactivada');
            }
            const passwordValida = await bcrypt.compare(data.password, usuario.passwordHash);
            if (!passwordValida) {
                throw new common_1.UnauthorizedException('Credenciales incorrectas');
            }
            const payload = { sub: usuario.id, email: usuario.email };
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
        catch (error) {
            if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
                throw new common_1.ServiceUnavailableException('Base de datos no disponible. Inicia PostgreSQL (Docker) y vuelve a intentar.');
            }
            throw error;
        }
    }
    async obtenerPerfilDesdeToken(authHeader) {
        try {
            const token = authHeader?.startsWith('Bearer ')
                ? authHeader.slice('Bearer '.length)
                : authHeader;
            if (!token) {
                throw new common_1.UnauthorizedException('Token no proporcionado');
            }
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            if (!userId) {
                throw new common_1.UnauthorizedException('Token inválido');
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
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            return usuario;
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Token inválido o expirado');
            }
            if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
                throw new common_1.ServiceUnavailableException('Base de datos no disponible. Inicia PostgreSQL (Docker) y vuelve a intentar.');
            }
            throw error;
        }
    }
    async iniciarRecuperacion(email) {
        const usuario = await this.prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            return { message: 'Si el email existe, se enviarán instrucciones para recuperar la contraseña' };
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 1000 * 60 * 60);
        await this.prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                tokenRecuperacion: token,
                fechaExpiracionToken: expiracion,
            }
        });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'localhost',
                port: parseInt(process.env.SMTP_PORT || '1025', 10),
                secure: process.env.SMTP_SECURE === 'true' ? true : false,
                auth: (process.env.SMTP_USER || process.env.SMTP_PASS) ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                } : undefined,
            });
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@resolvelo.com',
                to: email,
                subject: 'Recuperación de contraseña - ReSolVelo',
                html: `
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el siguiente enlace:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
          <p>Equipo ReSolVelo</p>
        `,
            });
        }
        catch (e) {
            console.warn('No se pudo enviar email de recuperación:', e?.message);
        }
        return { message: 'Si el email existe, se enviarán instrucciones para recuperar la contraseña' };
    }
    async resetearContrasena(email, token, newPassword) {
        const usuario = await this.prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (!usuario.tokenRecuperacion || !usuario.fechaExpiracionToken) {
            throw new common_1.BadRequestException('No hay una solicitud de recuperación activa');
        }
        if (usuario.tokenRecuperacion !== token) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
        if (new Date(usuario.fechaExpiracionToken).getTime() < Date.now()) {
            throw new common_1.UnauthorizedException('Token expirado');
        }
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '12', 10));
        const passwordHash = await bcrypt.hash(newPassword, salt);
        await this.prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                passwordHash,
                passwordSalt: salt,
                tokenRecuperacion: null,
                fechaExpiracionToken: null,
            }
        });
        return { message: 'Contraseña actualizada correctamente' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map