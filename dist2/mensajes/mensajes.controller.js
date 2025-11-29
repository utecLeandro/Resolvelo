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
exports.MensajesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const mensajes_service_1 = require("./mensajes.service");
const enviar_mensaje_dto_1 = require("./dto/enviar-mensaje.dto");
let MensajesController = class MensajesController {
    mensajesService;
    constructor(mensajesService) {
        this.mensajesService = mensajesService;
        try {
            console.log('[MensajesController] Cargado');
        }
        catch { }
    }
    async listar(reservaId, req) {
        const usuarioId = req.user?.id;
        return await this.mensajesService.listarPorReserva(reservaId, usuarioId);
    }
    async leer(reservaId, req) {
        const usuarioId = req.user?.id;
        return await this.mensajesService.marcarLeidos(reservaId, usuarioId);
    }
    async enviar(dto, req) {
        const usuarioId = req.user?.id;
        return await this.mensajesService.enviarMensaje(dto, usuarioId);
    }
    async conversaciones(req) {
        const usuarioId = req.user?.id;
        return await this.mensajesService.listarMisConversaciones(usuarioId);
    }
};
exports.MensajesController = MensajesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('reserva/:reservaId'),
    __param(0, (0, common_1.Param)('reservaId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MensajesController.prototype, "listar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reserva/:reservaId/leer'),
    __param(0, (0, common_1.Param)('reservaId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MensajesController.prototype, "leer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('enviar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enviar_mensaje_dto_1.EnviarMensajeDto, Object]),
    __metadata("design:returntype", Promise)
], MensajesController.prototype, "enviar", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('mis-conversaciones'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MensajesController.prototype, "conversaciones", null);
exports.MensajesController = MensajesController = __decorate([
    (0, common_1.Controller)('mensajes'),
    __metadata("design:paramtypes", [mensajes_service_1.MensajesService])
], MensajesController);
