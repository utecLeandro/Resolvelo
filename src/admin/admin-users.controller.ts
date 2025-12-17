import { Controller, Get, Query, UseGuards, Patch, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('admin/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listarUsuarios(
    @Query('pagina') page: number = 1,
    @Query('limite') limit: number = 10,
    @Query('busqueda') search: string = '',
    @Query('rol') rol: string = '',
    @Query('activo') activo: string = '',
  ) {
    let activoBool: boolean | undefined;
    if (activo === 'true') activoBool = true;
    if (activo === 'false') activoBool = false;

    return this.adminService.listarUsuarios(
      Number(page),
      Number(limit),
      search,
      rol || undefined,
      activoBool,
    );
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
    @Body('activo') activo: boolean,
    @Body('motivo') motivo?: string,
  ) {
    return this.adminService.cambiarEstadoUsuario(id, activo, motivo);
  }

  @Patch(':id/verificar')
  async verificarUsuario(
    @Param('id') id: string,
    @Body('motivo') motivo?: string,
  ) {
    return this.adminService.verificarUsuario(id, motivo);
  }
}
