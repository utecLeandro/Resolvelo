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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listarUsuarios(params) {
        const pagina = Math.max(1, params.pagina ?? 1);
        const limite = Math.min(100, Math.max(1, params.limite ?? 20));
        const skip = (pagina - 1) * limite;
        const where = {};
        if (params.busqueda) {
            const q = params.busqueda.trim();
            where.OR = [
                { nombre: { contains: q, mode: 'insensitive' } },
                { apellido: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { documentoIdentidad: { contains: q } },
            ];
        }
        if (params.rol) {
            where.rol = params.rol;
        }
        if (params.activo === 'true' || params.activo === 'false') {
            where.activo = params.activo === 'true';
        }
        const [totalElementos, usuarios] = await Promise.all([
            this.prisma.usuario.count({ where }),
            this.prisma.usuario.findMany({
                where,
                skip,
                take: limite,
                orderBy: { fechaCreacion: 'desc' },
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                    rol: true,
                    activo: true,
                    estadoVerificacion: true,
                    fechaCreacion: true,
                },
            }),
        ]);
        return {
            usuarios,
            paginacion: {
                paginaActual: pagina,
                totalPaginas: Math.ceil(totalElementos / limite),
                totalElementos,
                elementosPorPagina: limite,
            },
        };
    }
    async cambiarEstadoUsuario(adminUsuarioId, objetivoUsuarioId, activo, motivo) {
        const usuario = await this.prisma.usuario.findUnique({ where: { id: objetivoUsuarioId } });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario objetivo no encontrado');
        }
        if (usuario.activo === activo) {
            throw new common_1.BadRequestException(`El usuario ya está ${activo ? 'habilitado' : 'deshabilitado'}`);
        }
        const actualizado = await this.prisma.usuario.update({
            where: { id: objetivoUsuarioId },
            data: { activo },
            select: { id: true, nombre: true, apellido: true, email: true, rol: true, activo: true },
        });
        const admin = await this.prisma.administrador.findUnique({ where: { usuarioId: adminUsuarioId } });
        const tipo = activo ? 'MODIFICAR_USUARIO' : 'SUSPENDER_USUARIO';
        if (admin) {
            await this.prisma.accionAdministrativa.create({
                data: {
                    tipo: tipo,
                    descripcion: activo ? 'Habilitar usuario' : 'Deshabilitar usuario',
                    detalles: motivo || null,
                    usuarioObjetivoId: objetivoUsuarioId,
                    administradorId: admin.id,
                    exitosa: true,
                },
            });
        }
        return { message: 'Estado de usuario actualizado', usuario: actualizado };
    }
    async verificarUsuario(adminUsuarioId, objetivoUsuarioId, motivo) {
        const usuario = await this.prisma.usuario.findUnique({ where: { id: objetivoUsuarioId } });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario objetivo no encontrado');
        }
        if (usuario.estadoVerificacion === 'VERIFICADA') {
            throw new common_1.BadRequestException('El usuario ya está verificado');
        }
        if (usuario.estadoVerificacion !== 'PENDIENTE') {
            throw new common_1.BadRequestException(`No se puede verificar un usuario con estado '${usuario.estadoVerificacion}'.`);
        }
        const actualizado = await this.prisma.usuario.update({
            where: { id: objetivoUsuarioId },
            data: { estadoVerificacion: 'VERIFICADA' },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                rol: true,
                activo: true,
                estadoVerificacion: true,
                fechaCreacion: true,
            },
        });
        const admin = await this.prisma.administrador.findUnique({ where: { usuarioId: adminUsuarioId } });
        if (admin) {
            await this.prisma.accionAdministrativa.create({
                data: {
                    tipo: 'MODIFICAR_USUARIO',
                    descripcion: 'Verificar usuario',
                    detalles: motivo || null,
                    usuarioObjetivoId: objetivoUsuarioId,
                    administradorId: admin.id,
                    exitosa: true,
                },
            });
        }
        return { message: 'Usuario verificado correctamente', usuario: actualizado };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map