import { Module } from "@nestjs/common";
import { ReservasFinalController } from "./reservas-final.controller";
import { ReservasService } from "./reservas.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ReservasFinalController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasFinalModule {}
