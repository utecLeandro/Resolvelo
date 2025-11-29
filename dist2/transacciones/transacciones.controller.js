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
exports.TransaccionesController = void 0;
const common_1 = require("@nestjs/common");
const transacciones_service_1 = require("./transacciones.service");
const procesar_pago_dto_1 = require("./dto/procesar-pago.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const crear_preferencia_mp_dto_1 = require("./dto/crear-preferencia-mp.dto");
const payment_brick_dto_1 = require("./dto/payment-brick.dto");
console.log('[TransaccionesController] Archivo cargado (import)');
let TransaccionesController = class TransaccionesController {
    transaccionesService;
    constructor(transaccionesService) {
        this.transaccionesService = transaccionesService;
    }
    async procesarPago(procesarPagoDto, req) {
        console.log('🔄 [CONTROLLER] Procesando pago para reserva:', procesarPagoDto.reservaId);
        console.log('👤 [CONTROLLER] Usuario:', req.user.sub);
        const resultado = await this.transaccionesService.procesarPago(procesarPagoDto);
        console.log('✅ [CONTROLLER] Pago procesado exitosamente:', resultado.transaccionId);
        return resultado;
    }
    async obtenerMisTransacciones(req) {
        console.log('📋 [CONTROLLER] Obteniendo transacciones del usuario:', req.user.sub);
        return this.transaccionesService.obtenerTransaccionesUsuario(req.user.sub);
    }
    async obtenerTransaccion(id) {
        console.log('🔍 [CONTROLLER] Obteniendo transacción:', id);
        return this.transaccionesService.obtenerTransaccion(id);
    }
    async crearPreferenciaMp(body, req) {
        console.log('🧭 [CONTROLLER] Crear preferencia MP para reserva:', body.reservaId);
        console.log('👤 [CONTROLLER] Usuario:', req.user.sub);
        const resultado = await this.transaccionesService.crearPreferenciaMercadoPago(body.reservaId, body.descripcion);
        console.log('✅ [CONTROLLER] Preferencia creada:', resultado.preferenciaId);
        return resultado;
    }
    async confirmarPagoMp(body, req) {
        console.log('🧭 [CONTROLLER] Confirmar pago MP paymentId:', body?.paymentId);
        console.log('👤 [CONTROLLER] Usuario:', req.user.sub);
        if (!body?.paymentId) {
            throw new Error('paymentId es requerido');
        }
        const tx = await this.transaccionesService.confirmarPagoMercadoPago(body.paymentId);
        console.log('✅ [CONTROLLER] Confirmación procesada para transacción:', tx?.id, 'estado:', tx?.estado);
        return tx;
    }
    async completarTransaccion(id, req) {
        console.log('🧭 [CONTROLLER] Completar transacción manual:', id, 'usuario:', req.user?.sub);
        const tx = await this.transaccionesService.verificarEstadoMercadoPagoPorTransaccion(id);
        if (!tx || tx.estado !== 'COMPLETADA') {
            throw new common_1.BadRequestException('El pago no está aprobado aún');
        }
        return tx;
    }
    async processPaymentBrick(body, req) {
        console.log('🧭 [CONTROLLER] process-payment Brick, usuario:', req.user?.sub);
        const tx = await this.transaccionesService.procesarPagoBrick(body);
        console.log('✅ [CONTROLLER] Brick payment procesado para transacción:', tx?.id, 'estado:', tx?.estado);
        return tx;
    }
};
exports.TransaccionesController = TransaccionesController;
__decorate([
    (0, common_1.Post)('procesar-pago'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [procesar_pago_dto_1.ProcesarPagoDto, Object]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "procesarPago", null);
__decorate([
    (0, common_1.Get)('mis-transacciones'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "obtenerMisTransacciones", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "obtenerTransaccion", null);
__decorate([
    (0, common_1.Post)('mercado-pago/crear-preferencia'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_preferencia_mp_dto_1.CrearPreferenciaMpDto, Object]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "crearPreferenciaMp", null);
__decorate([
    (0, common_1.Post)('mercado-pago/confirmar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "confirmarPagoMp", null);
__decorate([
    (0, common_1.Put)(':id/completar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "completarTransaccion", null);
__decorate([
    (0, common_1.Post)('mercado-pago/process-payment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_brick_dto_1.ProcesarPagoBrickDto, Object]),
    __metadata("design:returntype", Promise)
], TransaccionesController.prototype, "processPaymentBrick", null);
exports.TransaccionesController = TransaccionesController = __decorate([
    (0, common_1.Controller)('transacciones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [transacciones_service_1.TransaccionesService])
], TransaccionesController);
