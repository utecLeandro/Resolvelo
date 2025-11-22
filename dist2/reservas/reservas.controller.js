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
exports.ReservasController = void 0;
const common_1 = require("@nestjs/common");
const reservas_service_1 = require("./reservas.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ReservasController = class ReservasController {
    reservasService;
    constructor(reservasService) {
        this.reservasService = reservasService;
    }
    async test() {
        return { message: 'Controlador de reservas funcionando sin servicio' };
    }
    async obtenerMisSolicitudes(req) {
        const propietarioId = req.user.id;
        return await this.reservasService.obtenerSolicitudesPendientes(propietarioId);
    }
    async obtenerTodasMisSolicitudes(req) {
        console.log('🎯 [CONTROLLER] obtenerTodasMisSolicitudes - Iniciando');
        console.log('🎯 [CONTROLLER] Usuario autenticado:', req.user);
        const propietarioId = req.user.id;
        console.log('🎯 [CONTROLLER] PropietarioId extraído:', propietarioId);
        try {
            const resultado = await this.reservasService.obtenerTodasLasSolicitudes(propietarioId);
            console.log('🎯 [CONTROLLER] Resultado del servicio:', resultado);
            return resultado;
        }
        catch (error) {
            console.error('🎯 [CONTROLLER] Error en obtenerTodasMisSolicitudes:', error);
            throw error;
        }
    }
    async obtenerMisReservas(req) {
        const arrendatarioId = req.user?.id;
        console.log('🔍 Obteniendo reservas para arrendatario:', { arrendatarioId, userObject: req.user });
        return this.reservasService.obtenerReservasArrendatario(arrendatarioId);
    }
    async aceptarSolicitud(reservaId, req) {
        try {
            const reserva = await this.reservasService.obtenerReservaPorId(reservaId);
            if (!reserva.success || !reserva.data) {
                throw new common_1.NotFoundException('Reserva no encontrada');
            }
            if (reserva.data.propietarioId !== req.user.id) {
                throw new common_1.BadRequestException('No tienes permisos para aceptar esta solicitud');
            }
            if (reserva.data.estado !== 'PENDIENTE') {
                throw new common_1.BadRequestException('Solo se pueden aceptar solicitudes pendientes');
            }
            const resultado = await this.reservasService.confirmarReserva(reservaId);
            return {
                success: true,
                message: 'Solicitud aceptada exitosamente',
                data: resultado.data
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al aceptar la solicitud');
        }
    }
    async rechazarSolicitud(reservaId, req) {
        try {
            const reserva = await this.reservasService.obtenerReservaPorId(reservaId);
            if (!reserva.success || !reserva.data) {
                throw new common_1.NotFoundException('Reserva no encontrada');
            }
            if (reserva.data.propietarioId !== req.user.id) {
                throw new common_1.BadRequestException('No tienes permisos para rechazar esta solicitud');
            }
            if (reserva.data.estado !== 'PENDIENTE') {
                throw new common_1.BadRequestException('Solo se pueden rechazar solicitudes pendientes');
            }
            const resultado = await this.reservasService.rechazarReserva(reservaId);
            return {
                success: true,
                message: 'Solicitud rechazada exitosamente',
                data: resultado.data
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al rechazar la solicitud');
        }
    }
    async activarReserva(reservaId, req) {
        try {
            const reserva = await this.reservasService.obtenerReservaPorId(reservaId);
            if (!reserva.success || !reserva.data) {
                throw new common_1.NotFoundException('Reserva no encontrada');
            }
            if (reserva.data.usuarioId !== req.user.id) {
                throw new common_1.BadRequestException('No tienes permisos para activar esta reserva');
            }
            if (reserva.data.estado !== 'CONFIRMADA') {
                throw new common_1.BadRequestException('Solo se pueden activar reservas confirmadas');
            }
            const resultado = await this.reservasService.activarReserva(reservaId);
            return {
                success: true,
                message: 'Reserva activada exitosamente',
                data: resultado.data
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error al activar la reserva');
        }
    }
    async obtenerMisReservasActivas(req) {
        const propietarioId = req.user.id;
        console.log('🔍 [CONTROLLER] Obteniendo reservas activas para propietario:', propietarioId);
        return this.reservasService.obtenerReservasActivasPropietario(propietarioId);
    }
    async obtenerMiHistorialReservas(req) {
        const propietarioId = req.user.id;
        console.log('🔍 [CONTROLLER] Obteniendo historial de reservas para propietario:', propietarioId);
        return this.reservasService.obtenerHistorialReservasPropietario(propietarioId);
    }
};
exports.ReservasController = ReservasController;
__decorate([
    (0, common_1.Get)('test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('mis-solicitudes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "obtenerMisSolicitudes", null);
__decorate([
    (0, common_1.Get)('todas-mis-solicitudes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "obtenerTodasMisSolicitudes", null);
__decorate([
    (0, common_1.Get)('mis-reservas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "obtenerMisReservas", null);
__decorate([
    (0, common_1.Post)(':id/aceptar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "aceptarSolicitud", null);
__decorate([
    (0, common_1.Post)(':id/rechazar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "rechazarSolicitud", null);
__decorate([
    (0, common_1.Post)(':id/activar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "activarReserva", null);
__decorate([
    (0, common_1.Get)('mis-reservas-activas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "obtenerMisReservasActivas", null);
__decorate([
    (0, common_1.Get)('mi-historial-reservas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "obtenerMiHistorialReservas", null);
exports.ReservasController = ReservasController = __decorate([
    (0, common_1.Controller)('reservas'),
    __metadata("design:paramtypes", [reservas_service_1.ReservasService])
], ReservasController);
//# sourceMappingURL=reservas.controller.js.map