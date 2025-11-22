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
exports.TransaccionesModule = void 0;
const common_1 = require("@nestjs/common");
const transacciones_controller_1 = require("./transacciones.controller");
const webhook_controller_1 = require("./webhook.controller");
const verificacion_public_controller_1 = require("./verificacion-public.controller");
const transacciones_service_1 = require("./transacciones.service");
console.log('[TransaccionesModule] Archivo módulo cargado (import)');
const prisma_module_1 = require("../prisma/prisma.module");
console.log('[TransaccionesModule] Cargando módulo de transacciones...');
let TransaccionesModule = class TransaccionesModule {
    constructor() {
        console.log('[TransaccionesModule] Inicializado y registrado en AppModule');
    }
};
exports.TransaccionesModule = TransaccionesModule;
exports.TransaccionesModule = TransaccionesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [transacciones_controller_1.TransaccionesController, webhook_controller_1.TransaccionesWebhookController, verificacion_public_controller_1.VerificacionPublicController],
        providers: [transacciones_service_1.TransaccionesService],
        exports: [transacciones_service_1.TransaccionesService]
    }),
    __metadata("design:paramtypes", [])
], TransaccionesModule);
//# sourceMappingURL=transacciones.module.js.map