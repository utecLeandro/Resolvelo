/**
 * Servicio de Prisma para gestionar la conexión con PostgreSQL.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Inicializa la conexión a la base de datos.
   */
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma conectado a la base de datos.');
    } catch (err: any) {
      // Permite que la aplicación arranque aunque la BD no esté disponible
      // para que endpoints como /api/health funcionen y podamos diagnosticar.
      console.warn(
        '⚠️ Prisma no pudo conectar a la BD. La API seguirá disponible para endpoints que no requieren BD.',
        err?.message ?? err,
      );
    }
  }

  /**
   * Cierra la conexión al destruir el módulo.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
