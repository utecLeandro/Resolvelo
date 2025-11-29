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
exports.CalificacionesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const calificaciones_service_1 = require("./calificaciones.service");
const crear_calificacion_dto_1 = require("./dto/crear-calificacion.dto");
let CalificacionesController = class CalificacionesController {
    calificacionesService;
    constructor(calificacionesService) {
        this.calificacionesService = calificacionesService;
        try {
            console.log('[CalificacionesController] Inicializado');
        }
        catch { }
    }
    async crear(dto, req) {
        const resultado = await this.calificacionesService.crear(req.user.id, dto);
        return { ...resultado, timestamp: new Date().toISOString() };
    }
    async listarPorPublicacion(id, take, skip) {
        const resultado = await this.calificacionesService.listarPorPublicacion(id, take ? parseInt(take) : 10, skip ? parseInt(skip) : 0);
        return { ...resultado, timestamp: new Date().toISOString() };
    }
};
exports.CalificacionesController = CalificacionesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_calificacion_dto_1.CrearCalificacionDto, Object]),
    __metadata("design:returntype", Promise)
], CalificacionesController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)('publicaciones/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CalificacionesController.prototype, "listarPorPublicacion", null);
exports.CalificacionesController = CalificacionesController = __decorate([
    (0, common_1.Controller)('calificaciones'),
    __metadata("design:paramtypes", [calificaciones_service_1.CalificacionesService])
], CalificacionesController);
