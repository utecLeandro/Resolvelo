import { Module } from '@nestjs/common';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';
import { TransaccionesModule } from '../transacciones/transacciones.module';

@Module({
  imports: [EmailModule, TransaccionesModule],
  controllers: [ReservasController],
  providers: [ReservasService, PrismaService],
  exports: [ReservasService]
})
export class ReservasModule {}