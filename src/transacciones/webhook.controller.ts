import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
// Debug: confirmar carga del controlador de webhook
console.log('[TransaccionesWebhookController] Archivo cargado (import)');

/**
 * Controlador público para recibir notificaciones de Mercado Pago.
 * IMPORTANTE: Esta ruta NO debe requerir autenticación.
 */
@Controller('transacciones/mercado-pago')
export class TransaccionesWebhookController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post('webhook')
  async recibirWebhook(@Body() body: any, @Query() query: any) {
    // MP puede enviar datos en body y/o en query (topic, id)
    console.log('➡️  [WEBHOOK] Notificación recibida', { query, body });
    const resultado = await this.transaccionesService.procesarWebhookMercadoPago(body, query);
    return resultado;
  }

  @Get('webhook')
  async pingWebhook(@Query() query: any) {
    console.log('➡️  [WEBHOOK] Ping recibido', { query });
    return { ok: true, message: 'Webhook operativo' };
  }
}