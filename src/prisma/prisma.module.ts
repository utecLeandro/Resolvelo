import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global de Prisma
 * Proporciona el servicio de Prisma para acceso a la base de datos PostgreSQL
 * Se marca como global para estar disponible en toda la aplicación
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
