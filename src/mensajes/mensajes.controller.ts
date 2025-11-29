import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MensajesService } from './mensajes.service';
import { EnviarMensajeDto } from './dto/enviar-mensaje.dto';

@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {
    try {
      console.log('[MensajesController] Cargado');
    } catch {}
  }

  @UseGuards(JwtAuthGuard)
  @Get('reserva/:reservaId')
  async listar(@Param('reservaId') reservaId: string, @Request() req: any) {
    const usuarioId = req.user?.id;
    return await this.mensajesService.listarPorReserva(reservaId, usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reserva/:reservaId/leer')
  async leer(@Param('reservaId') reservaId: string, @Request() req: any) {
    const usuarioId = req.user?.id;
    return await this.mensajesService.marcarLeidos(reservaId, usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('enviar')
  async enviar(@Body() dto: EnviarMensajeDto, @Request() req: any) {
    const usuarioId = req.user?.id;
    return await this.mensajesService.enviarMensaje(dto, usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-conversaciones')
  async conversaciones(@Request() req: any) {
    const usuarioId = req.user?.id;
    return await this.mensajesService.listarMisConversaciones(usuarioId);
  }
}
