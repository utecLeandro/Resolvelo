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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
const usuarios_service_1 = require("./usuarios.service");
const actualizar_perfil_dto_1 = require("./dto/actualizar-perfil.dto");
const reservas_service_1 = require("../reservas/reservas.service");
const crear_reserva_dto_1 = require("../reservas/dto/crear-reserva.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UsuariosController = class UsuariosController {
    usuariosService;
    reservasService;
    constructor(usuariosService, reservasService) {
        this.usuariosService = usuariosService;
        this.reservasService = reservasService;
    }
    async testReservas() {
        return {
            message: 'Ruta de prueba para reservas funcionando',
            timestamp: new Date().toISOString(),
            status: 'OK'
        };
    }
    async obtenerMisSolicitudes(req) {
        const propietarioId = req.user.id;
        console.log('🔍 [MIS-SOLICITUDES] Usuario autenticado:', {
            propietarioId,
            userObject: req.user,
            email: req.user?.email
        });
        const resultado = await this.reservasService.obtenerSolicitudesPendientes(propietarioId);
        console.log('📋 [MIS-SOLICITUDES] Resultado:', {
            propietarioId,
            cantidadSolicitudes: resultado.data?.length || 0
        });
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async obtenerMisReservas(req) {
        const arrendatarioId = req.user.id;
        console.log('🔍 [MIS-RESERVAS] Usuario autenticado:', {
            arrendatarioId,
            userObject: req.user,
            email: req.user?.email
        });
        const resultado = await this.reservasService.obtenerReservasArrendatario(arrendatarioId);
        console.log('📋 [MIS-RESERVAS] Resultado:', {
            arrendatarioId,
            cantidadReservas: resultado.data?.length || 0
        });
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async crearReserva(data, req) {
        try {
            const resultado = await this.reservasService.crearReserva(data);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            throw error;
        }
    }
    async subirAvatar(id, req) {
        const file = req.file;
        if (!file) {
            throw new common_1.HttpException('Archivo requerido', common_1.HttpStatus.BAD_REQUEST);
        }
        const usuarioId = req.user?.id;
        if (!usuarioId || usuarioId !== id) {
            throw new common_1.ForbiddenException('No autorizado para subir avatar de otro usuario');
        }
        const url = `/uploads/usuarios/${id}/${file.filename}`;
        const actualizado = await this.usuariosService.actualizarAvatar(id, url);
        return { success: true, avatarUrl: actualizado.avatarUrl };
    }
    async actualizarReserva(id, data, req) {
        const resultado = await this.reservasService.actualizarReserva(id, data);
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async cancelarReserva(id, req) {
        const resultado = await this.reservasService.cancelarReserva(id);
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async confirmarReserva(id, req) {
        const resultado = await this.reservasService.confirmarReserva(id);
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async aceptarReserva(id, req) {
        const resultado = await this.reservasService.aceptarReserva(id);
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async rechazarReserva(id, req) {
        const resultado = await this.reservasService.rechazarReserva(id);
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async obtenerMisReservasActivas(req) {
        const propietarioId = req.user.id;
        console.log('🔍 [USUARIOS-CONTROLLER] Obteniendo reservas activas para propietario:', propietarioId);
        const resultado = await this.reservasService.obtenerReservasActivasPropietario(propietarioId);
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async obtenerMiHistorialReservas(req) {
        const propietarioId = req.user.id;
        console.log('🔍 [USUARIOS-CONTROLLER] Obteniendo historial de reservas para propietario:', propietarioId);
        const resultado = await this.reservasService.obtenerHistorialReservasPropietario(propietarioId);
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async testSimple() {
        console.log('🎯 [USUARIOS-CONTROLLER] Test simple ejecutado');
        return { message: 'Test simple funcionando', timestamp: new Date().toISOString() };
    }
    async obtenerTodasMisSolicitudes(req) {
        console.log('🚀🚀🚀 [USUARIOS-CONTROLLER] obtenerTodasMisSolicitudes - MÉTODO EJECUTÁNDOSE 🚀🚀🚀');
        console.log('🎯 [USUARIOS-CONTROLLER] obtenerTodasMisSolicitudes - Iniciando');
        console.log('🎯 [USUARIOS-CONTROLLER] Usuario autenticado:', req.user);
        const propietarioId = req.user.id;
        console.log('🎯 [USUARIOS-CONTROLLER] PropietarioId extraído:', propietarioId);
        try {
            const resultado = await this.reservasService.obtenerTodasLasSolicitudes(propietarioId);
            console.log('🎯 [USUARIOS-CONTROLLER] Resultado del servicio:', resultado);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('🎯 [USUARIOS-CONTROLLER] Error en obtenerTodasMisSolicitudes:', error);
            throw error;
        }
    }
    async activarReserva(reservaId, req) {
        try {
            console.log('🔥 [USUARIOS-CONTROLLER] Activando reserva:', reservaId);
            const resultado = await this.reservasService.activarReserva(reservaId);
            console.log('✅ [USUARIOS-CONTROLLER] Reserva activada exitosamente:', resultado);
            return resultado;
        }
        catch (error) {
            console.error('❌ [USUARIOS-CONTROLLER] Error al activar reserva:', error);
            throw error;
        }
    }
    async obtenerReserva(id, req) {
        const resultado = await this.reservasService.obtenerReservaPorId(id);
        return {
            ...resultado,
            timestamp: new Date().toISOString()
        };
    }
    async obtenerPorId(id) {
        return this.usuariosService.obtenerPorId(id);
    }
    async actualizarPerfil(id, body) {
        return this.usuariosService.actualizarPerfil(id, body);
    }
};
exports.UsuariosController = UsuariosController;
__decorate([
    (0, common_1.Get)('test/reservas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "testReservas", null);
__decorate([
    (0, common_1.Get)('reservas/mis-solicitudes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerMisSolicitudes", null);
__decorate([
    (0, common_1.Get)('reservas/mis-reservas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerMisReservas", null);
__decorate([
    (0, common_1.Post)('reservas/crear'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_reserva_dto_1.CrearReservaDto, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "crearReserva", null);
__decorate([
    (0, common_1.Post)(':id/avatar/upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(__dirname, '..', '..', 'uploads', 'usuarios', req.params.id);
                fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname) || '.bin';
                const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
                cb(null, nombre);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allow = ['image/jpeg', 'image/png', 'image/webp'];
            if (allow.includes(file.mimetype))
                cb(null, true);
            else
                cb(new Error('Tipo de archivo no permitido'), false);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "subirAvatar", null);
__decorate([
    (0, common_1.Patch)('reservas/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "actualizarReserva", null);
__decorate([
    (0, common_1.Patch)('reservas/:id/cancelar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "cancelarReserva", null);
__decorate([
    (0, common_1.Patch)('reservas/:id/confirmar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "confirmarReserva", null);
__decorate([
    (0, common_1.Patch)('reservas/:id/aceptar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "aceptarReserva", null);
__decorate([
    (0, common_1.Patch)('reservas/:id/rechazar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "rechazarReserva", null);
__decorate([
    (0, common_1.Get)('reservas/mis-reservas-activas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerMisReservasActivas", null);
__decorate([
    (0, common_1.Get)('reservas/mi-historial-reservas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerMiHistorialReservas", null);
__decorate([
    (0, common_1.Get)('reservas/test-simple'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "testSimple", null);
__decorate([
    (0, common_1.Get)('reservas/todas-mis-solicitudes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerTodasMisSolicitudes", null);
__decorate([
    (0, common_1.Post)('reservas/:id/activar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "activarReserva", null);
__decorate([
    (0, common_1.Get)('reservas/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerReserva", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "obtenerPorId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, actualizar_perfil_dto_1.ActualizarPerfilDto]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "actualizarPerfil", null);
exports.UsuariosController = UsuariosController = __decorate([
    (0, common_1.Controller)('usuarios'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [usuarios_service_1.UsuariosService,
        reservas_service_1.ReservasService])
], UsuariosController);
