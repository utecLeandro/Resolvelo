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
exports.CrearReservaDto = exports.TipoEntrega = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const date_validator_1 = require("../validators/date.validator");
var TipoEntrega;
(function (TipoEntrega) {
    TipoEntrega["DOMICILIO"] = "DOMICILIO";
    TipoEntrega["RETIRO"] = "RETIRO";
})(TipoEntrega || (exports.TipoEntrega = TipoEntrega = {}));
class CrearReservaDto {
    usuarioId;
    publicacionId;
    propietarioId;
    fechaInicio;
    fechaFin;
    precioTotal;
    comisionPlataforma;
    tipoEntrega;
    direccionEntrega;
    telefonoContacto;
    notasUsuario;
}
exports.CrearReservaDto = CrearReservaDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del usuario es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El ID del usuario debe ser una cadena' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "usuarioId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de la publicación es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El ID de la publicación debe ser una cadena' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "publicacionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del propietario es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El ID del propietario debe ser una cadena' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "propietarioId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La fecha de inicio es requerida' }),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de inicio debe ser una fecha válida en formato ISO' }),
    (0, date_validator_1.IsFutureDate)({ message: 'La fecha de inicio debe ser en el futuro' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La fecha de fin es requerida' }),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de fin debe ser una fecha válida en formato ISO' }),
    (0, date_validator_1.IsAfter)('fechaInicio', { message: 'La fecha de fin debe ser posterior a la fecha de inicio' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "fechaFin", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El precio total es requerido' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'El precio total debe ser un número decimal válido' }),
    (0, class_validator_1.Min)(0, { message: 'El precio total debe ser mayor o igual a 0' }),
    __metadata("design:type", Number)
], CrearReservaDto.prototype, "precioTotal", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La comisión de la plataforma es requerida' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'La comisión debe ser un número decimal válido' }),
    (0, class_validator_1.Min)(0, { message: 'La comisión debe ser mayor o igual a 0' }),
    __metadata("design:type", Number)
], CrearReservaDto.prototype, "comisionPlataforma", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de entrega es requerido' }),
    (0, class_validator_1.IsEnum)(TipoEntrega, { message: 'El tipo de entrega debe ser DOMICILIO o RETIRO' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "tipoEntrega", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => o.tipoEntrega === TipoEntrega.DOMICILIO),
    (0, class_validator_1.IsNotEmpty)({ message: 'La dirección de entrega es requerida para entregas a domicilio' }),
    (0, class_validator_1.IsString)({ message: 'La dirección de entrega debe ser una cadena' }),
    (0, class_validator_1.MaxLength)(255, { message: 'La dirección de entrega no puede exceder 255 caracteres' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "direccionEntrega", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El teléfono de contacto debe ser una cadena' }),
    (0, class_validator_1.MaxLength)(20, { message: 'El teléfono de contacto no puede exceder 20 caracteres' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "telefonoContacto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Las notas del usuario deben ser una cadena' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Las notas del usuario no pueden exceder 1000 caracteres' }),
    __metadata("design:type", String)
], CrearReservaDto.prototype, "notasUsuario", void 0);
//# sourceMappingURL=crear-reserva.dto.js.map