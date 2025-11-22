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
exports.__APP_MODULE_MARKER__ = exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const health_controller_1 = require("./health/health.controller");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const publicaciones_module_1 = require("./publicaciones/publicaciones.module");
const usuarios_module_1 = require("./usuarios/usuarios.module");
const admin_module_1 = require("./admin/admin.module");
const admin_debug_controller_1 = require("./admin/admin-debug.controller");
const transacciones_module_1 = require("./transacciones/transacciones.module");
const transacciones_controller_1 = require("./transacciones/transacciones.controller");
const webhook_controller_1 = require("./transacciones/webhook.controller");
const transacciones_service_1 = require("./transacciones/transacciones.service");
let AppModule = class AppModule {
    constructor() {
        try {
            const resolvedAppModule = require.resolve('./app.module');
            console.log('[AppModule] require.resolve(./app.module) ->', resolvedAppModule);
        }
        catch { }
        console.log('[AppModule] __APP_MODULE_MARKER__ ->', exports.__APP_MODULE_MARKER__);
        console.log('[AppModule] typeof TransaccionesModule ->', typeof transacciones_module_1.TransaccionesModule);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            publicaciones_module_1.PublicacionesModule,
            usuarios_module_1.UsuariosModule,
            admin_module_1.AdminModule,
            transacciones_module_1.TransaccionesModule,
        ],
        controllers: [health_controller_1.HealthController, admin_debug_controller_1.AdminDebugController, transacciones_controller_1.TransaccionesController, webhook_controller_1.TransaccionesWebhookController],
        providers: [transacciones_service_1.TransaccionesService],
    }),
    __metadata("design:paramtypes", [])
], AppModule);
exports.__APP_MODULE_MARKER__ = 'Admin+TransaccionesIncluded_v2';
//# sourceMappingURL=app.module.js.map