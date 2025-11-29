import { Module } from '@nestjs/common';
import { ReservasSimpleController } from './reservas-simple.controller';

@Module({
  controllers: [ReservasSimpleController],
})
export class ReservasSimpleModule {}
