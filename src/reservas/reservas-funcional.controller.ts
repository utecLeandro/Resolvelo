import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";

@Controller("reservas")
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ReservasFuncionalController {
  constructor() {}

  @Get("test")
  async test() {
    return {
      message: "Controlador de reservas funcionando",
      timestamp: new Date().toISOString(),
      status: "OK",
    };
  }

  @Get(":id")
  async obtenerPorId(@Param("id") id: string) {
    return {
      message: `Obteniendo reserva con ID: ${id}`,
      id,
      timestamp: new Date().toISOString(),
    };
  }
}
