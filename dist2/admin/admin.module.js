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
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_debug_controller_1 = require("./admin-debug.controller");
const admin_roles_controller_1 = require("./admin-roles.controller");
const admin_service_1 = require("./admin.service");
const prisma_service_1 = require("../prisma/prisma.service");
const publicaciones_module_1 = require("../publicaciones/publicaciones.module");
let AdminModule = class AdminModule {
    constructor() {
        console.log('[AdminModule] Módulo de administración cargado');
    }
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [publicaciones_module_1.PublicacionesModule],
        controllers: [admin_controller_1.AdminController, admin_debug_controller_1.AdminDebugController, admin_roles_controller_1.AdminRolesController],
        providers: [admin_service_1.AdminService, prisma_service_1.PrismaService],
        exports: [admin_service_1.AdminService],
    }),
    __metadata("design:paramtypes", [])
], AdminModule);
