import { Module } from '@nestjs/common'
import { ReservasController } from './reservas.controller'
import { ReservasService } from './reservas.service'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [ReservasController],
  providers: [ReservasService, PrismaService],
  exports: [ReservasService]
})
export class ReservasModule {}