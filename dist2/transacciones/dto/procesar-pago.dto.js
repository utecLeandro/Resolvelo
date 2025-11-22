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
exports.RespuestaPagoDto = exports.ProcesarPagoDto = void 0;
const class_validator_1 = require("class-validator");
class ProcesarPagoDto {
    reservaId;
    metodoPago = 'TARJETA_CREDITO';
    descripcion;
}
exports.ProcesarPagoDto = ProcesarPagoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcesarPagoDto.prototype, "reservaId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcesarPagoDto.prototype, "metodoPago", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcesarPagoDto.prototype, "descripcion", void 0);
class RespuestaPagoDto {
    exito;
    transaccionId;
    referenciaExterna;
    mensaje;
    fechaProcesamiento;
}
exports.RespuestaPagoDto = RespuestaPagoDto;
//# sourceMappingURL=procesar-pago.dto.js.map