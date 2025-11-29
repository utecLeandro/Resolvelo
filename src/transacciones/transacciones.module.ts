import { Module } from '@nestjs/common';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesWebhookController } from './webhook.controller';
import { VerificacionPublicController } from './verificacion-public.controller';
import { TransaccionesService } from './transacciones.service';
console.log('[TransaccionesModule] Archivo módulo cargado (import)');
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

console.log('[TransaccionesModule] Cargando módulo de transacciones...');

@Module({
  imports: [PrismaModule, NotificacionesModule],
  controllers: [
    TransaccionesController,
    TransaccionesWebhookController,
    VerificacionPublicController,
  ],
  providers: [TransaccionesService],
  exports: [TransaccionesService],
})
export class TransaccionesModule {
  constructor() {
    console.log('[TransaccionesModule] Inicializado y registrado en AppModule');
  }
}
