import { Module, OnModuleInit } from '@nestjs/common'
import { MensajesController } from './mensajes.controller'
import { MensajesService } from './mensajes.service'
import { PrismaModule } from '../prisma/prisma.module'
import { NotificacionesModule } from '../notificaciones/notificaciones.module'

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [MensajesController],
  providers: [MensajesService],
  exports: [MensajesService]
})
export class MensajesModule implements OnModuleInit {
  onModuleInit() {
    try { console.log('[MensajesModule] Inicializado y registrado en AppModule') } catch {}
  }
}
