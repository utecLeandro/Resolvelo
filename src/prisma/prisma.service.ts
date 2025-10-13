/**
 * Servicio de Prisma para gestionar la conexión con PostgreSQL.
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Inicializa la conexión a la base de datos.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Cierra la conexión al destruir el módulo.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}