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
exports.ActualizarPublicacionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class ActualizarPublicacionDto {
    titulo;
    descripcion;
    categoria;
    marca;
    modelo;
    anioFabricacion;
    precioPorDia;
    precioPorSemana;
    precioPorMes;
    deposito;
    disponible;
    diasMinimoAlquiler;
    diasMaximoAlquiler;
    direccion;
    ciudad;
    departamento;
    codigoPostal;
    latitud;
    longitud;
    estado;
    entregaDomicilio;
    retiroLocal;
    estadoEquipo;
    instrucciones;
}
exports.ActualizarPublicacionDto = ActualizarPublicacionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El título debe ser una cadena de texto' }),
    (0, class_validator_1.MaxLength)(200, { message: 'El título no puede exceder 200 caracteres' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CategoriaEquipo, { message: 'La categoría debe ser válida' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La marca debe ser una cadena de texto' }),
    (0, class_validator_1.MaxLength)(100, { message: 'La marca no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "marca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El modelo debe ser una cadena de texto' }),
    (0, class_validator_1.MaxLength)(100, { message: 'El modelo no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "modelo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'El año de fabricación debe ser un número entero' }),
    (0, class_validator_1.Min)(1900, { message: 'El año de fabricación debe ser mayor a 1900' }),
    (0, class_validator_1.Max)(new Date().getFullYear(), { message: 'El año de fabricación no puede ser futuro' }),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "anioFabricacion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio por día debe ser un número válido' }),
    (0, class_validator_1.Min)(0.01, { message: 'El precio por día debe ser mayor a 0' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "precioPorDia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio por semana debe ser un número válido' }),
    (0, class_validator_1.Min)(0.01, { message: 'El precio por semana debe ser mayor a 0' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "precioPorSemana", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio por mes debe ser un número válido' }),
    (0, class_validator_1.Min)(0.01, { message: 'El precio por mes debe ser mayor a 0' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "precioPorMes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El depósito debe ser un número válido' }),
    (0, class_validator_1.Min)(0, { message: 'El depósito debe ser mayor o igual a 0' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "deposito", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'La disponibilidad debe ser verdadero o falso' }),
    __metadata("design:type", Boolean)
], ActualizarPublicacionDto.prototype, "disponible", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Los días mínimo de alquiler debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'Los días mínimo de alquiler debe ser al menos 1' }),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "diasMinimoAlquiler", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'Los días máximo de alquiler debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'Los días máximo de alquiler debe ser al menos 1' }),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "diasMaximoAlquiler", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La dirección debe ser una cadena de texto' }),
    (0, class_validator_1.MaxLength)(255, { message: 'La dirección no puede exceder 255 caracteres' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La ciudad debe ser una cadena de texto' }),
    (0, class_validator_1.MaxLength)(100, { message: 'La ciudad no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "ciudad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El departamento debe ser una cadena de texto' }),
    (0, class_validator_1.MaxLength)(100, { message: 'El departamento no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "departamento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El código postal debe ser una cadena de texto' }),
    (0, class_validator_1.MaxLength)(10, { message: 'El código postal no puede exceder 10 caracteres' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "codigoPostal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '8' }, { message: 'La latitud debe ser un decimal válido' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "latitud", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '8' }, { message: 'La longitud debe ser un decimal válido' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined),
    __metadata("design:type", Number)
], ActualizarPublicacionDto.prototype, "longitud", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.EstadoPublicacion, { message: 'El estado de la publicación debe ser válido' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'La entrega a domicilio debe ser verdadero o falso' }),
    __metadata("design:type", Boolean)
], ActualizarPublicacionDto.prototype, "entregaDomicilio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El retiro local debe ser verdadero o falso' }),
    __metadata("design:type", Boolean)
], ActualizarPublicacionDto.prototype, "retiroLocal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El estado del equipo debe ser una cadena de texto' }),
    (0, class_validator_1.MaxLength)(50, { message: 'El estado del equipo no puede exceder 50 caracteres' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "estadoEquipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Las instrucciones deben ser una cadena de texto' }),
    __metadata("design:type", String)
], ActualizarPublicacionDto.prototype, "instrucciones", void 0);
