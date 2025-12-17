import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { ProcesarPagoDto } from './dto/procesar-pago.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CrearPreferenciaMpDto } from './dto/crear-preferencia-mp.dto';
import { ProcesarPagoBrickDto } from './dto/payment-brick.dto';
@Controller('transacciones')
@UseGuards(JwtAuthGuard)
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post('procesar-pago')
  async procesarPago(@Body() procesarPagoDto: ProcesarPagoDto) {
    return this.transaccionesService.procesarPago(procesarPagoDto);
  }

  @Get('mis-transacciones')
  async obtenerMisTransacciones(@Request() req) {
    return this.transaccionesService.obtenerTransaccionesUsuario(req.user.sub);
  }

  @Get(':id')
  async obtenerTransaccion(@Param('id') id: string) {
    return this.transaccionesService.obtenerTransaccion(id);
  }

  @Post('mercado-pago/crear-preferencia')
  async crearPreferenciaMp(@Body() body: CrearPreferenciaMpDto) {
    const resultado =
      await this.transaccionesService.crearPreferenciaMercadoPago(
        body.reservaId,
        body.descripcion,
      );
    return resultado;
  }

  @Post('mercado-pago/confirmar')
  async confirmarPagoMp(@Body() body: { paymentId: string }) {
    if (!body?.paymentId) {
      throw new Error('paymentId es requerido');
    }
    const tx = await this.transaccionesService.confirmarPagoMercadoPago(
      body.paymentId,
    );
    return tx;
  }

  @Put(':id/completar')
  async completarTransaccion(@Param('id') id: string) {
    const tx =
      await this.transaccionesService.verificarEstadoMercadoPagoPorTransaccion(
        id,
      );
    if (!tx || tx.estado !== 'COMPLETADA') {
      throw new BadRequestException('El pago no está aprobado aún');
    }
    return tx;
  }

  @Post('mercado-pago/process-payment')
  async processPaymentBrick(@Body() body: ProcesarPagoBrickDto) {
    const tx = await this.transaccionesService.procesarPagoBrick(body);
    return tx;
  }
}
