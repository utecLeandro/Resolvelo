import { Module } from "@nestjs/common";
import { UsuariosController } from "./usuarios.controller";
import { UsuariosService } from "./usuarios.service";
import { ReservasService } from "../reservas/reservas.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, ReservasService, PrismaService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
