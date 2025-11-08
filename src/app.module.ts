/**
 * Módulo raíz de la aplicación.
 * Importa controladores y proveedores base.
 */
import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AdminModule } from './admin/admin.module';
import { AdminDebugController } from './admin/admin-debug.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PublicacionesModule,
    UsuariosModule,
    AdminModule,
  ],
  controllers: [HealthController, AdminDebugController],
  providers: [],
})
export class AppModule {}
// Marcador para verificar que este AppModule se está compilando y usando en dist
export const __APP_MODULE_MARKER__ = 'AdminModuleIncluded';
