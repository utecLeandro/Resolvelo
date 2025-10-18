import { Module } from '@nestjs/common'
import { ReservasNuevoController } from './reservas-nuevo.controller'

@Module({
  controllers: [ReservasNuevoController],
})
export class ReservasNuevoModule {}