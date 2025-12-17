import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolUsuario } from '@prisma/client';

@Controller('admin/publicaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPER_ADMIN)
export class AdminPublicationsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async listarPublicaciones(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Query('estado') estado: string = 'TODOS',
  ) {
    return this.adminService.listarPublicacionesAdmin(
      Number(page),
      Number(limit),
      search,
      estado,
    );
  }
}
