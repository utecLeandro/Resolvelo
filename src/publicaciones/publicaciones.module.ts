import { Module } from '@nestjs/common';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Módulo de Publicaciones
 * Gestiona todas las operaciones relacionadas con publicaciones de equipos musicales
 * Incluye CRUD completo, búsquedas avanzadas y validaciones de negocio
 */
@Module({
  imports: [PrismaModule], // Importar el módulo de Prisma para acceso a la base de datos
  controllers: [PublicacionesController], // Controlador REST para endpoints de publicaciones
  providers: [PublicacionesService], // Servicio con lógica de negocio
  exports: [PublicacionesService], // Exportar servicio para uso en otros módulos
})
export class PublicacionesModule {}