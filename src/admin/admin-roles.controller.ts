import { Controller, Get, Patch, UseGuards, HttpCode, HttpStatus, Param, Body, Request } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../auth/admin.guard'
import { CambiarRolDto } from './dto/cambiar-rol.dto'

@Controller('admin')
export class AdminRolesController {
  constructor(private readonly adminService: AdminService) {}

  @Get('roles')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listarRoles() {
    return this.adminService.listarRoles()
  }

  @Patch('usuarios/:id/rol')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async cambiarRol(
    @Param('id') id: string,
    @Body() body: CambiarRolDto,
    @Request() req: any,
  ) {
    return this.adminService.cambiarRolUsuario(req.user.id, id, body.rol)
  }
}