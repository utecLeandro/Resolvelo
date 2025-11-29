import { Controller, Get } from '@nestjs/common';

@Controller('reservas-nuevo')
export class ReservasNuevoController {
  @Get('test')
  async test() {
    return { message: 'Controlador de reservas funcionando!' };
  }
}
