import { Controller, Get, Param } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';

// Controlador explícito para exponer la verificación pública
// Evita cualquier conflicto con decoradores o guards del controlador principal
@Controller('transacciones/mercado-pago')
export class VerificacionPublicController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Get('verificar/:transaccionId')
  async verificar(@Param('transaccionId') transaccionId: string) {
    return this.transaccionesService.verificarEstadoMercadoPagoPorTransaccion(transaccionId);
  }
}