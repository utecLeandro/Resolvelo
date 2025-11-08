"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicacionesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
/**
 * Controlador para gestionar las publicaciones de equipos musicales
 * Implementa operaciones CRUD completas con validaciones de seguridad
 */
let PublicacionesController = (() => {
    let _classDecorators = [(0, common_1.Controller)('publicaciones'), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true }))];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _crear_decorators;
    let _obtenerTodas_decorators;
    let _obtenerMisPublicaciones_decorators;
    let _obtenerPorId_decorators;
    let _actualizar_decorators;
    let _eliminar_decorators;
    let _buscar_decorators;
    let _obtenerPorCategoria_decorators;
    let _obtenerDisponibles_decorators;
    let _obtenerReservasActivas_decorators;
    let _verificarDisponibilidad_decorators;
    var PublicacionesController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _crear_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
            _obtenerTodas_decorators = [(0, common_1.Get)()];
            _obtenerMisPublicaciones_decorators = [(0, common_1.Get)('mis-publicaciones'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _obtenerPorId_decorators = [(0, common_1.Get)(':id')];
            _actualizar_decorators = [(0, common_1.Patch)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _eliminar_decorators = [(0, common_1.Delete)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT)];
            _buscar_decorators = [(0, common_1.Get)('buscar/:termino')];
            _obtenerPorCategoria_decorators = [(0, common_1.Get)('categoria/:categoria')];
            _obtenerDisponibles_decorators = [(0, common_1.Get)('disponibles/:fechaInicio/:fechaFin')];
            _obtenerReservasActivas_decorators = [(0, common_1.Get)(':id/reservas-activas')];
            _verificarDisponibilidad_decorators = [(0, common_1.Get)(':id/disponibilidad/:fechaInicio/:fechaFin')];
            __esDecorate(this, null, _crear_decorators, { kind: "method", name: "crear", static: false, private: false, access: { has: obj => "crear" in obj, get: obj => obj.crear }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerTodas_decorators, { kind: "method", name: "obtenerTodas", static: false, private: false, access: { has: obj => "obtenerTodas" in obj, get: obj => obj.obtenerTodas }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerMisPublicaciones_decorators, { kind: "method", name: "obtenerMisPublicaciones", static: false, private: false, access: { has: obj => "obtenerMisPublicaciones" in obj, get: obj => obj.obtenerMisPublicaciones }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerPorId_decorators, { kind: "method", name: "obtenerPorId", static: false, private: false, access: { has: obj => "obtenerPorId" in obj, get: obj => obj.obtenerPorId }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _actualizar_decorators, { kind: "method", name: "actualizar", static: false, private: false, access: { has: obj => "actualizar" in obj, get: obj => obj.actualizar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _eliminar_decorators, { kind: "method", name: "eliminar", static: false, private: false, access: { has: obj => "eliminar" in obj, get: obj => obj.eliminar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _buscar_decorators, { kind: "method", name: "buscar", static: false, private: false, access: { has: obj => "buscar" in obj, get: obj => obj.buscar }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerPorCategoria_decorators, { kind: "method", name: "obtenerPorCategoria", static: false, private: false, access: { has: obj => "obtenerPorCategoria" in obj, get: obj => obj.obtenerPorCategoria }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerDisponibles_decorators, { kind: "method", name: "obtenerDisponibles", static: false, private: false, access: { has: obj => "obtenerDisponibles" in obj, get: obj => obj.obtenerDisponibles }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerReservasActivas_decorators, { kind: "method", name: "obtenerReservasActivas", static: false, private: false, access: { has: obj => "obtenerReservasActivas" in obj, get: obj => obj.obtenerReservasActivas }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _verificarDisponibilidad_decorators, { kind: "method", name: "verificarDisponibilidad", static: false, private: false, access: { has: obj => "verificarDisponibilidad" in obj, get: obj => obj.verificarDisponibilidad }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PublicacionesController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        publicacionesService = __runInitializers(this, _instanceExtraInitializers);
        constructor(publicacionesService) {
            this.publicacionesService = publicacionesService;
        }
        /**
         * Crear una nueva publicación de equipo musical
         * Requiere autenticación JWT
         */
        async crear(crearPublicacionDto, req) {
            return this.publicacionesService.crearPublicacion(req.user.id, crearPublicacionDto);
        }
        /**
         * Obtener todas las publicaciones con filtros opcionales
         * Endpoint público para búsqueda y navegación
         */
        async obtenerTodas(filtros) {
            return this.publicacionesService.obtenerPublicaciones(filtros);
        }
        /**
         * Obtener publicaciones del usuario autenticado
         */
        async obtenerMisPublicaciones(req) {
            const usuarioId = req.user.id; // El ID del usuario viene del objeto user
            const filtros = {};
            return this.publicacionesService.obtenerPublicacionesUsuario(usuarioId, filtros);
        }
        /**
         * Obtener una publicación específica por ID
         * Endpoint público para ver detalles de una publicación
         */
        async obtenerPorId(id) {
            return this.publicacionesService.obtenerPublicacionPorId(id);
        }
        /**
         * Actualizar una publicación existente
         * Requiere autenticación JWT
         */
        async actualizar(id, actualizarPublicacionDto, req) {
            return this.publicacionesService.actualizarPublicacion(id, req.user.id, actualizarPublicacionDto);
        }
        /**
         * Eliminar (soft delete) una publicación
         * Requiere autenticación JWT
         */
        async eliminar(id, req) {
            await this.publicacionesService.eliminarPublicacion(id, req.user.id);
        }
        /**
         * Buscar publicaciones por texto
         * Búsqueda en título y descripción
         */
        async buscar(termino, filtros) {
            const filtrosConBusqueda = {
                ...filtros,
                busqueda: termino,
            };
            return this.publicacionesService.obtenerPublicaciones(filtrosConBusqueda);
        }
        /**
         * Obtener publicaciones por categoría
         * Filtrado específico por tipo de equipo musical
         */
        async obtenerPorCategoria(categoria, filtros) {
            const filtrosConCategoria = {
                ...filtros,
                categoria: categoria, // Conversión temporal hasta validar enum
            };
            return this.publicacionesService.obtenerPublicaciones(filtrosConCategoria);
        }
        /**
         * Obtener publicaciones disponibles en un rango de fechas
         * Útil para verificar disponibilidad antes de reservar
         */
        async obtenerDisponibles(fechaInicio, fechaFin, filtros) {
            const filtrosConFechas = {
                ...filtros,
                fechaInicio: new Date(fechaInicio),
                fechaFin: new Date(fechaFin),
            };
            return this.publicacionesService.obtenerPublicaciones(filtrosConFechas);
        }
        /**
         * Obtener reservas activas (rangos ocupados) de una publicación específica
         * Estados considerados: PENDIENTE, CONFIRMADA, EN_CURSO
         */
        async obtenerReservasActivas(id) {
            return this.publicacionesService.obtenerReservasActivasPorPublicacion(id);
        }
        /**
         * Verificar disponibilidad de una publicación en un rango de fechas
         * Devuelve { disponible: boolean }
         */
        async verificarDisponibilidad(id, fechaInicio, fechaFin) {
            return this.publicacionesService.verificarDisponibilidadPublicacion(id, new Date(fechaInicio), new Date(fechaFin));
        }
    };
    return PublicacionesController = _classThis;
})();
exports.PublicacionesController = PublicacionesController;
