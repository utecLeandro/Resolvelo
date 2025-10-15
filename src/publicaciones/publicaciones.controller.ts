import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // TODO: Implementar guard
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ActualizarPublicacionDto } from './dto/actualizar-publicacion.dto';
import { FiltrosPublicacionDto } from './dto/filtros-publicacion.dto';

/**
 * Controlador para gestionar las publicaciones de equipos musicales
 * Implementa operaciones CRUD completas con validaciones de seguridad
 */
@Controller('publicaciones')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  /**
   * Crear una nueva publicación de equipo musical
   * TODO: Agregar autenticación cuando se implemente JwtAuthGuard
   */
  @Post()
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async crear(
    @Body() crearPublicacionDto: CrearPublicacionDto,
    @Query('usuarioId') usuarioId: string, // Temporal hasta implementar auth
  ) {
    return this.publicacionesService.crearPublicacion(usuarioId, crearPublicacionDto);
  }

  /**
   * Obtener todas las publicaciones con filtros opcionales
   * Endpoint público para búsqueda y navegación
   */
  @Get()
  async obtenerTodas(@Query() filtros: FiltrosPublicacionDto) {
    return this.publicacionesService.obtenerPublicaciones(filtros);
  }

  /**
   * Obtener publicaciones del usuario
   * TODO: Agregar autenticación cuando se implemente JwtAuthGuard
   */
  @Get('mis-publicaciones')
  // @UseGuards(JwtAuthGuard)
  async obtenerMisPublicaciones(
    @Query('usuarioId') usuarioId: string, // Temporal hasta implementar auth
    @Query() filtros: FiltrosPublicacionDto,
  ) {
    return this.publicacionesService.obtenerPublicacionesUsuario(usuarioId, filtros);
  }

  /**
   * Obtener una publicación específica por ID
   * Endpoint público para ver detalles de una publicación
   */
  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.publicacionesService.obtenerPublicacionPorId(id);
  }

  /**
   * Actualizar una publicación existente
   * TODO: Agregar autenticación cuando se implemente JwtAuthGuard
   */
  @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  async actualizar(
    @Param('id') id: string,
    @Body() actualizarPublicacionDto: ActualizarPublicacionDto,
    @Query('usuarioId') usuarioId: string, // Temporal hasta implementar auth
  ) {
    return this.publicacionesService.actualizarPublicacion(
      id,
      usuarioId,
      actualizarPublicacionDto,
    );
  }

  /**
   * Eliminar (soft delete) una publicación
   * TODO: Agregar autenticación cuando se implemente JwtAuthGuard
   */
  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string, // Temporal hasta implementar auth
  ) {
    await this.publicacionesService.eliminarPublicacion(id, usuarioId);
  }

  /**
   * Buscar publicaciones por texto
   * Búsqueda en título y descripción
   */
  @Get('buscar/:termino')
  async buscar(
    @Param('termino') termino: string,
    @Query() filtros: FiltrosPublicacionDto,
  ) {
    const filtrosConBusqueda = {
      ...filtros,
      busqueda: termino,
    };
    
    return this.publicacionesService.obtenerPublicaciones(filtrosConBusqueda);
  }

  /**
   * Obtener publicaciones por categoría
   * Filtrado específico por tipo de equipo musical
   */
  @Get('categoria/:categoria')
  async obtenerPorCategoria(
    @Param('categoria') categoria: string,
    @Query() filtros: FiltrosPublicacionDto,
  ) {
    const filtrosConCategoria = {
      ...filtros,
      categoria: categoria as any, // Conversión temporal hasta validar enum
    };
    
    return this.publicacionesService.obtenerPublicaciones(filtrosConCategoria);
  }

  /**
   * Obtener publicaciones disponibles en un rango de fechas
   * Útil para verificar disponibilidad antes de reservar
   */
  @Get('disponibles/:fechaInicio/:fechaFin')
  async obtenerDisponibles(
    @Param('fechaInicio') fechaInicio: string,
    @Param('fechaFin') fechaFin: string,
    @Query() filtros: FiltrosPublicacionDto,
  ) {
    const filtrosConFechas = {
      ...filtros,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
    };
    
    return this.publicacionesService.obtenerPublicaciones(filtrosConFechas);
  }

  /**
   * Obtener reservas activas (rangos ocupados) de una publicación específica
   * Estados considerados: PENDIENTE, CONFIRMADA, EN_CURSO
   */
  @Get(':id/reservas-activas')
  async obtenerReservasActivas(@Param('id') id: string) {
    return this.publicacionesService.obtenerReservasActivasPorPublicacion(id);
  }

  /**
   * Verificar disponibilidad de una publicación en un rango de fechas
   * Devuelve { disponible: boolean }
   */
  @Get(':id/disponibilidad/:fechaInicio/:fechaFin')
  async verificarDisponibilidad(
    @Param('id') id: string,
    @Param('fechaInicio') fechaInicio: string,
    @Param('fechaFin') fechaFin: string,
  ) {
    return this.publicacionesService.verificarDisponibilidadPublicacion(
      id,
      new Date(fechaInicio),
      new Date(fechaFin)
    );
  }
}