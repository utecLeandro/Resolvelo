import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminDebugController } from './admin-debug.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { PublicacionesModule } from '../publicaciones/publicaciones.module';

@Module({
  imports: [PublicacionesModule],
  controllers: [AdminController, AdminDebugController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
})
export class AdminModule {
  constructor() {
    console.log('[AdminModule] Módulo de administración cargado');
  }
}