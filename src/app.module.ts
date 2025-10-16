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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PublicacionesModule,
    UsuariosModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}