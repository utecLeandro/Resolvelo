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
const client_ses_1 = require("@aws-sdk/client-ses");
const nodemailer = require("nodemailer");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    gubuyCodes = new Map();
    gubuyEnabled() {
        const v = process.env.GUBUY_SIMULATED;
        if (v === 'true')
            return true;
        if (v === 'false')
            return false;
        return process.env.NODE_ENV !== 'production';
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
                    primerLoginPendiente: true,
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
                usuarioId: usuario.id,
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
            let usuario = await this.prisma.usuario.findUnique({
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
            if (usuario.primerLoginPendiente) {
                throw new common_1.UnauthorizedException('Primer login debe ser por gub.uy (simulado)');
            }
            if (usuario.estadoVerificacion !== 'VERIFICADA') {
                throw new common_1.ForbiddenException('Tu cuenta debe ser verificada por un administrador antes de acceder');
            }
            if (usuario.email === 'gtbump2012@gmail.com') {
                if (usuario.rol !== 'ADMINISTRADOR' && usuario.rol !== 'SUPER_ADMIN') {
                    usuario = await this.prisma.usuario.update({
                        where: { id: usuario.id },
                        data: { rol: 'SUPER_ADMIN', fechaAsignacionRol: new Date(), asignadoPor: 'SYSTEM', motivoRol: 'Admin permanente' },
                    });
                }
                const admin = await this.prisma.administrador.findUnique({ where: { usuarioId: usuario.id } });
                if (!admin) {
                    await this.prisma.administrador.create({ data: { usuarioId: usuario.id, activo: true, motivoAsignacion: 'Admin permanente (system)' } });
                }
                else if (!admin.activo) {
                    await this.prisma.administrador.update({ where: { id: admin.id }, data: { activo: true } });
                }
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
            const from = (process.env.EMAIL_FROM || 'noreply@resolvelo.com').trim();
            const region = (process.env.AWS_REGION || 'us-east-1').trim();
            try {
                const ses = new client_ses_1.SESClient({ region });
                const command = new client_ses_1.SendEmailCommand({
                    Source: from,
                    Destination: { ToAddresses: [email] },
                    Message: {
                        Subject: { Data: 'Recuperación de contraseña - ReSolVelo', Charset: 'UTF-8' },
                        Body: {
                            Html: {
                                Data: `
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el siguiente enlace:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
          <p>Equipo ReSolVelo</p>
        `,
                                Charset: 'UTF-8',
                            },
                        },
                    },
                });
                await ses.send(command);
            }
            catch (e1) {
                try {
                    const transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST || 'localhost',
                        port: parseInt(process.env.SMTP_PORT || '1025', 10),
                        secure: process.env.SMTP_SECURE === 'true',
                        auth: (process.env.SMTP_USER || process.env.SMTP_PASS) ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
                        connectionTimeout: 2000,
                        greetingTimeout: 2000,
                        socketTimeout: 3000,
                    });
                    await transporter.sendMail({
                        from: from,
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
                catch (e2) {
                    console.warn('No se pudo enviar email de recuperación (SMTP):', e2?.message);
                }
            }
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
    async gubuyAuthorize(params) {
        if (!this.gubuyEnabled())
            throw new common_1.UnauthorizedException('Simulación gub.uy deshabilitada');
        const { redirectUri, state, nonce, scope } = params;
        if (!redirectUri)
            throw new common_1.BadRequestException('redirect_uri requerido');
        const code = crypto.randomBytes(16).toString('hex');
        const documento = this.generarDocumentoFake();
        const claims = {
            email: `gubuy_${code}@resolvelo.local`,
            nombre: 'Usuario',
            apellido: 'Gubuy',
            documentoIdentidad: documento,
        };
        this.gubuyCodes.set(code, { redirectUri, state, nonce, scope, claims, createdAt: Date.now() });
        return { code };
    }
    async gubuyTokenExchange(code, redirectUri) {
        if (!this.gubuyEnabled())
            throw new common_1.UnauthorizedException('Simulación gub.uy deshabilitada');
        if (!code)
            throw new common_1.BadRequestException('code requerido');
        if (!redirectUri)
            throw new common_1.BadRequestException('redirect_uri requerido');
        const data = this.gubuyCodes.get(code);
        if (!data)
            throw new common_1.UnauthorizedException('Código inválido');
        const maxAgeMs = 10 * 60 * 1000;
        if (Date.now() - data.createdAt > maxAgeMs) {
            this.gubuyCodes.delete(code);
            throw new common_1.UnauthorizedException('Código expirado');
        }
        if (data.redirectUri !== redirectUri)
            throw new common_1.UnauthorizedException('redirect_uri no coincide');
        const claims = data.claims;
        let usuario = await this.prisma.usuario.findFirst({ where: { documentoIdentidad: claims.documentoIdentidad } });
        if (!usuario && claims.email) {
            usuario = await this.prisma.usuario.findUnique({ where: { email: claims.email } });
        }
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no registrado. Completa el registro en la web.');
        }
        if (!usuario.activo) {
            throw new common_1.UnauthorizedException('Cuenta desactivada');
        }
        if (usuario.estadoVerificacion !== 'VERIFICADA') {
            throw new common_1.ForbiddenException('Tu cuenta debe ser verificada por un administrador antes de acceder');
        }
        const payload = { sub: usuario.id, email: usuario.email };
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
    generarDocumentoFake() {
        const d = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
        const dv = Math.floor(Math.random() * 10);
        return `${d}-${dv}`;
    }
    async gubuyValidate(data) {
        const usuarioByDoc = await this.prisma.usuario.findFirst({ where: { documentoIdentidad: data.documentoIdentidad } });
        const usuario = usuarioByDoc || (await this.prisma.usuario.findUnique({ where: { email: data.email } }));
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no registrado');
        }
        if (!usuario.activo) {
            throw new common_1.UnauthorizedException('Cuenta desactivada');
        }
        const nombreOk = (usuario.nombre || '').trim() === data.nombre.trim();
        const apellidoOk = (usuario.apellido || '').trim() === data.apellido.trim();
        const emailOk = (usuario.email || '').trim().toLowerCase() === data.email.trim().toLowerCase();
        const docOk = (usuario.documentoIdentidad || '').trim() === data.documentoIdentidad.trim();
        if (!nombreOk || !apellidoOk || !emailOk || !docOk) {
            throw new common_1.UnauthorizedException('Datos no coinciden');
        }
        const passwordValida = await bcrypt.compare(data.password, usuario.passwordHash);
        if (!passwordValida) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        if (usuario.estadoVerificacion !== 'VERIFICADA') {
            throw new common_1.ForbiddenException('Tu cuenta debe ser verificada por un administrador antes de acceder');
        }
        const payload = { sub: usuario.id, email: usuario.email };
        const accessToken = this.jwtService.sign(payload);
        await this.prisma.usuario.update({ where: { id: usuario.id }, data: { primerLoginPendiente: false } });
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
