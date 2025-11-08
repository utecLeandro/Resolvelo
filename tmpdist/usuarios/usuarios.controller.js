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
exports.UsuariosController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UsuariosController = (() => {
    let _classDecorators = [(0, common_1.Controller)('usuarios'), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true }))];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _testReservas_decorators;
    let _obtenerMisSolicitudes_decorators;
    let _obtenerMisReservas_decorators;
    let _crearReserva_decorators;
    let _actualizarReserva_decorators;
    let _cancelarReserva_decorators;
    let _confirmarReserva_decorators;
    let _aceptarReserva_decorators;
    let _rechazarReserva_decorators;
    let _obtenerMisReservasActivas_decorators;
    let _obtenerMiHistorialReservas_decorators;
    let _testSimple_decorators;
    let _obtenerTodasMisSolicitudes_decorators;
    let _activarReserva_decorators;
    let _obtenerReserva_decorators;
    let _obtenerPorId_decorators;
    let _actualizarPerfil_decorators;
    var UsuariosController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _testReservas_decorators = [(0, common_1.Get)('test/reservas')];
            _obtenerMisSolicitudes_decorators = [(0, common_1.Get)('reservas/mis-solicitudes'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _obtenerMisReservas_decorators = [(0, common_1.Get)('reservas/mis-reservas'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _crearReserva_decorators = [(0, common_1.Post)('reservas/crear'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
            _actualizarReserva_decorators = [(0, common_1.Patch)('reservas/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _cancelarReserva_decorators = [(0, common_1.Patch)('reservas/:id/cancelar'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _confirmarReserva_decorators = [(0, common_1.Patch)('reservas/:id/confirmar'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _aceptarReserva_decorators = [(0, common_1.Patch)('reservas/:id/aceptar'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _rechazarReserva_decorators = [(0, common_1.Patch)('reservas/:id/rechazar'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _obtenerMisReservasActivas_decorators = [(0, common_1.Get)('reservas/mis-reservas-activas'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _obtenerMiHistorialReservas_decorators = [(0, common_1.Get)('reservas/mi-historial-reservas'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _testSimple_decorators = [(0, common_1.Get)('reservas/test-simple')];
            _obtenerTodasMisSolicitudes_decorators = [(0, common_1.Get)('reservas/todas-mis-solicitudes'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _activarReserva_decorators = [(0, common_1.Post)('reservas/:id/activar'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _obtenerReserva_decorators = [(0, common_1.Get)('reservas/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
            _obtenerPorId_decorators = [(0, common_1.Get)(':id')];
            _actualizarPerfil_decorators = [(0, common_1.Patch)(':id'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            __esDecorate(this, null, _testReservas_decorators, { kind: "method", name: "testReservas", static: false, private: false, access: { has: obj => "testReservas" in obj, get: obj => obj.testReservas }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerMisSolicitudes_decorators, { kind: "method", name: "obtenerMisSolicitudes", static: false, private: false, access: { has: obj => "obtenerMisSolicitudes" in obj, get: obj => obj.obtenerMisSolicitudes }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerMisReservas_decorators, { kind: "method", name: "obtenerMisReservas", static: false, private: false, access: { has: obj => "obtenerMisReservas" in obj, get: obj => obj.obtenerMisReservas }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _crearReserva_decorators, { kind: "method", name: "crearReserva", static: false, private: false, access: { has: obj => "crearReserva" in obj, get: obj => obj.crearReserva }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _actualizarReserva_decorators, { kind: "method", name: "actualizarReserva", static: false, private: false, access: { has: obj => "actualizarReserva" in obj, get: obj => obj.actualizarReserva }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelarReserva_decorators, { kind: "method", name: "cancelarReserva", static: false, private: false, access: { has: obj => "cancelarReserva" in obj, get: obj => obj.cancelarReserva }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _confirmarReserva_decorators, { kind: "method", name: "confirmarReserva", static: false, private: false, access: { has: obj => "confirmarReserva" in obj, get: obj => obj.confirmarReserva }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _aceptarReserva_decorators, { kind: "method", name: "aceptarReserva", static: false, private: false, access: { has: obj => "aceptarReserva" in obj, get: obj => obj.aceptarReserva }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rechazarReserva_decorators, { kind: "method", name: "rechazarReserva", static: false, private: false, access: { has: obj => "rechazarReserva" in obj, get: obj => obj.rechazarReserva }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerMisReservasActivas_decorators, { kind: "method", name: "obtenerMisReservasActivas", static: false, private: false, access: { has: obj => "obtenerMisReservasActivas" in obj, get: obj => obj.obtenerMisReservasActivas }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerMiHistorialReservas_decorators, { kind: "method", name: "obtenerMiHistorialReservas", static: false, private: false, access: { has: obj => "obtenerMiHistorialReservas" in obj, get: obj => obj.obtenerMiHistorialReservas }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _testSimple_decorators, { kind: "method", name: "testSimple", static: false, private: false, access: { has: obj => "testSimple" in obj, get: obj => obj.testSimple }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerTodasMisSolicitudes_decorators, { kind: "method", name: "obtenerTodasMisSolicitudes", static: false, private: false, access: { has: obj => "obtenerTodasMisSolicitudes" in obj, get: obj => obj.obtenerTodasMisSolicitudes }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _activarReserva_decorators, { kind: "method", name: "activarReserva", static: false, private: false, access: { has: obj => "activarReserva" in obj, get: obj => obj.activarReserva }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerReserva_decorators, { kind: "method", name: "obtenerReserva", static: false, private: false, access: { has: obj => "obtenerReserva" in obj, get: obj => obj.obtenerReserva }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _obtenerPorId_decorators, { kind: "method", name: "obtenerPorId", static: false, private: false, access: { has: obj => "obtenerPorId" in obj, get: obj => obj.obtenerPorId }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _actualizarPerfil_decorators, { kind: "method", name: "actualizarPerfil", static: false, private: false, access: { has: obj => "actualizarPerfil" in obj, get: obj => obj.actualizarPerfil }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            UsuariosController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        usuariosService = __runInitializers(this, _instanceExtraInitializers);
        reservasService;
        constructor(usuariosService, reservasService) {
            this.usuariosService = usuariosService;
            this.reservasService = reservasService;
        }
        async testReservas() {
            return {
                message: 'Ruta de prueba para reservas funcionando',
                timestamp: new Date().toISOString(),
                status: 'OK'
            };
        }
        async obtenerMisSolicitudes(req) {
            const propietarioId = req.user.id; // El ID del usuario autenticado
            console.log('🔍 [MIS-SOLICITUDES] Usuario autenticado:', {
                propietarioId,
                userObject: req.user,
                email: req.user?.email
            });
            const resultado = await this.reservasService.obtenerSolicitudesPendientes(propietarioId);
            console.log('📋 [MIS-SOLICITUDES] Resultado:', {
                propietarioId,
                cantidadSolicitudes: resultado.data?.length || 0
            });
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async obtenerMisReservas(req) {
            const arrendatarioId = req.user.id; // El ID del usuario autenticado
            console.log('🔍 [MIS-RESERVAS] Usuario autenticado:', {
                arrendatarioId,
                userObject: req.user,
                email: req.user?.email
            });
            const resultado = await this.reservasService.obtenerReservasArrendatario(arrendatarioId);
            console.log('📋 [MIS-RESERVAS] Resultado:', {
                arrendatarioId,
                cantidadReservas: resultado.data?.length || 0
            });
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async crearReserva(data, req) {
            try {
                const resultado = await this.reservasService.crearReserva(data);
                return {
                    ...resultado,
                    timestamp: new Date().toISOString()
                };
            }
            catch (error) {
                // Las excepciones ya están siendo manejadas por NestJS
                // Solo necesitamos relanzarlas para que el framework las procese
                throw error;
            }
        }
        async actualizarReserva(id, data, req) {
            const resultado = await this.reservasService.actualizarReserva(id, data);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async cancelarReserva(id, req) {
            const resultado = await this.reservasService.cancelarReserva(id);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async confirmarReserva(id, req) {
            const resultado = await this.reservasService.confirmarReserva(id);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async aceptarReserva(id, req) {
            const resultado = await this.reservasService.aceptarReserva(id);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async rechazarReserva(id, req) {
            const resultado = await this.reservasService.rechazarReserva(id);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async obtenerMisReservasActivas(req) {
            const propietarioId = req.user.id;
            console.log('🔍 [USUARIOS-CONTROLLER] Obteniendo reservas activas para propietario:', propietarioId);
            const resultado = await this.reservasService.obtenerReservasActivasPropietario(propietarioId);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async obtenerMiHistorialReservas(req) {
            const propietarioId = req.user.id;
            console.log('🔍 [USUARIOS-CONTROLLER] Obteniendo historial de reservas para propietario:', propietarioId);
            const resultado = await this.reservasService.obtenerHistorialReservasPropietario(propietarioId);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async testSimple() {
            console.log('🎯 [USUARIOS-CONTROLLER] Test simple ejecutado');
            return { message: 'Test simple funcionando', timestamp: new Date().toISOString() };
        }
        async obtenerTodasMisSolicitudes(req) {
            console.log('🚀🚀🚀 [USUARIOS-CONTROLLER] obtenerTodasMisSolicitudes - MÉTODO EJECUTÁNDOSE 🚀🚀🚀');
            console.log('🎯 [USUARIOS-CONTROLLER] obtenerTodasMisSolicitudes - Iniciando');
            console.log('🎯 [USUARIOS-CONTROLLER] Usuario autenticado:', req.user);
            const propietarioId = req.user.id;
            console.log('🎯 [USUARIOS-CONTROLLER] PropietarioId extraído:', propietarioId);
            try {
                const resultado = await this.reservasService.obtenerTodasLasSolicitudes(propietarioId);
                console.log('🎯 [USUARIOS-CONTROLLER] Resultado del servicio:', resultado);
                return {
                    ...resultado,
                    timestamp: new Date().toISOString()
                };
            }
            catch (error) {
                console.error('🎯 [USUARIOS-CONTROLLER] Error en obtenerTodasMisSolicitudes:', error);
                throw error;
            }
        }
        async activarReserva(reservaId, req) {
            try {
                console.log('🔥 [USUARIOS-CONTROLLER] Activando reserva:', reservaId);
                const resultado = await this.reservasService.activarReserva(reservaId);
                console.log('✅ [USUARIOS-CONTROLLER] Reserva activada exitosamente:', resultado);
                return resultado;
            }
            catch (error) {
                console.error('❌ [USUARIOS-CONTROLLER] Error al activar reserva:', error);
                throw error;
            }
        }
        // Rutas con parámetros deben ir al final para evitar conflictos
        async obtenerReserva(id, req) {
            const resultado = await this.reservasService.obtenerReservaPorId(id);
            return {
                ...resultado,
                timestamp: new Date().toISOString()
            };
        }
        async obtenerPorId(id) {
            return this.usuariosService.obtenerPorId(id);
        }
        async actualizarPerfil(id, body) {
            return this.usuariosService.actualizarPerfil(id, body);
        }
    };
    return UsuariosController = _classThis;
})();
exports.UsuariosController = UsuariosController;
