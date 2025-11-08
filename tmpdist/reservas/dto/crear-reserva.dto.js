"use strict";
/**
 * DTO para crear una nueva reserva
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
exports.CrearReservaDto = exports.TipoEntrega = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const date_validator_1 = require("../validators/date.validator");
var TipoEntrega;
(function (TipoEntrega) {
    TipoEntrega["DOMICILIO"] = "DOMICILIO";
    TipoEntrega["RETIRO"] = "RETIRO";
})(TipoEntrega || (exports.TipoEntrega = TipoEntrega = {}));
let CrearReservaDto = (() => {
    let _usuarioId_decorators;
    let _usuarioId_initializers = [];
    let _usuarioId_extraInitializers = [];
    let _publicacionId_decorators;
    let _publicacionId_initializers = [];
    let _publicacionId_extraInitializers = [];
    let _propietarioId_decorators;
    let _propietarioId_initializers = [];
    let _propietarioId_extraInitializers = [];
    let _fechaInicio_decorators;
    let _fechaInicio_initializers = [];
    let _fechaInicio_extraInitializers = [];
    let _fechaFin_decorators;
    let _fechaFin_initializers = [];
    let _fechaFin_extraInitializers = [];
    let _precioTotal_decorators;
    let _precioTotal_initializers = [];
    let _precioTotal_extraInitializers = [];
    let _comisionPlataforma_decorators;
    let _comisionPlataforma_initializers = [];
    let _comisionPlataforma_extraInitializers = [];
    let _tipoEntrega_decorators;
    let _tipoEntrega_initializers = [];
    let _tipoEntrega_extraInitializers = [];
    let _direccionEntrega_decorators;
    let _direccionEntrega_initializers = [];
    let _direccionEntrega_extraInitializers = [];
    let _telefonoContacto_decorators;
    let _telefonoContacto_initializers = [];
    let _telefonoContacto_extraInitializers = [];
    let _notasUsuario_decorators;
    let _notasUsuario_initializers = [];
    let _notasUsuario_extraInitializers = [];
    return class CrearReservaDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _usuarioId_decorators = [(0, class_validator_1.IsNotEmpty)({ message: 'El ID del usuario es requerido' }), (0, class_validator_1.IsString)({ message: 'El ID del usuario debe ser una cadena' })];
            _publicacionId_decorators = [(0, class_validator_1.IsNotEmpty)({ message: 'El ID de la publicación es requerido' }), (0, class_validator_1.IsString)({ message: 'El ID de la publicación debe ser una cadena' })];
            _propietarioId_decorators = [(0, class_validator_1.IsNotEmpty)({ message: 'El ID del propietario es requerido' }), (0, class_validator_1.IsString)({ message: 'El ID del propietario debe ser una cadena' })];
            _fechaInicio_decorators = [(0, class_validator_1.IsNotEmpty)({ message: 'La fecha de inicio es requerida' }), (0, class_validator_1.IsDateString)({}, { message: 'La fecha de inicio debe ser una fecha válida en formato ISO' }), (0, date_validator_1.IsFutureDate)({ message: 'La fecha de inicio debe ser en el futuro' })];
            _fechaFin_decorators = [(0, class_validator_1.IsNotEmpty)({ message: 'La fecha de fin es requerida' }), (0, class_validator_1.IsDateString)({}, { message: 'La fecha de fin debe ser una fecha válida en formato ISO' }), (0, date_validator_1.IsAfter)('fechaInicio', { message: 'La fecha de fin debe ser posterior a la fecha de inicio' })];
            _precioTotal_decorators = [(0, class_validator_1.IsNotEmpty)({ message: 'El precio total es requerido' }), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'El precio total debe ser un número decimal válido' }), (0, class_validator_1.Min)(0, { message: 'El precio total debe ser mayor o igual a 0' })];
            _comisionPlataforma_decorators = [(0, class_validator_1.IsNotEmpty)({ message: 'La comisión de la plataforma es requerida' }), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'La comisión debe ser un número decimal válido' }), (0, class_validator_1.Min)(0, { message: 'La comisión debe ser mayor o igual a 0' })];
            _tipoEntrega_decorators = [(0, class_validator_1.IsNotEmpty)({ message: 'El tipo de entrega es requerido' }), (0, class_validator_1.IsEnum)(TipoEntrega, { message: 'El tipo de entrega debe ser DOMICILIO o RETIRO' })];
            _direccionEntrega_decorators = [(0, class_validator_1.ValidateIf)(o => o.tipoEntrega === TipoEntrega.DOMICILIO), (0, class_validator_1.IsNotEmpty)({ message: 'La dirección de entrega es requerida para entregas a domicilio' }), (0, class_validator_1.IsString)({ message: 'La dirección de entrega debe ser una cadena' }), (0, class_validator_1.MaxLength)(255, { message: 'La dirección de entrega no puede exceder 255 caracteres' })];
            _telefonoContacto_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'El teléfono de contacto debe ser una cadena' }), (0, class_validator_1.MaxLength)(20, { message: 'El teléfono de contacto no puede exceder 20 caracteres' })];
            _notasUsuario_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'Las notas del usuario deben ser una cadena' }), (0, class_validator_1.MaxLength)(1000, { message: 'Las notas del usuario no pueden exceder 1000 caracteres' })];
            __esDecorate(null, null, _usuarioId_decorators, { kind: "field", name: "usuarioId", static: false, private: false, access: { has: obj => "usuarioId" in obj, get: obj => obj.usuarioId, set: (obj, value) => { obj.usuarioId = value; } }, metadata: _metadata }, _usuarioId_initializers, _usuarioId_extraInitializers);
            __esDecorate(null, null, _publicacionId_decorators, { kind: "field", name: "publicacionId", static: false, private: false, access: { has: obj => "publicacionId" in obj, get: obj => obj.publicacionId, set: (obj, value) => { obj.publicacionId = value; } }, metadata: _metadata }, _publicacionId_initializers, _publicacionId_extraInitializers);
            __esDecorate(null, null, _propietarioId_decorators, { kind: "field", name: "propietarioId", static: false, private: false, access: { has: obj => "propietarioId" in obj, get: obj => obj.propietarioId, set: (obj, value) => { obj.propietarioId = value; } }, metadata: _metadata }, _propietarioId_initializers, _propietarioId_extraInitializers);
            __esDecorate(null, null, _fechaInicio_decorators, { kind: "field", name: "fechaInicio", static: false, private: false, access: { has: obj => "fechaInicio" in obj, get: obj => obj.fechaInicio, set: (obj, value) => { obj.fechaInicio = value; } }, metadata: _metadata }, _fechaInicio_initializers, _fechaInicio_extraInitializers);
            __esDecorate(null, null, _fechaFin_decorators, { kind: "field", name: "fechaFin", static: false, private: false, access: { has: obj => "fechaFin" in obj, get: obj => obj.fechaFin, set: (obj, value) => { obj.fechaFin = value; } }, metadata: _metadata }, _fechaFin_initializers, _fechaFin_extraInitializers);
            __esDecorate(null, null, _precioTotal_decorators, { kind: "field", name: "precioTotal", static: false, private: false, access: { has: obj => "precioTotal" in obj, get: obj => obj.precioTotal, set: (obj, value) => { obj.precioTotal = value; } }, metadata: _metadata }, _precioTotal_initializers, _precioTotal_extraInitializers);
            __esDecorate(null, null, _comisionPlataforma_decorators, { kind: "field", name: "comisionPlataforma", static: false, private: false, access: { has: obj => "comisionPlataforma" in obj, get: obj => obj.comisionPlataforma, set: (obj, value) => { obj.comisionPlataforma = value; } }, metadata: _metadata }, _comisionPlataforma_initializers, _comisionPlataforma_extraInitializers);
            __esDecorate(null, null, _tipoEntrega_decorators, { kind: "field", name: "tipoEntrega", static: false, private: false, access: { has: obj => "tipoEntrega" in obj, get: obj => obj.tipoEntrega, set: (obj, value) => { obj.tipoEntrega = value; } }, metadata: _metadata }, _tipoEntrega_initializers, _tipoEntrega_extraInitializers);
            __esDecorate(null, null, _direccionEntrega_decorators, { kind: "field", name: "direccionEntrega", static: false, private: false, access: { has: obj => "direccionEntrega" in obj, get: obj => obj.direccionEntrega, set: (obj, value) => { obj.direccionEntrega = value; } }, metadata: _metadata }, _direccionEntrega_initializers, _direccionEntrega_extraInitializers);
            __esDecorate(null, null, _telefonoContacto_decorators, { kind: "field", name: "telefonoContacto", static: false, private: false, access: { has: obj => "telefonoContacto" in obj, get: obj => obj.telefonoContacto, set: (obj, value) => { obj.telefonoContacto = value; } }, metadata: _metadata }, _telefonoContacto_initializers, _telefonoContacto_extraInitializers);
            __esDecorate(null, null, _notasUsuario_decorators, { kind: "field", name: "notasUsuario", static: false, private: false, access: { has: obj => "notasUsuario" in obj, get: obj => obj.notasUsuario, set: (obj, value) => { obj.notasUsuario = value; } }, metadata: _metadata }, _notasUsuario_initializers, _notasUsuario_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        usuarioId = __runInitializers(this, _usuarioId_initializers, void 0);
        publicacionId = (__runInitializers(this, _usuarioId_extraInitializers), __runInitializers(this, _publicacionId_initializers, void 0));
        propietarioId = (__runInitializers(this, _publicacionId_extraInitializers), __runInitializers(this, _propietarioId_initializers, void 0));
        fechaInicio = (__runInitializers(this, _propietarioId_extraInitializers), __runInitializers(this, _fechaInicio_initializers, void 0));
        fechaFin = (__runInitializers(this, _fechaInicio_extraInitializers), __runInitializers(this, _fechaFin_initializers, void 0));
        precioTotal = (__runInitializers(this, _fechaFin_extraInitializers), __runInitializers(this, _precioTotal_initializers, void 0));
        comisionPlataforma = (__runInitializers(this, _precioTotal_extraInitializers), __runInitializers(this, _comisionPlataforma_initializers, void 0));
        tipoEntrega = (__runInitializers(this, _comisionPlataforma_extraInitializers), __runInitializers(this, _tipoEntrega_initializers, void 0));
        direccionEntrega = (__runInitializers(this, _tipoEntrega_extraInitializers), __runInitializers(this, _direccionEntrega_initializers, void 0));
        telefonoContacto = (__runInitializers(this, _direccionEntrega_extraInitializers), __runInitializers(this, _telefonoContacto_initializers, void 0));
        notasUsuario = (__runInitializers(this, _telefonoContacto_extraInitializers), __runInitializers(this, _notasUsuario_initializers, void 0));
        constructor() {
            __runInitializers(this, _notasUsuario_extraInitializers);
        }
    };
})();
exports.CrearReservaDto = CrearReservaDto;
