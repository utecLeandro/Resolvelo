import { Controller, Get, Param, Patch, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Post, UseGuards, Request, HttpException } from '@nestjs/common'
import { UsuariosService } from './usuarios.service'
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto'
import { ReservasService, UpdateReservaDto } from '../reservas/reservas.service'
import { CrearReservaDto } from '../reservas/dto/crear-reserva.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('usuarios')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly reservasService: ReservasService
  ) {}

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.usuariosService.obtenerPorId(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async actualizarPerfil(
    @Param('id') id: string,
    @Body() body: ActualizarPerfilDto,
  ) {
    return this.usuariosService.actualizarPerfil(id, body)
  }

  @Get('test/reservas')
  async testReservas() {
    return { 
      message: 'Ruta de prueba para reservas funcionando',
      timestamp: new Date().toISOString(),
      status: 'OK'
    }
  }

  // Rutas de reservas con autenticación JWT
  @Get('reservas/listar')
  @UseGuards(JwtAuthGuard)
  async listarReservas(@Request() req: any) {
    const resultado = await this.reservasService.obtenerReservas();
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Get('reservas/mis-solicitudes')
  @UseGuards(JwtAuthGuard)
  async obtenerMisSolicitudes(@Request() req: any) {
    const propietarioId = req.user.sub; // El ID del usuario autenticado
    const resultado = await this.reservasService.obtenerSolicitudesPendientes(propietarioId);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Get('reservas/mis-reservas')
  @UseGuards(JwtAuthGuard)
  async obtenerMisReservas(@Request() req: any) {
    const arrendatarioId = req.user.sub; // El ID del usuario autenticado
    const resultado = await this.reservasService.obtenerReservasArrendatario(arrendatarioId);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Get('reservas/:id')
  @UseGuards(JwtAuthGuard)
  async obtenerReserva(@Param('id') id: string, @Request() req: any) {
    const resultado = await this.reservasService.obtenerReservaPorId(id);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Post('reservas/crear')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async crearReserva(@Body() data: CrearReservaDto, @Request() req: any) {
    try {
      const resultado = await this.reservasService.crearReserva(data);
      return {
        ...resultado,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Las excepciones ya están siendo manejadas por NestJS
      // Solo necesitamos relanzarlas para que el framework las procese
      throw error;
    }
  }

  @Patch('reservas/:id')
  @UseGuards(JwtAuthGuard)
  async actualizarReserva(@Param('id') id: string, @Body() data: UpdateReservaDto, @Request() req: any) {
    const resultado = await this.reservasService.actualizarReserva(id, data);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Patch('reservas/:id/cancelar')
  @UseGuards(JwtAuthGuard)
  async cancelarReserva(@Param('id') id: string, @Request() req: any) {
    const resultado = await this.reservasService.cancelarReserva(id);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Patch('reservas/:id/confirmar')
  @UseGuards(JwtAuthGuard)
  async confirmarReserva(@Param('id') id: string, @Request() req: any) {
    const resultado = await this.reservasService.confirmarReserva(id);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }
}