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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsuariosService = class UsuariosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obtenerPorId(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: BigInt(id) },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
                direccion: true,
                ciudad: true,
                departamento: true,
                codigoPostal: true,
                avatarUrl: true,
                perfilPublico: true,
                estadoVerificacion: true,
                documentoIdentidad: true,
            },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return usuario;
    }
    async actualizarPerfil(id, data) {
        const tieneCambios = Object.keys(data).length > 0;
        if (!tieneCambios) {
            throw new common_1.BadRequestException('No se enviaron cambios para actualizar');
        }
        const usuarioExistente = await this.prisma.usuario.findUnique({ where: { id: BigInt(id) } });
        if (!usuarioExistente) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const actualizado = await this.prisma.usuario.update({
            where: { id: BigInt(id) },
            data: {
                nombre: data.nombre ?? undefined,
                apellido: data.apellido ?? undefined,
                telefono: data.telefono ?? undefined,
                direccion: data.direccion ?? undefined,
                avatarUrl: data.avatarUrl ?? undefined,
            },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
                direccion: true,
                avatarUrl: true,
            },
        });
        return {
            message: 'Perfil actualizado correctamente',
            usuario: actualizado,
        };
    }
    async actualizarAvatar(id, avatarUrl) {
        const usuarioExistente = await this.prisma.usuario.findUnique({ where: { id: BigInt(id) } });
        if (!usuarioExistente) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const actualizado = await this.prisma.usuario.update({
            where: { id: BigInt(id) },
            data: { avatarUrl },
            select: { id: true, avatarUrl: true }
        });
        return actualizado;
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsuariosService);
