import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CalificacionesService } from './calificaciones.service';
import { CrearCalificacionDto } from './dto/crear-calificacion.dto';
import { serializeBigInt } from '../common/interceptors/bigint-serializer.interceptor';

@Controller('calificaciones')
export class CalificacionesController {
  constructor(private readonly calificacionesService: CalificacionesService) {
    try {
      console.log('[CalificacionesController] Inicializado');
    } catch {}
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async crear(@Body() dto: CrearCalificacionDto, @Request() req: any) {
    console.log('📝 [CONTROLLER] Creando calificación:', {
      usuarioId: req.user.id,
      reservaId: dto.reservaId,
    });
    const resultado = await this.calificacionesService.crear(req.user.id, dto);
    // Serializamos manualmente para asegurar que no haya problemas de BigInt
    const response = serializeBigInt({
      ...resultado,
      timestamp: new Date().toISOString(),
    });
    console.log('✅ [CONTROLLER] Calificación creada exitosamente');
    return response;
  }

  @Get('publicaciones/:id')
  async listarPorPublicacion(
    @Param('id') id: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const resultado = await this.calificacionesService.listarPorPublicacion(
      id,
      take ? parseInt(take) : 10,
      skip ? parseInt(skip) : 0,
    );
    return { ...resultado, timestamp: new Date().toISOString() };
  }
}
