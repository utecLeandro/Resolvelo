import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { CalificacionesController } from './calificaciones.controller'
import { CalificacionesService } from './calificaciones.service'

@Module({
  imports: [PrismaModule],
  controllers: [CalificacionesController],
  providers: [CalificacionesService],
  exports: [CalificacionesService],
})
export class CalificacionesModule {}