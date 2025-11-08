"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
/**
 * Servicio de autenticación.
 * Maneja lógica de registro con hash + salt y verificación mock.
 */
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
let AuthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        jwtService;
        constructor(prisma, jwtService) {
            this.prisma = prisma;
            this.jwtService = jwtService;
        }
        /**
         * Registra un usuario con email y contraseña aplicando OWASP: hash + salt.
         * Inicialmente en estado pendiente de verificación.
         */
        async register(data) {
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
            }
            catch (error) {
                // Manejar error de email duplicado
                if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                    throw new common_1.ConflictException('El email ya está registrado');
                }
                // BD no disponible (Prisma no puede conectar)
                if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
                    throw new common_1.ServiceUnavailableException('Base de datos no disponible. Inicia PostgreSQL (Docker) y vuelve a intentar.');
                }
                // Re-lanzar otros errores
                throw error;
            }
        }
        /**
         * Autentica un usuario con email y contraseña
         * Valida credenciales y genera token JWT (mock por ahora)
         */
        async login(data) {
            try {
                // Buscar usuario por email
                const usuario = await this.prisma.usuario.findUnique({
                    where: { email: data.email },
                });
                if (!usuario) {
                    throw new common_1.NotFoundException('Usuario no encontrado');
                }
                // Verificar que el usuario esté activo
                if (!usuario.activo) {
                    throw new common_1.UnauthorizedException('Cuenta desactivada');
                }
                // Verificar contraseña usando bcrypt
                const passwordValida = await bcrypt.compare(data.password, usuario.passwordHash);
                if (!passwordValida) {
                    throw new common_1.UnauthorizedException('Credenciales incorrectas');
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
            }
            catch (error) {
                if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
                    throw new common_1.ServiceUnavailableException('Base de datos no disponible. Inicia PostgreSQL (Docker) y vuelve a intentar.');
                }
                throw error;
            }
        }
        /**
         * Obtiene el perfil del usuario a partir del encabezado Authorization con token JWT.
         */
        async obtenerPerfilDesdeToken(authHeader) {
            try {
                const token = authHeader?.startsWith('Bearer ')
                    ? authHeader.slice('Bearer '.length)
                    : authHeader;
                if (!token) {
                    throw new common_1.UnauthorizedException('Token no proporcionado');
                }
                // Verificar y decodificar el token JWT
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
        /**
         * Inicia la recuperación de contraseña: genera token y envía email con instrucciones.
         */
        async iniciarRecuperacion(email) {
            // Buscar usuario
            const usuario = await this.prisma.usuario.findUnique({ where: { email } });
            if (!usuario) {
                // No revelar existencia del email por seguridad
                return { message: 'Si el email existe, se enviarán instrucciones para recuperar la contraseña' };
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
                }
            });
            // Construir link de recuperación
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
            // Enviar email vía SMTP (Mailhog en desarrollo)
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
                // En desarrollo, si el envío falla, no bloquear el flujo
                console.warn('No se pudo enviar email de recuperación:', e?.message);
            }
            return { message: 'Si el email existe, se enviarán instrucciones para recuperar la contraseña' };
        }
        /**
         * Completa la recuperación de contraseña: valida token y actualiza contraseña.
         */
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
            // Generar nuevo hash + salt
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
    return AuthService = _classThis;
})();
exports.AuthService = AuthService;
