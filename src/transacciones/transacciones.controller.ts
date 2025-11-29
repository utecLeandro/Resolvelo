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
// Debug: confirmar carga del controlador
console.log('[TransaccionesController] Archivo cargado (import)');

@Controller('transacciones')
@UseGuards(JwtAuthGuard)
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post('procesar-pago')
  async procesarPago(@Body() procesarPagoDto: ProcesarPagoDto, @Request() req) {
    console.log(
      '🔄 [CONTROLLER] Procesando pago para reserva:',
      procesarPagoDto.reservaId,
    );
    console.log('👤 [CONTROLLER] Usuario:', req.user.sub);

    const resultado =
      await this.transaccionesService.procesarPago(procesarPagoDto);

    console.log(
      '✅ [CONTROLLER] Pago procesado exitosamente:',
      resultado.transaccionId,
    );
    return resultado;
  }

  @Get('mis-transacciones')
  async obtenerMisTransacciones(@Request() req) {
    console.log(
      '📋 [CONTROLLER] Obteniendo transacciones del usuario:',
      req.user.sub,
    );
    return this.transaccionesService.obtenerTransaccionesUsuario(req.user.sub);
  }

  @Get(':id')
  async obtenerTransaccion(@Param('id') id: string) {
    console.log('🔍 [CONTROLLER] Obteniendo transacción:', id);
    return this.transaccionesService.obtenerTransaccion(id);
  }

  @Post('mercado-pago/crear-preferencia')
  async crearPreferenciaMp(
    @Body() body: CrearPreferenciaMpDto,
    @Request() req,
  ) {
    console.log(
      '🧭 [CONTROLLER] Crear preferencia MP para reserva:',
      body.reservaId,
    );
    console.log('👤 [CONTROLLER] Usuario:', req.user.sub);

    const resultado =
      await this.transaccionesService.crearPreferenciaMercadoPago(
        body.reservaId,
        body.descripcion,
      );
    console.log('✅ [CONTROLLER] Preferencia creada:', resultado.preferenciaId);
    return resultado;
  }

  @Post('mercado-pago/confirmar')
  async confirmarPagoMp(@Body() body: { paymentId: string }, @Request() req) {
    console.log(
      '🧭 [CONTROLLER] Confirmar pago MP paymentId:',
      body?.paymentId,
    );
    console.log('👤 [CONTROLLER] Usuario:', req.user.sub);
    if (!body?.paymentId) {
      throw new Error('paymentId es requerido');
    }
    const tx = await this.transaccionesService.confirmarPagoMercadoPago(
      body.paymentId,
    );
    console.log(
      '✅ [CONTROLLER] Confirmación procesada para transacción:',
      tx?.id,
      'estado:',
      tx?.estado,
    );
    return tx;
  }

  @Put(':id/completar')
  async completarTransaccion(@Param('id') id: string, @Request() req) {
    console.log(
      '🧭 [CONTROLLER] Completar transacción manual:',
      id,
      'usuario:',
      req.user?.sub,
    );
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
  async processPaymentBrick(
    @Body() body: ProcesarPagoBrickDto,
    @Request() req,
  ) {
    console.log(
      '🧭 [CONTROLLER] process-payment Brick, usuario:',
      req.user?.sub,
    );
    const tx = await this.transaccionesService.procesarPagoBrick(body);
    console.log(
      '✅ [CONTROLLER] Brick payment procesado para transacción:',
      tx?.id,
      'estado:',
      tx?.estado,
    );
    return tx;
  }
}
