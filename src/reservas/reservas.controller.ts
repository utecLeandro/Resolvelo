import { Controller, Get, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common'
import { ReservasService } from './reservas.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('test')
  @HttpCode(HttpStatus.OK)
  async test() {
    return { message: 'Controlador de reservas funcionando sin servicio' }
  }

  @Get('mis-solicitudes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerMisSolicitudes(@Request() req: any) {
    const propietarioId = req.user.sub; // El ID del usuario autenticado
    return await this.reservasService.obtenerSolicitudesPendientes(propietarioId);
  }
}