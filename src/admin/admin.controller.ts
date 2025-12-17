import { Controller, Get, Post, Param, UseGuards, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('liquidaciones/pendientes')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPER_ADMIN)
  async obtenerLiquidacionesPendientes() {
    return this.adminService.obtenerLiquidacionesPendientes();
  }

  @Get('liquidaciones/historial')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPER_ADMIN)
  async obtenerHistorialLiquidaciones() {
    return this.adminService.obtenerHistorialLiquidaciones();
  }

  @Put('liquidaciones/:id/procesar')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPER_ADMIN)
  async procesarLiquidacion(@Param('id') id: string) {
    return this.adminService.procesarLiquidacion(id);
  }
}
