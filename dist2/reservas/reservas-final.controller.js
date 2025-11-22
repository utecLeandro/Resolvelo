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
exports.ReservasFinalController = void 0;
const common_1 = require("@nestjs/common");
const reservas_service_1 = require("./reservas.service");
const crear_reserva_dto_1 = require("./dto/crear-reserva.dto");
let ReservasFinalController = class ReservasFinalController {
    reservasService;
    constructor(reservasService) {
        this.reservasService = reservasService;
    }
    async listarReservas() {
        return this.reservasService.obtenerReservas();
    }
    async obtenerReserva(id) {
        return this.reservasService.obtenerReservaPorId(id);
    }
    async crearReserva(createReservaDto) {
        return this.reservasService.crearReserva(createReservaDto);
    }
    async actualizarReserva(id, updateReservaDto) {
        return this.reservasService.actualizarReserva(id, updateReservaDto);
    }
    async cancelarReserva(id) {
        return this.reservasService.cancelarReserva(id);
    }
    async confirmarReserva(id) {
        return this.reservasService.confirmarReserva(id);
    }
};
exports.ReservasFinalController = ReservasFinalController;
__decorate([
    (0, common_1.Get)('listar'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservasFinalController.prototype, "listarReservas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservasFinalController.prototype, "obtenerReserva", null);
__decorate([
    (0, common_1.Post)('crear'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_reserva_dto_1.CrearReservaDto]),
    __metadata("design:returntype", Promise)
], ReservasFinalController.prototype, "crearReserva", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservasFinalController.prototype, "actualizarReserva", null);
__decorate([
    (0, common_1.Patch)(':id/cancelar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservasFinalController.prototype, "cancelarReserva", null);
__decorate([
    (0, common_1.Patch)(':id/confirmar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservasFinalController.prototype, "confirmarReserva", null);
exports.ReservasFinalController = ReservasFinalController = __decorate([
    (0, common_1.Controller)('reservas'),
    __metadata("design:paramtypes", [reservas_service_1.ReservasService])
], ReservasFinalController);
//# sourceMappingURL=reservas-final.controller.js.map