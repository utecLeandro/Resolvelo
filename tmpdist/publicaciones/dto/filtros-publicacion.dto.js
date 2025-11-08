"use strict";
/**
 * DTO para filtrar y buscar publicaciones
 * Incluye parámetros de búsqueda, filtros y paginación
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
exports.FiltrosPublicacionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
let FiltrosPublicacionDto = (() => {
    let _busqueda_decorators;
    let _busqueda_initializers = [];
    let _busqueda_extraInitializers = [];
    let _categoria_decorators;
    let _categoria_initializers = [];
    let _categoria_extraInitializers = [];
    let _ciudad_decorators;
    let _ciudad_initializers = [];
    let _ciudad_extraInitializers = [];
    let _departamento_decorators;
    let _departamento_initializers = [];
    let _departamento_extraInitializers = [];
    let _precioMinimo_decorators;
    let _precioMinimo_initializers = [];
    let _precioMinimo_extraInitializers = [];
    let _precioMaximo_decorators;
    let _precioMaximo_initializers = [];
    let _precioMaximo_extraInitializers = [];
    let _disponible_decorators;
    let _disponible_initializers = [];
    let _disponible_extraInitializers = [];
    let _entregaDomicilio_decorators;
    let _entregaDomicilio_initializers = [];
    let _entregaDomicilio_extraInitializers = [];
    let _retiroLocal_decorators;
    let _retiroLocal_initializers = [];
    let _retiroLocal_extraInitializers = [];
    let _estado_decorators;
    let _estado_initializers = [];
    let _estado_extraInitializers = [];
    let _calificacionMinima_decorators;
    let _calificacionMinima_initializers = [];
    let _calificacionMinima_extraInitializers = [];
    let _ordenarPor_decorators;
    let _ordenarPor_initializers = [];
    let _ordenarPor_extraInitializers = [];
    let _direccionOrden_decorators;
    let _direccionOrden_initializers = [];
    let _direccionOrden_extraInitializers = [];
    let _pagina_decorators;
    let _pagina_initializers = [];
    let _pagina_extraInitializers = [];
    let _limite_decorators;
    let _limite_initializers = [];
    let _limite_extraInitializers = [];
    let _latitud_decorators;
    let _latitud_initializers = [];
    let _latitud_extraInitializers = [];
    let _longitud_decorators;
    let _longitud_initializers = [];
    let _longitud_extraInitializers = [];
    let _radioKm_decorators;
    let _radioKm_initializers = [];
    let _radioKm_extraInitializers = [];
    let _fechaInicio_decorators;
    let _fechaInicio_initializers = [];
    let _fechaInicio_extraInitializers = [];
    let _fechaFin_decorators;
    let _fechaFin_initializers = [];
    let _fechaFin_extraInitializers = [];
    return class FiltrosPublicacionDto {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _busqueda_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'El término de búsqueda debe ser una cadena de texto' })];
            _categoria_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.CategoriaEquipo, { message: 'La categoría debe ser válida' })];
            _ciudad_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'La ciudad debe ser una cadena de texto' })];
            _departamento_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'El departamento debe ser una cadena de texto' })];
            _precioMinimo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({}, { message: 'El precio mínimo debe ser un número válido' }), (0, class_validator_1.Min)(0, { message: 'El precio mínimo debe ser mayor o igual a 0' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _precioMaximo_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)({}, { message: 'El precio máximo debe ser un número válido' }), (0, class_validator_1.Min)(0, { message: 'El precio máximo debe ser mayor o igual a 0' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _disponible_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)({ message: 'La disponibilidad debe ser verdadero o falso' }), (0, class_transformer_1.Transform)(({ value }) => {
                    if (value === undefined || value === null || value === '')
                        return undefined;
                    return value === 'true' || value === true;
                })];
            _entregaDomicilio_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)({ message: 'La entrega a domicilio debe ser verdadero o falso' }), (0, class_transformer_1.Transform)(({ value }) => {
                    if (value === undefined || value === null || value === '')
                        return undefined;
                    return value === 'true' || value === true;
                })];
            _retiroLocal_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)({ message: 'El retiro local debe ser verdadero o falso' }), (0, class_transformer_1.Transform)(({ value }) => {
                    if (value === undefined || value === null || value === '')
                        return undefined;
                    return value === 'true' || value === true;
                })];
            _estado_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.EstadoPublicacion, { message: 'El estado debe ser válido' })];
            _calificacionMinima_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDecimal)({ decimal_digits: '2' }, { message: 'La calificación mínima debe ser un decimal válido' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined), (0, class_validator_1.Min)(0, { message: 'La calificación mínima debe ser mayor o igual a 0' }), (0, class_validator_1.Max)(5, { message: 'La calificación mínima debe ser menor o igual a 5' })];
            _ordenarPor_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'El campo de ordenamiento debe ser una cadena de texto' })];
            _direccionOrden_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)({ message: 'La dirección de ordenamiento debe ser una cadena de texto' })];
            _pagina_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsInt)({ message: 'La página debe ser un número entero' }), (0, class_validator_1.Min)(1, { message: 'La página debe ser mayor a 0' })];
            _limite_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => Number), (0, class_validator_1.IsInt)({ message: 'El límite debe ser un número entero' }), (0, class_validator_1.Min)(1, { message: 'El límite debe ser mayor a 0' }), (0, class_validator_1.Max)(100, { message: 'El límite no puede ser mayor a 100' })];
            _latitud_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDecimal)({ decimal_digits: '8' }, { message: 'La latitud debe ser un decimal válido' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _longitud_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDecimal)({ decimal_digits: '8' }, { message: 'La longitud debe ser un decimal válido' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined)];
            _radioKm_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDecimal)({ decimal_digits: '2' }, { message: 'El radio debe ser un decimal válido' }), (0, class_transformer_1.Transform)(({ value }) => value ? parseFloat(value) : undefined), (0, class_validator_1.Min)(0.1, { message: 'El radio debe ser mayor a 0.1 km' }), (0, class_validator_1.Max)(100, { message: 'El radio no puede ser mayor a 100 km' })];
            _fechaInicio_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)({ message: 'La fecha de inicio debe ser una fecha válida' })];
            _fechaFin_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)({ message: 'La fecha de fin debe ser una fecha válida' })];
            __esDecorate(null, null, _busqueda_decorators, { kind: "field", name: "busqueda", static: false, private: false, access: { has: obj => "busqueda" in obj, get: obj => obj.busqueda, set: (obj, value) => { obj.busqueda = value; } }, metadata: _metadata }, _busqueda_initializers, _busqueda_extraInitializers);
            __esDecorate(null, null, _categoria_decorators, { kind: "field", name: "categoria", static: false, private: false, access: { has: obj => "categoria" in obj, get: obj => obj.categoria, set: (obj, value) => { obj.categoria = value; } }, metadata: _metadata }, _categoria_initializers, _categoria_extraInitializers);
            __esDecorate(null, null, _ciudad_decorators, { kind: "field", name: "ciudad", static: false, private: false, access: { has: obj => "ciudad" in obj, get: obj => obj.ciudad, set: (obj, value) => { obj.ciudad = value; } }, metadata: _metadata }, _ciudad_initializers, _ciudad_extraInitializers);
            __esDecorate(null, null, _departamento_decorators, { kind: "field", name: "departamento", static: false, private: false, access: { has: obj => "departamento" in obj, get: obj => obj.departamento, set: (obj, value) => { obj.departamento = value; } }, metadata: _metadata }, _departamento_initializers, _departamento_extraInitializers);
            __esDecorate(null, null, _precioMinimo_decorators, { kind: "field", name: "precioMinimo", static: false, private: false, access: { has: obj => "precioMinimo" in obj, get: obj => obj.precioMinimo, set: (obj, value) => { obj.precioMinimo = value; } }, metadata: _metadata }, _precioMinimo_initializers, _precioMinimo_extraInitializers);
            __esDecorate(null, null, _precioMaximo_decorators, { kind: "field", name: "precioMaximo", static: false, private: false, access: { has: obj => "precioMaximo" in obj, get: obj => obj.precioMaximo, set: (obj, value) => { obj.precioMaximo = value; } }, metadata: _metadata }, _precioMaximo_initializers, _precioMaximo_extraInitializers);
            __esDecorate(null, null, _disponible_decorators, { kind: "field", name: "disponible", static: false, private: false, access: { has: obj => "disponible" in obj, get: obj => obj.disponible, set: (obj, value) => { obj.disponible = value; } }, metadata: _metadata }, _disponible_initializers, _disponible_extraInitializers);
            __esDecorate(null, null, _entregaDomicilio_decorators, { kind: "field", name: "entregaDomicilio", static: false, private: false, access: { has: obj => "entregaDomicilio" in obj, get: obj => obj.entregaDomicilio, set: (obj, value) => { obj.entregaDomicilio = value; } }, metadata: _metadata }, _entregaDomicilio_initializers, _entregaDomicilio_extraInitializers);
            __esDecorate(null, null, _retiroLocal_decorators, { kind: "field", name: "retiroLocal", static: false, private: false, access: { has: obj => "retiroLocal" in obj, get: obj => obj.retiroLocal, set: (obj, value) => { obj.retiroLocal = value; } }, metadata: _metadata }, _retiroLocal_initializers, _retiroLocal_extraInitializers);
            __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: obj => "estado" in obj, get: obj => obj.estado, set: (obj, value) => { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
            __esDecorate(null, null, _calificacionMinima_decorators, { kind: "field", name: "calificacionMinima", static: false, private: false, access: { has: obj => "calificacionMinima" in obj, get: obj => obj.calificacionMinima, set: (obj, value) => { obj.calificacionMinima = value; } }, metadata: _metadata }, _calificacionMinima_initializers, _calificacionMinima_extraInitializers);
            __esDecorate(null, null, _ordenarPor_decorators, { kind: "field", name: "ordenarPor", static: false, private: false, access: { has: obj => "ordenarPor" in obj, get: obj => obj.ordenarPor, set: (obj, value) => { obj.ordenarPor = value; } }, metadata: _metadata }, _ordenarPor_initializers, _ordenarPor_extraInitializers);
            __esDecorate(null, null, _direccionOrden_decorators, { kind: "field", name: "direccionOrden", static: false, private: false, access: { has: obj => "direccionOrden" in obj, get: obj => obj.direccionOrden, set: (obj, value) => { obj.direccionOrden = value; } }, metadata: _metadata }, _direccionOrden_initializers, _direccionOrden_extraInitializers);
            __esDecorate(null, null, _pagina_decorators, { kind: "field", name: "pagina", static: false, private: false, access: { has: obj => "pagina" in obj, get: obj => obj.pagina, set: (obj, value) => { obj.pagina = value; } }, metadata: _metadata }, _pagina_initializers, _pagina_extraInitializers);
            __esDecorate(null, null, _limite_decorators, { kind: "field", name: "limite", static: false, private: false, access: { has: obj => "limite" in obj, get: obj => obj.limite, set: (obj, value) => { obj.limite = value; } }, metadata: _metadata }, _limite_initializers, _limite_extraInitializers);
            __esDecorate(null, null, _latitud_decorators, { kind: "field", name: "latitud", static: false, private: false, access: { has: obj => "latitud" in obj, get: obj => obj.latitud, set: (obj, value) => { obj.latitud = value; } }, metadata: _metadata }, _latitud_initializers, _latitud_extraInitializers);
            __esDecorate(null, null, _longitud_decorators, { kind: "field", name: "longitud", static: false, private: false, access: { has: obj => "longitud" in obj, get: obj => obj.longitud, set: (obj, value) => { obj.longitud = value; } }, metadata: _metadata }, _longitud_initializers, _longitud_extraInitializers);
            __esDecorate(null, null, _radioKm_decorators, { kind: "field", name: "radioKm", static: false, private: false, access: { has: obj => "radioKm" in obj, get: obj => obj.radioKm, set: (obj, value) => { obj.radioKm = value; } }, metadata: _metadata }, _radioKm_initializers, _radioKm_extraInitializers);
            __esDecorate(null, null, _fechaInicio_decorators, { kind: "field", name: "fechaInicio", static: false, private: false, access: { has: obj => "fechaInicio" in obj, get: obj => obj.fechaInicio, set: (obj, value) => { obj.fechaInicio = value; } }, metadata: _metadata }, _fechaInicio_initializers, _fechaInicio_extraInitializers);
            __esDecorate(null, null, _fechaFin_decorators, { kind: "field", name: "fechaFin", static: false, private: false, access: { has: obj => "fechaFin" in obj, get: obj => obj.fechaFin, set: (obj, value) => { obj.fechaFin = value; } }, metadata: _metadata }, _fechaFin_initializers, _fechaFin_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        // Búsqueda por texto
        busqueda = __runInitializers(this, _busqueda_initializers, void 0);
        // Filtros por categoría
        categoria = (__runInitializers(this, _busqueda_extraInitializers), __runInitializers(this, _categoria_initializers, void 0));
        // Filtros por ubicación
        ciudad = (__runInitializers(this, _categoria_extraInitializers), __runInitializers(this, _ciudad_initializers, void 0));
        departamento = (__runInitializers(this, _ciudad_extraInitializers), __runInitializers(this, _departamento_initializers, void 0));
        // Filtros por precio
        precioMinimo = (__runInitializers(this, _departamento_extraInitializers), __runInitializers(this, _precioMinimo_initializers, void 0));
        precioMaximo = (__runInitializers(this, _precioMinimo_extraInitializers), __runInitializers(this, _precioMaximo_initializers, void 0));
        // Filtros por disponibilidad
        disponible = (__runInitializers(this, _precioMaximo_extraInitializers), __runInitializers(this, _disponible_initializers, void 0));
        entregaDomicilio = (__runInitializers(this, _disponible_extraInitializers), __runInitializers(this, _entregaDomicilio_initializers, void 0));
        retiroLocal = (__runInitializers(this, _entregaDomicilio_extraInitializers), __runInitializers(this, _retiroLocal_initializers, void 0));
        // Filtros por estado
        estado = (__runInitializers(this, _retiroLocal_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
        // Filtros por calificación
        calificacionMinima = (__runInitializers(this, _estado_extraInitializers), __runInitializers(this, _calificacionMinima_initializers, void 0));
        // Ordenamiento
        ordenarPor = (__runInitializers(this, _calificacionMinima_extraInitializers), __runInitializers(this, _ordenarPor_initializers, 'fechaCreacion'));
        direccionOrden = (__runInitializers(this, _ordenarPor_extraInitializers), __runInitializers(this, _direccionOrden_initializers, 'desc'));
        // Paginación
        pagina = (__runInitializers(this, _direccionOrden_extraInitializers), __runInitializers(this, _pagina_initializers, 1));
        limite = (__runInitializers(this, _pagina_extraInitializers), __runInitializers(this, _limite_initializers, 10));
        // Filtros geográficos (para búsqueda por proximidad)
        latitud = (__runInitializers(this, _limite_extraInitializers), __runInitializers(this, _latitud_initializers, void 0));
        longitud = (__runInitializers(this, _latitud_extraInitializers), __runInitializers(this, _longitud_initializers, void 0));
        radioKm = (__runInitializers(this, _longitud_extraInitializers), __runInitializers(this, _radioKm_initializers, void 0));
        // Filtro por rango de fechas (para verificar disponibilidad)
        fechaInicio = (__runInitializers(this, _radioKm_extraInitializers), __runInitializers(this, _fechaInicio_initializers, void 0));
        fechaFin = (__runInitializers(this, _fechaInicio_extraInitializers), __runInitializers(this, _fechaFin_initializers, void 0));
        constructor() {
            __runInitializers(this, _fechaFin_extraInitializers);
        }
    };
})();
exports.FiltrosPublicacionDto = FiltrosPublicacionDto;
