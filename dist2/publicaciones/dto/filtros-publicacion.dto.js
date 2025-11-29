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
exports.FiltrosPublicacionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class FiltrosPublicacionDto {
    busqueda;
    categoria;
    ciudad;
    departamento;
    precioMinimo;
    precioMaximo;
    disponible;
    entregaDomicilio;
    retiroLocal;
    estado;
    estadoModeracion;
    incluirTodosEstadosModeracion;
    calificacionMinima;
    ordenarPor = 'fechaCreacion';
    direccionOrden = 'desc';
    pagina = 1;
    limite = 10;
    latitud;
    longitud;
    radioKm;
    fechaInicio;
    fechaFin;
}
exports.FiltrosPublicacionDto = FiltrosPublicacionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El término de búsqueda debe ser una cadena de texto' }),
    __metadata("design:type", String)
], FiltrosPublicacionDto.prototype, "busqueda", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CategoriaEquipo, { message: 'La categoría debe ser válida' }),
    __metadata("design:type", String)
], FiltrosPublicacionDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La ciudad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], FiltrosPublicacionDto.prototype, "ciudad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El departamento debe ser una cadena de texto' }),
    __metadata("design:type", String)
], FiltrosPublicacionDto.prototype, "departamento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio mínimo debe ser un número válido' }),
    (0, class_validator_1.Min)(0, { message: 'El precio mínimo debe ser mayor o igual a 0' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], FiltrosPublicacionDto.prototype, "precioMinimo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio máximo debe ser un número válido' }),
    (0, class_validator_1.Min)(0, { message: 'El precio máximo debe ser mayor o igual a 0' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], FiltrosPublicacionDto.prototype, "precioMaximo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'La disponibilidad debe ser verdadero o falso' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return undefined;
        return value === 'true' || value === true;
    }),
    __metadata("design:type", Boolean)
], FiltrosPublicacionDto.prototype, "disponible", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'La entrega a domicilio debe ser verdadero o falso' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return undefined;
        return value === 'true' || value === true;
    }),
    __metadata("design:type", Boolean)
], FiltrosPublicacionDto.prototype, "entregaDomicilio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El retiro local debe ser verdadero o falso' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return undefined;
        return value === 'true' || value === true;
    }),
    __metadata("design:type", Boolean)
], FiltrosPublicacionDto.prototype, "retiroLocal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EstadoPublicacion, { message: 'El estado debe ser válido' }),
    __metadata("design:type", String)
], FiltrosPublicacionDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EstadoModeracion, { message: 'El estado de moderación debe ser válido' }),
    __metadata("design:type", String)
], FiltrosPublicacionDto.prototype, "estadoModeracion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'incluirTodosEstadosModeracion debe ser verdadero o falso' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === undefined || value === null || value === '')
            return undefined;
        return value === 'true' || value === true;
    }),
    __metadata("design:type", Boolean)
], FiltrosPublicacionDto.prototype, "incluirTodosEstadosModeracion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '2' }, { message: 'La calificación mínima debe ser un decimal válido' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    (0, class_validator_1.Min)(0, { message: 'La calificación mínima debe ser mayor o igual a 0' }),
    (0, class_validator_1.Max)(5, { message: 'La calificación mínima debe ser menor o igual a 5' }),
    __metadata("design:type", Number)
], FiltrosPublicacionDto.prototype, "calificacionMinima", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El campo de ordenamiento debe ser una cadena de texto' }),
    __metadata("design:type", String)
], FiltrosPublicacionDto.prototype, "ordenarPor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La dirección de ordenamiento debe ser una cadena de texto' }),
    __metadata("design:type", String)
], FiltrosPublicacionDto.prototype, "direccionOrden", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'La página debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'La página debe ser mayor a 0' }),
    __metadata("design:type", Number)
], FiltrosPublicacionDto.prototype, "pagina", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'El límite debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'El límite debe ser mayor a 0' }),
    (0, class_validator_1.Max)(100, { message: 'El límite no puede ser mayor a 100' }),
    __metadata("design:type", Number)
], FiltrosPublicacionDto.prototype, "limite", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '8' }, { message: 'La latitud debe ser un decimal válido' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], FiltrosPublicacionDto.prototype, "latitud", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '8' }, { message: 'La longitud debe ser un decimal válido' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], FiltrosPublicacionDto.prototype, "longitud", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '2' }, { message: 'El radio debe ser un decimal válido' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    (0, class_validator_1.Min)(0.1, { message: 'El radio debe ser mayor a 0.1 km' }),
    (0, class_validator_1.Max)(100, { message: 'El radio no puede ser mayor a 100 km' }),
    __metadata("design:type", Number)
], FiltrosPublicacionDto.prototype, "radioKm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'La fecha de inicio debe ser una fecha válida' }),
    __metadata("design:type", Date)
], FiltrosPublicacionDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'La fecha de fin debe ser una fecha válida' }),
    __metadata("design:type", Date)
], FiltrosPublicacionDto.prototype, "fechaFin", void 0);
