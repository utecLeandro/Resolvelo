"use strict";
/**
 * DTO para crear una nueva publicación de equipo musical
 * Incluye validaciones de negocio y transformaciones necesarias
 */
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
exports.CrearPublicacionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
let CrearPublicacionDto = (() => {
    let _titulo_decorators;
    let _titulo_initializers = [];
    let _titulo_extraInitializers = [];
    let _descripcion_decorators;
    let _descripcion_initializers = [];
    let _descripcion_extraInitializers = [];
    let _categoria_decorators;
    let _categoria_initializers = [];
    let _categoria_extraInitializers = [];
    let _marca_decorators;
    let _marca_initializers = [];
    let _marca_extraInitializers = [];
    let _modelo_decorators;
    let _modelo_initializers = [];
    let _modelo_extraInitializers = [];
    let _anioFabricacion_decorators;
    let _anioFabricacion_initializers = [];
    let _anioFabricacion_extraInitializers = [];
    let _precioPorDia_decorators;
    let _precioPorDia_initializers = [];
    let _precioPorDia_extraInitializers = [];
    let _precioPorSemana_decorators;
    let _precioPorSemana_initializers = [];
    let _precioPorSemana_extraInitializers = [];
    let _precioPorMes_decorators;
    let _precioPorMes_initializers = [];
    let _precioPorMes_extraInitializers = [];
    let _deposito_decorators;
    let _deposito_initializers = [];
    let _deposito_extraInitializers = [];
    let _diasMinimoAlquiler_decorators;
    let _diasMinimoAlquiler_initializers = [];
    let _diasMinimoAlquiler_extraInitializers = [];
    let _diasMaximoAlquiler_decorators;
    let _diasMaximoAlquiler_initializers = [];
    let _diasMaximoAlquiler_extraInitializers = [];
    let _direccion_decorators;
    let _direccion_initializers = [];
    let _direccion_extraInitializers = [];
    let _ciudad_decorators;
    let _ciudad_initializers = [];
    let _ciudad_extraInitializers = [];
    let _departamento_decorators;
    let _departamento_initializers = [];
    let _departamento_extraInitializers = [];
    let _codigoPostal_decorators;
    let _codigoPostal_initializers = [];
    let _codigoPostal_extraInitializers = [];
    let _latitud_decorators;
    let _latitud_initializers = [];
    let _latitud_extraInitializers = [];
    let _longitud_decorators;
    let _longitud_initializers = [];
    let _longitud_extraInitializers = [];
    let _entregaDomicilio_decorators;
    let _entregaDomicilio_initializers = [];
    let _entregaDomicilio_extraInitializers = [];
    let _retiroLocal_decorators;
    let _retiroLocal_initializers = [];
    let _retiroLocal_extraInitializers = [];
    let _estadoEquipo_decorators;
    let _estadoEquipo_initializers = [];
    let _estadoEquipo_extraInitializers = [];
    let _instrucciones_decorators;
    let _instrucciones_initializers = [];
    let _instrucciones_extraInitializers = [];
    return class CrearPublicacionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _titulo_decorators = [(0, class_validator_1.IsString)({ message: 'El título debe ser una cadena de texto' }), (0, class_validator_1.IsNotEmpty)({ message: 'El título es obligatorio' }), (0, class_validator_1.MaxLength)(200, { message: 'El título no puede exceder 200 caracteres' })];
            _descripcion_decorators = [(0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }), (0, class_validator_1.IsNotEmpty)({ message: 'La descripción es obligatoria' })];
            _categoria_decorators = [(0, class_validator_1.IsEnum)(client_1.CategoriaEquipo, { message: 'La categoría debe ser válida' })];
            _marca_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'La marca debe ser una cadena de texto' }), (0, class_validator_1.MaxLength)(100, { message: 'La marca no puede exceder 100 caracteres' })];
            _modelo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'El modelo debe ser una cadena de texto' }), (0, class_validator_1.MaxLength)(100, { message: 'El modelo no puede exceder 100 caracteres' })];
            _anioFabricacion_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)({ message: 'El año de fabricación debe ser un número entero' }), (0, class_validator_1.Min)(1900, { message: 'El año de fabricación debe ser mayor a 1900' }), (0, class_validator_1.Max)(new Date().getFullYear(), { message: 'El año de fabricación no puede ser futuro' })];
            _precioPorDia_decorators = [(0, class_validator_1.IsNumber)({}, { message: 'El precio por día debe ser un número válido' }), (0, class_validator_1.Min)(0.01, { message: 'El precio por día debe ser mayor a 0' }), (0, class_transformer_1.Transform)(({ value }) => parseFloat(value))];
            _precioPorSemana_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({}, { message: 'El precio por semana debe ser un número válido' }), (0, class_validator_1.Min)(0.01, { message: 'El precio por semana debe ser mayor a 0' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _precioPorMes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({}, { message: 'El precio por mes debe ser un número válido' }), (0, class_validator_1.Min)(0.01, { message: 'El precio por mes debe ser mayor a 0' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _deposito_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({}, { message: 'El depósito debe ser un número válido' }), (0, class_validator_1.Min)(0, { message: 'El depósito debe ser mayor o igual a 0' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _diasMinimoAlquiler_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)({ message: 'Los días mínimo de alquiler debe ser un número entero' }), (0, class_validator_1.Min)(1, { message: 'Los días mínimo de alquiler debe ser al menos 1' })];
            _diasMaximoAlquiler_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)({ message: 'Los días máximo de alquiler debe ser un número entero' }), (0, class_validator_1.Min)(1, { message: 'Los días máximo de alquiler debe ser al menos 1' })];
            _direccion_decorators = [(0, class_validator_1.IsString)({ message: 'La dirección debe ser una cadena de texto' }), (0, class_validator_1.IsNotEmpty)({ message: 'La dirección es obligatoria' }), (0, class_validator_1.MaxLength)(255, { message: 'La dirección no puede exceder 255 caracteres' })];
            _ciudad_decorators = [(0, class_validator_1.IsString)({ message: 'La ciudad debe ser una cadena de texto' }), (0, class_validator_1.IsNotEmpty)({ message: 'La ciudad es obligatoria' }), (0, class_validator_1.MaxLength)(100, { message: 'La ciudad no puede exceder 100 caracteres' })];
            _departamento_decorators = [(0, class_validator_1.IsString)({ message: 'El departamento debe ser una cadena de texto' }), (0, class_validator_1.IsNotEmpty)({ message: 'El departamento es obligatorio' }), (0, class_validator_1.MaxLength)(100, { message: 'El departamento no puede exceder 100 caracteres' })];
            _codigoPostal_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'El código postal debe ser una cadena de texto' }), (0, class_validator_1.MaxLength)(10, { message: 'El código postal no puede exceder 10 caracteres' })];
            _latitud_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDecimal)({ decimal_digits: '8' }, { message: 'La latitud debe ser un decimal válido' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _longitud_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDecimal)({ decimal_digits: '8' }, { message: 'La longitud debe ser un decimal válido' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _entregaDomicilio_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)({ message: 'La entrega a domicilio debe ser verdadero o falso' })];
            _retiroLocal_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)({ message: 'El retiro local debe ser verdadero o falso' })];
            _estadoEquipo_decorators = [(0, class_validator_1.IsString)({ message: 'El estado del equipo debe ser una cadena de texto' }), (0, class_validator_1.IsNotEmpty)({ message: 'El estado del equipo es obligatorio' }), (0, class_validator_1.MaxLength)(50, { message: 'El estado del equipo no puede exceder 50 caracteres' })];
            _instrucciones_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'Las instrucciones deben ser una cadena de texto' })];
            __esDecorate(null, null, _titulo_decorators, { kind: "field", name: "titulo", static: false, private: false, access: { has: obj => "titulo" in obj, get: obj => obj.titulo, set: (obj, value) => { obj.titulo = value; } }, metadata: _metadata }, _titulo_initializers, _titulo_extraInitializers);
            __esDecorate(null, null, _descripcion_decorators, { kind: "field", name: "descripcion", static: false, private: false, access: { has: obj => "descripcion" in obj, get: obj => obj.descripcion, set: (obj, value) => { obj.descripcion = value; } }, metadata: _metadata }, _descripcion_initializers, _descripcion_extraInitializers);
            __esDecorate(null, null, _categoria_decorators, { kind: "field", name: "categoria", static: false, private: false, access: { has: obj => "categoria" in obj, get: obj => obj.categoria, set: (obj, value) => { obj.categoria = value; } }, metadata: _metadata }, _categoria_initializers, _categoria_extraInitializers);
            __esDecorate(null, null, _marca_decorators, { kind: "field", name: "marca", static: false, private: false, access: { has: obj => "marca" in obj, get: obj => obj.marca, set: (obj, value) => { obj.marca = value; } }, metadata: _metadata }, _marca_initializers, _marca_extraInitializers);
            __esDecorate(null, null, _modelo_decorators, { kind: "field", name: "modelo", static: false, private: false, access: { has: obj => "modelo" in obj, get: obj => obj.modelo, set: (obj, value) => { obj.modelo = value; } }, metadata: _metadata }, _modelo_initializers, _modelo_extraInitializers);
            __esDecorate(null, null, _anioFabricacion_decorators, { kind: "field", name: "anioFabricacion", static: false, private: false, access: { has: obj => "anioFabricacion" in obj, get: obj => obj.anioFabricacion, set: (obj, value) => { obj.anioFabricacion = value; } }, metadata: _metadata }, _anioFabricacion_initializers, _anioFabricacion_extraInitializers);
            __esDecorate(null, null, _precioPorDia_decorators, { kind: "field", name: "precioPorDia", static: false, private: false, access: { has: obj => "precioPorDia" in obj, get: obj => obj.precioPorDia, set: (obj, value) => { obj.precioPorDia = value; } }, metadata: _metadata }, _precioPorDia_initializers, _precioPorDia_extraInitializers);
            __esDecorate(null, null, _precioPorSemana_decorators, { kind: "field", name: "precioPorSemana", static: false, private: false, access: { has: obj => "precioPorSemana" in obj, get: obj => obj.precioPorSemana, set: (obj, value) => { obj.precioPorSemana = value; } }, metadata: _metadata }, _precioPorSemana_initializers, _precioPorSemana_extraInitializers);
            __esDecorate(null, null, _precioPorMes_decorators, { kind: "field", name: "precioPorMes", static: false, private: false, access: { has: obj => "precioPorMes" in obj, get: obj => obj.precioPorMes, set: (obj, value) => { obj.precioPorMes = value; } }, metadata: _metadata }, _precioPorMes_initializers, _precioPorMes_extraInitializers);
            __esDecorate(null, null, _deposito_decorators, { kind: "field", name: "deposito", static: false, private: false, access: { has: obj => "deposito" in obj, get: obj => obj.deposito, set: (obj, value) => { obj.deposito = value; } }, metadata: _metadata }, _deposito_initializers, _deposito_extraInitializers);
            __esDecorate(null, null, _diasMinimoAlquiler_decorators, { kind: "field", name: "diasMinimoAlquiler", static: false, private: false, access: { has: obj => "diasMinimoAlquiler" in obj, get: obj => obj.diasMinimoAlquiler, set: (obj, value) => { obj.diasMinimoAlquiler = value; } }, metadata: _metadata }, _diasMinimoAlquiler_initializers, _diasMinimoAlquiler_extraInitializers);
            __esDecorate(null, null, _diasMaximoAlquiler_decorators, { kind: "field", name: "diasMaximoAlquiler", static: false, private: false, access: { has: obj => "diasMaximoAlquiler" in obj, get: obj => obj.diasMaximoAlquiler, set: (obj, value) => { obj.diasMaximoAlquiler = value; } }, metadata: _metadata }, _diasMaximoAlquiler_initializers, _diasMaximoAlquiler_extraInitializers);
            __esDecorate(null, null, _direccion_decorators, { kind: "field", name: "direccion", static: false, private: false, access: { has: obj => "direccion" in obj, get: obj => obj.direccion, set: (obj, value) => { obj.direccion = value; } }, metadata: _metadata }, _direccion_initializers, _direccion_extraInitializers);
            __esDecorate(null, null, _ciudad_decorators, { kind: "field", name: "ciudad", static: false, private: false, access: { has: obj => "ciudad" in obj, get: obj => obj.ciudad, set: (obj, value) => { obj.ciudad = value; } }, metadata: _metadata }, _ciudad_initializers, _ciudad_extraInitializers);
            __esDecorate(null, null, _departamento_decorators, { kind: "field", name: "departamento", static: false, private: false, access: { has: obj => "departamento" in obj, get: obj => obj.departamento, set: (obj, value) => { obj.departamento = value; } }, metadata: _metadata }, _departamento_initializers, _departamento_extraInitializers);
            __esDecorate(null, null, _codigoPostal_decorators, { kind: "field", name: "codigoPostal", static: false, private: false, access: { has: obj => "codigoPostal" in obj, get: obj => obj.codigoPostal, set: (obj, value) => { obj.codigoPostal = value; } }, metadata: _metadata }, _codigoPostal_initializers, _codigoPostal_extraInitializers);
            __esDecorate(null, null, _latitud_decorators, { kind: "field", name: "latitud", static: false, private: false, access: { has: obj => "latitud" in obj, get: obj => obj.latitud, set: (obj, value) => { obj.latitud = value; } }, metadata: _metadata }, _latitud_initializers, _latitud_extraInitializers);
            __esDecorate(null, null, _longitud_decorators, { kind: "field", name: "longitud", static: false, private: false, access: { has: obj => "longitud" in obj, get: obj => obj.longitud, set: (obj, value) => { obj.longitud = value; } }, metadata: _metadata }, _longitud_initializers, _longitud_extraInitializers);
            __esDecorate(null, null, _entregaDomicilio_decorators, { kind: "field", name: "entregaDomicilio", static: false, private: false, access: { has: obj => "entregaDomicilio" in obj, get: obj => obj.entregaDomicilio, set: (obj, value) => { obj.entregaDomicilio = value; } }, metadata: _metadata }, _entregaDomicilio_initializers, _entregaDomicilio_extraInitializers);
            __esDecorate(null, null, _retiroLocal_decorators, { kind: "field", name: "retiroLocal", static: false, private: false, access: { has: obj => "retiroLocal" in obj, get: obj => obj.retiroLocal, set: (obj, value) => { obj.retiroLocal = value; } }, metadata: _metadata }, _retiroLocal_initializers, _retiroLocal_extraInitializers);
            __esDecorate(null, null, _estadoEquipo_decorators, { kind: "field", name: "estadoEquipo", static: false, private: false, access: { has: obj => "estadoEquipo" in obj, get: obj => obj.estadoEquipo, set: (obj, value) => { obj.estadoEquipo = value; } }, metadata: _metadata }, _estadoEquipo_initializers, _estadoEquipo_extraInitializers);
            __esDecorate(null, null, _instrucciones_decorators, { kind: "field", name: "instrucciones", static: false, private: false, access: { has: obj => "instrucciones" in obj, get: obj => obj.instrucciones, set: (obj, value) => { obj.instrucciones = value; } }, metadata: _metadata }, _instrucciones_initializers, _instrucciones_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        // Información básica del instrumento/equipo musical
        titulo = __runInitializers(this, _titulo_initializers, void 0);
        descripcion = (__runInitializers(this, _titulo_extraInitializers), __runInitializers(this, _descripcion_initializers, void 0));
        categoria = (__runInitializers(this, _descripcion_extraInitializers), __runInitializers(this, _categoria_initializers, void 0));
        marca = (__runInitializers(this, _categoria_extraInitializers), __runInitializers(this, _marca_initializers, void 0));
        modelo = (__runInitializers(this, _marca_extraInitializers), __runInitializers(this, _modelo_initializers, void 0));
        anioFabricacion = (__runInitializers(this, _modelo_extraInitializers), __runInitializers(this, _anioFabricacion_initializers, void 0));
        // Información de precios
        precioPorDia = (__runInitializers(this, _anioFabricacion_extraInitializers), __runInitializers(this, _precioPorDia_initializers, void 0));
        precioPorSemana = (__runInitializers(this, _precioPorDia_extraInitializers), __runInitializers(this, _precioPorSemana_initializers, void 0));
        precioPorMes = (__runInitializers(this, _precioPorSemana_extraInitializers), __runInitializers(this, _precioPorMes_initializers, void 0));
        deposito = (__runInitializers(this, _precioPorMes_extraInitializers), __runInitializers(this, _deposito_initializers, void 0));
        // Disponibilidad y restricciones
        diasMinimoAlquiler = (__runInitializers(this, _deposito_extraInitializers), __runInitializers(this, _diasMinimoAlquiler_initializers, 1));
        diasMaximoAlquiler = (__runInitializers(this, _diasMinimoAlquiler_extraInitializers), __runInitializers(this, _diasMaximoAlquiler_initializers, void 0));
        // Ubicación del instrumento/equipo
        direccion = (__runInitializers(this, _diasMaximoAlquiler_extraInitializers), __runInitializers(this, _direccion_initializers, void 0));
        ciudad = (__runInitializers(this, _direccion_extraInitializers), __runInitializers(this, _ciudad_initializers, void 0));
        departamento = (__runInitializers(this, _ciudad_extraInitializers), __runInitializers(this, _departamento_initializers, void 0));
        codigoPostal = (__runInitializers(this, _departamento_extraInitializers), __runInitializers(this, _codigoPostal_initializers, void 0));
        latitud = (__runInitializers(this, _codigoPostal_extraInitializers), __runInitializers(this, _latitud_initializers, void 0));
        longitud = (__runInitializers(this, _latitud_extraInitializers), __runInitializers(this, _longitud_initializers, void 0));
        // Configuración de entrega
        entregaDomicilio = (__runInitializers(this, _longitud_extraInitializers), __runInitializers(this, _entregaDomicilio_initializers, false));
        retiroLocal = (__runInitializers(this, _entregaDomicilio_extraInitializers), __runInitializers(this, _retiroLocal_initializers, true));
        // Estado del equipo
        estadoEquipo = (__runInitializers(this, _retiroLocal_extraInitializers), __runInitializers(this, _estadoEquipo_initializers, void 0));
        instrucciones = (__runInitializers(this, _estadoEquipo_extraInitializers), __runInitializers(this, _instrucciones_initializers, void 0));
        constructor() {
            __runInitializers(this, _instrucciones_extraInitializers);
        }
    };
})();
exports.CrearPublicacionDto = CrearPublicacionDto;
