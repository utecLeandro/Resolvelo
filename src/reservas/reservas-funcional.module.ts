import { Module } from '@nestjs/common';
import { ReservasFuncionalController } from './reservas-funcional.controller';

@Module({
  controllers: [ReservasFuncionalController],
})
export class ReservasFuncionalModule {}
