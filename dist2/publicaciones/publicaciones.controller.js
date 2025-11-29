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
exports.PublicacionesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const publicaciones_service_1 = require("./publicaciones.service");
const crear_publicacion_dto_1 = require("./dto/crear-publicacion.dto");
const actualizar_publicacion_dto_1 = require("./dto/actualizar-publicacion.dto");
const filtros_publicacion_dto_1 = require("./dto/filtros-publicacion.dto");
const finalizar_imagenes_dto_1 = require("./dto/finalizar-imagenes.dto");
let PublicacionesController = class PublicacionesController {
    publicacionesService;
    constructor(publicacionesService) {
        this.publicacionesService = publicacionesService;
    }
    async crear(crearPublicacionDto, req) {
        return this.publicacionesService.crearPublicacion(req.user.id, crearPublicacionDto);
    }
    async obtenerTodas(filtros) {
        return this.publicacionesService.obtenerPublicaciones(filtros);
    }
    async obtenerMisPublicaciones(req) {
        const usuarioId = req.user.id;
        const filtros = {};
        return this.publicacionesService.obtenerPublicacionesUsuario(usuarioId, filtros);
    }
    async obtenerPorId(id) {
        return this.publicacionesService.obtenerPublicacionPorId(id);
    }
    async listarImagenes(id) {
        return this.publicacionesService.listarImagenes(id);
    }
    async actualizar(id, actualizarPublicacionDto, req) {
        return this.publicacionesService.actualizarPublicacion(id, req.user.id, actualizarPublicacionDto);
    }
    async finalizarImagenes(id, dto, req) {
        return this.publicacionesService.guardarImagenes(id, req.user.id, dto.images);
    }
    async marcarPrincipal(id, imagenId, req) {
        await this.publicacionesService.setImagenPrincipal(id, req.user.id, imagenId);
        return { success: true };
    }
    async eliminarImagen(id, imagenId, req) {
        await this.publicacionesService.eliminarImagen(id, req.user.id, imagenId);
        return { success: true };
    }
    async uploadLocal(id, req) {
        const file = req.file;
        if (!file)
            return { error: 'Archivo requerido' };
        const url = `/uploads/publicaciones/${id}/${file.filename}`;
        const { descripcion, orden, esPrincipal } = req.body || {};
        const creado = await this.publicacionesService.guardarImagenes(id, req.user.id, [
            { url, descripcion, orden: orden ? Number(orden) : undefined, esPrincipal: esPrincipal === 'true' },
        ]);
        return { success: true, data: creado };
    }
    async eliminar(id, req) {
        await this.publicacionesService.eliminarPublicacion(id, req.user.id);
    }
    async buscar(termino, filtros) {
        const filtrosConBusqueda = {
            ...filtros,
            busqueda: termino,
        };
        return this.publicacionesService.obtenerPublicaciones(filtrosConBusqueda);
    }
    async obtenerPorCategoria(categoria, filtros) {
        const filtrosConCategoria = {
            ...filtros,
            categoria: categoria,
        };
        return this.publicacionesService.obtenerPublicaciones(filtrosConCategoria);
    }
    async obtenerDisponibles(fechaInicio, fechaFin, filtros) {
        const filtrosConFechas = {
            ...filtros,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
        };
        return this.publicacionesService.obtenerPublicaciones(filtrosConFechas);
    }
    async obtenerReservasActivas(id) {
        return this.publicacionesService.obtenerReservasActivasPorPublicacion(id);
    }
    async verificarDisponibilidad(id, fechaInicio, fechaFin) {
        return this.publicacionesService.verificarDisponibilidadPublicacion(id, new Date(fechaInicio), new Date(fechaFin));
    }
};
exports.PublicacionesController = PublicacionesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_publicacion_dto_1.CrearPublicacionDto, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filtros_publicacion_dto_1.FiltrosPublicacionDto]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerTodas", null);
__decorate([
    (0, common_1.Get)('mis-publicaciones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerMisPublicaciones", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerPorId", null);
__decorate([
    (0, common_1.Get)(':id/imagenes'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "listarImagenes", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, actualizar_publicacion_dto_1.ActualizarPublicacionDto, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Post)(':id/imagenes/finalizar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, finalizar_imagenes_dto_1.FinalizarImagenesDto, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "finalizarImagenes", null);
__decorate([
    (0, common_1.Patch)(':id/imagenes/:imagenId/principal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('imagenId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "marcarPrincipal", null);
__decorate([
    (0, common_1.Delete)(':id/imagenes/:imagenId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('imagenId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "eliminarImagen", null);
__decorate([
    (0, common_1.Post)(':id/imagenes/upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(__dirname, '..', '..', 'uploads', 'publicaciones', req.params.id);
                fs.mkdirSync(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname) || '.bin';
                const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
                cb(null, nombre);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allow = ['image/jpeg', 'image/png', 'image/webp'];
            if (allow.includes(file.mimetype))
                cb(null, true);
            else
                cb(new Error('Tipo de archivo no permitido'), false);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "uploadLocal", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)('buscar/:termino'),
    __param(0, (0, common_1.Param)('termino')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, filtros_publicacion_dto_1.FiltrosPublicacionDto]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "buscar", null);
__decorate([
    (0, common_1.Get)('categoria/:categoria'),
    __param(0, (0, common_1.Param)('categoria')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, filtros_publicacion_dto_1.FiltrosPublicacionDto]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerPorCategoria", null);
__decorate([
    (0, common_1.Get)('disponibles/:fechaInicio/:fechaFin'),
    __param(0, (0, common_1.Param)('fechaInicio')),
    __param(1, (0, common_1.Param)('fechaFin')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, filtros_publicacion_dto_1.FiltrosPublicacionDto]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerDisponibles", null);
__decorate([
    (0, common_1.Get)(':id/reservas-activas'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "obtenerReservasActivas", null);
__decorate([
    (0, common_1.Get)(':id/disponibilidad/:fechaInicio/:fechaFin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fechaInicio')),
    __param(2, (0, common_1.Param)('fechaFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PublicacionesController.prototype, "verificarDisponibilidad", null);
exports.PublicacionesController = PublicacionesController = __decorate([
    (0, common_1.Controller)('publicaciones'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __metadata("design:paramtypes", [publicaciones_service_1.PublicacionesService])
], PublicacionesController);
