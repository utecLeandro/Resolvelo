import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { ReservasModule } from '../reservas/reservas.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ReservasModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, PrismaService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
