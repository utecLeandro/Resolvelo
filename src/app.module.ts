﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AdminModule } from './admin/admin.module';
import { AdminDebugController } from './admin/admin-debug.controller';

import { TransaccionesModule } from './transacciones/transacciones.module';
import { TransaccionesController } from './transacciones/transacciones.controller';
import { TransaccionesWebhookController } from './transacciones/webhook.controller';
import { TransaccionesService } from './transacciones/transacciones.service';
import { CalificacionesModule } from './calificaciones/calificaciones.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ImagenesModule } from './imagenes/imagenes.module';
import { ReservasModule } from './reservas/reservas.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmailModule,
    PublicacionesModule,
    UsuariosModule,
    AdminModule,
    TransaccionesModule,
    CalificacionesModule,
    NotificacionesModule,
    ImagenesModule,
    ReservasModule,
  ],
  controllers: [
    HealthController,
    AdminDebugController,
    TransaccionesController,
    TransaccionesWebhookController,
  ],
  providers: [TransaccionesService],
})
export class AppModule {
  constructor() {
    try {
      const resolvedAppModule = require.resolve('./app.module');
      console.log(
        '[AppModule] require.resolve(./app.module) ->',
        resolvedAppModule,
      );
    } catch {}
    console.log('[AppModule] __APP_MODULE_MARKER__ ->', __APP_MODULE_MARKER__);
    console.log(
      '[AppModule] typeof TransaccionesModule ->',
      typeof TransaccionesModule,
    );
  }
}
// Marcador para verificar que este AppModule se está compilando y usando en dist
export const __APP_MODULE_MARKER__ = 'v3_ResendVerification_Fixed';
