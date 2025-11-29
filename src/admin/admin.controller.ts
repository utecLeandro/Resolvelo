import {
  Controller,
  Get,
  Query,
  UseGuards,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { PublicacionesService } from '../publicaciones/publicaciones.service';
import { FiltrosPublicacionDto } from '../publicaciones/dto/filtros-publicacion.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly publicacionesService: PublicacionesService,
  ) {
    // Log para verificar carga del controlador en tiempo de ejecución
    console.log(
      '[AdminController] Cargado y listo. Rutas: GET /api/admin/usuarios, PATCH /api/admin/usuarios/:id/estado, PATCH /api/admin/usuarios/:id/verificar',
    );
  }

  @Get('usuarios')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listarUsuarios(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busqueda') busqueda?: string,
    @Query('rol') rol?: string,
    @Query('activo') activo?: string,
  ) {
    return this.adminService.listarUsuarios({
      pagina: pagina ? parseInt(pagina, 10) : undefined,
      limite: limite ? parseInt(limite, 10) : undefined,
      busqueda,
      rol,
      activo,
    });
  }

  @Patch('usuarios/:id/estado')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { activo: boolean; motivo?: string },
    @Request() req: any,
  ) {
    return this.adminService.cambiarEstadoUsuario(
      req.user.id,
      id,
      body.activo,
      body.motivo,
    );
  }

  @Patch('usuarios/:id/verificar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async verificarUsuario(
    @Param('id') id: string,
    @Body() body: { motivo?: string },
    @Request() req: any,
  ) {
    return this.adminService.verificarUsuario(req.user.id, id, body.motivo);
  }

  // ===================== PUBLICACIONES (MODERACIÓN) =====================
  @Get('publicaciones')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listarPublicacionesAdmin(@Query() filtros: FiltrosPublicacionDto) {
    // Permite ver publicaciones por estado de moderación (pendientes, aprobadas, rechazadas)
    return this.publicacionesService.obtenerPublicaciones(filtros);
  }

  @Patch('publicaciones/:id/aprobar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async aprobarPublicacion(
    @Param('id') id: string,
    @Body() body: { comentario?: string },
    @Request() req: any,
  ) {
    const pub = await this.publicacionesService.aprobarPublicacion(
      id,
      req.user.id,
      body.comentario,
    );
    return { message: 'Publicación aprobada', publicacion: pub };
  }

  @Patch('publicaciones/:id/rechazar')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async rechazarPublicacion(
    @Param('id') id: string,
    @Body() body: { motivo?: string; comentario?: string },
    @Request() req: any,
  ) {
    const pub = await this.publicacionesService.rechazarPublicacion(
      id,
      req.user.id,
      body.motivo,
      body.comentario,
    );
    return { message: 'Publicación rechazada', publicacion: pub };
  }
}
