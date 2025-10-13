/**
 * Módulo raíz de la aplicación.
 * Importa controladores y proveedores base.
 */
import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PublicacionesModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}