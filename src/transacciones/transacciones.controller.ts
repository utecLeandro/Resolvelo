import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { ProcesarPagoDto } from './dto/procesar-pago.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transacciones')
@UseGuards(JwtAuthGuard)
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post('procesar-pago')
  async procesarPago(@Body() procesarPagoDto: ProcesarPagoDto, @Request() req) {
    console.log('🔄 [CONTROLLER] Procesando pago para reserva:', procesarPagoDto.reservaId);
    console.log('👤 [CONTROLLER] Usuario:', req.user.sub);
    
    const resultado = await this.transaccionesService.procesarPago(procesarPagoDto);
    
    console.log('✅ [CONTROLLER] Pago procesado exitosamente:', resultado.transaccionId);
    return resultado;
  }

  @Get('mis-transacciones')
  async obtenerMisTransacciones(@Request() req) {
    console.log('📋 [CONTROLLER] Obteniendo transacciones del usuario:', req.user.sub);
    return this.transaccionesService.obtenerTransaccionesUsuario(req.user.sub);
  }

  @Get(':id')
  async obtenerTransaccion(@Param('id') id: string) {
    console.log('🔍 [CONTROLLER] Obteniendo transacción:', id);
    return this.transaccionesService.obtenerTransaccion(id);
  }
}