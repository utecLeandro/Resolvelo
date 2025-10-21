import { Module } from '@nestjs/common';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesService } from './transacciones.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
  exports: [TransaccionesService]
})
export class TransaccionesModule {}