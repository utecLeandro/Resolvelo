import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { NotificacionesService } from './notificaciones.service'

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly service: NotificacionesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async listar(@Request() req: any) {
    const usuarioId = req.user?.id
    return await this.service.listar(usuarioId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('marcar-leidas')
  async marcarLeidas(@Request() req: any) {
    const usuarioId = req.user?.id
    return await this.service.marcarLeidas(usuarioId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('interaccion')
  async registrarInteraccion(@Body() body: any, @Request() req: any) {
    const usuarioId = req.user?.id
    const payload = {
      usuarioId,
      id: body?.id,
      tipo: body?.tipo,
      data: body?.data,
      ua: req.headers['user-agent'],
      at: new Date().toISOString(),
    }
    try { console.log('[Notificaciones] Interacción', payload) } catch {}
    return { ok: true }
  }
}
