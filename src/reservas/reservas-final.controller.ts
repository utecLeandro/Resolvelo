import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ReservasService, UpdateReservaDto } from './reservas.service';
import { CrearReservaDto } from './dto/crear-reserva.dto';

@Controller('reservas')
export class ReservasFinalController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('listar')
  async listarReservas() {
    return this.reservasService.obtenerReservas();
  }

  @Get(':id')
  async obtenerReserva(@Param('id') id: string) {
    return this.reservasService.obtenerReservaPorId(id);
  }

  @Post('crear')
  async crearReserva(@Body() createReservaDto: CrearReservaDto) {
    return this.reservasService.crearReserva(createReservaDto);
  }

  @Patch(':id')
  async actualizarReserva(
    @Param('id') id: string,
    @Body() updateReservaDto: UpdateReservaDto
  ) {
    return this.reservasService.actualizarReserva(id, updateReservaDto);
  }

  @Patch(':id/cancelar')
  async cancelarReserva(@Param('id') id: string) {
    return this.reservasService.cancelarReserva(id);
  }

  @Patch(':id/confirmar')
  async confirmarReserva(@Param('id') id: string) {
    return this.reservasService.confirmarReserva(id);
  }
}