import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ) {
    return this.adminService.listarUsuarios(
      Number(page),
      Number(limit),
      search,
    );
  }
}
