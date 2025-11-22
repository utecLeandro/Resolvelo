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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
const publicaciones_service_1 = require("../publicaciones/publicaciones.service");
const filtros_publicacion_dto_1 = require("../publicaciones/dto/filtros-publicacion.dto");
let AdminController = class AdminController {
    adminService;
    publicacionesService;
    constructor(adminService, publicacionesService) {
        this.adminService = adminService;
        this.publicacionesService = publicacionesService;
        console.log('[AdminController] Cargado y listo. Rutas: GET /api/admin/usuarios, PATCH /api/admin/usuarios/:id/estado, PATCH /api/admin/usuarios/:id/verificar');
    }
    async listarUsuarios(pagina, limite, busqueda, rol, activo) {
        return this.adminService.listarUsuarios({
            pagina: pagina ? parseInt(pagina, 10) : undefined,
            limite: limite ? parseInt(limite, 10) : undefined,
            busqueda,
            rol,
            activo,
        });
    }
    async cambiarEstado(id, body, req) {
        return this.adminService.cambiarEstadoUsuario(req.user.id, id, body.activo, body.motivo);
    }
    async verificarUsuario(id, body, req) {
        return this.adminService.verificarUsuario(req.user.id, id, body.motivo);
    }
    async listarPublicacionesAdmin(filtros) {
        return this.publicacionesService.obtenerPublicaciones(filtros);
    }
    async aprobarPublicacion(id, body, req) {
        const pub = await this.publicacionesService.aprobarPublicacion(id, req.user.id, body.comentario);
        return { message: 'Publicación aprobada', publicacion: pub };
    }
    async rechazarPublicacion(id, body, req) {
        const pub = await this.publicacionesService.rechazarPublicacion(id, req.user.id, body.motivo, body.comentario);
        return { message: 'Publicación rechazada', publicacion: pub };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('usuarios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('pagina')),
    __param(1, (0, common_1.Query)('limite')),
    __param(2, (0, common_1.Query)('busqueda')),
    __param(3, (0, common_1.Query)('rol')),
    __param(4, (0, common_1.Query)('activo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listarUsuarios", null);
__decorate([
    (0, common_1.Patch)('usuarios/:id/estado'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "cambiarEstado", null);
__decorate([
    (0, common_1.Patch)('usuarios/:id/verificar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verificarUsuario", null);
__decorate([
    (0, common_1.Get)('publicaciones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_publicacion_dto_1.FiltrosPublicacionDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listarPublicacionesAdmin", null);
__decorate([
    (0, common_1.Patch)('publicaciones/:id/aprobar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "aprobarPublicacion", null);
__decorate([
    (0, common_1.Patch)('publicaciones/:id/rechazar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rechazarPublicacion", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        publicaciones_service_1.PublicacionesService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map