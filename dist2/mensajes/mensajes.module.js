"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MensajesModule = void 0;
const common_1 = require("@nestjs/common");
const mensajes_controller_1 = require("./mensajes.controller");
const mensajes_service_1 = require("./mensajes.service");
const prisma_module_1 = require("../prisma/prisma.module");
const notificaciones_module_1 = require("../notificaciones/notificaciones.module");
let MensajesModule = class MensajesModule {
    onModuleInit() {
        try {
            console.log('[MensajesModule] Inicializado y registrado en AppModule');
        }
        catch { }
    }
};
exports.MensajesModule = MensajesModule;
exports.MensajesModule = MensajesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notificaciones_module_1.NotificacionesModule],
        controllers: [mensajes_controller_1.MensajesController],
        providers: [mensajes_service_1.MensajesService],
        exports: [mensajes_service_1.MensajesService]
    })
], MensajesModule);
