import { Controller, Get, Param, Patch, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Post, UseGuards, Request, HttpException, UseInterceptors, ForbiddenException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import { UsuariosService } from './usuarios.service'
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto'
import { ReservasService, UpdateReservaDto } from '../reservas/reservas.service'
import { CrearReservaDto } from '../reservas/dto/crear-reserva.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('usuarios')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly reservasService: ReservasService
  ) {}



  @Get('test/reservas')
  async testReservas() {
    return { 
      message: 'Ruta de prueba para reservas funcionando',
      timestamp: new Date().toISOString(),
      status: 'OK'
    }
  }

  @Get('reservas/mis-solicitudes')
  @UseGuards(JwtAuthGuard)
  async obtenerMisSolicitudes(@Request() req: any) {
    const propietarioId = req.user.id; // El ID del usuario autenticado
    console.log('🔍 [MIS-SOLICITUDES] Usuario autenticado:', {
      propietarioId,
      userObject: req.user,
      email: req.user?.email
    });
    const resultado = await this.reservasService.obtenerSolicitudesPendientes(propietarioId);
    console.log('📋 [MIS-SOLICITUDES] Resultado:', {
      propietarioId,
      cantidadSolicitudes: resultado.data?.length || 0
    });
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Get('reservas/mis-reservas')
  @UseGuards(JwtAuthGuard)
  async obtenerMisReservas(@Request() req: any) {
    const arrendatarioId = req.user.id; // El ID del usuario autenticado
    console.log('🔍 [MIS-RESERVAS] Usuario autenticado:', {
      arrendatarioId,
      userObject: req.user,
      email: req.user?.email
    });
    const resultado = await this.reservasService.obtenerReservasArrendatario(arrendatarioId);
    console.log('📋 [MIS-RESERVAS] Resultado:', {
      arrendatarioId,
      cantidadReservas: resultado.data?.length || 0
    });
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Post('reservas/crear')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async crearReserva(@Body() data: CrearReservaDto, @Request() req: any) {
    try {
      const resultado = await this.reservasService.crearReserva(data);
      return {
        ...resultado,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Las excepciones ya están siendo manejadas por NestJS
      // Solo necesitamos relanzarlas para que el framework las procese
      throw error;
    }
  }

  @Post(':id/avatar/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(__dirname, '..', '..', 'uploads', 'usuarios', req.params.id)
          fs.mkdirSync(dest, { recursive: true })
          cb(null, dest)
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname) || '.bin'
          const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
          cb(null, nombre)
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allow = ['image/jpeg', 'image/png', 'image/webp']
        if (allow.includes(file.mimetype)) cb(null, true)
        else cb(new Error('Tipo de archivo no permitido'), false)
      },
    }),
  )
  async subirAvatar(@Param('id') id: string, @Request() req: any) {
    const file = (req as any).file as Express.Multer.File
    if (!file) {
      throw new HttpException('Archivo requerido', HttpStatus.BAD_REQUEST)
    }
    const usuarioId = req.user?.id
    if (!usuarioId || usuarioId !== id) {
      throw new ForbiddenException('No autorizado para subir avatar de otro usuario')
    }
    const url = `/uploads/usuarios/${id}/${file.filename}`
    const actualizado = await this.usuariosService.actualizarAvatar(id, url)
    return { success: true, avatarUrl: actualizado.avatarUrl }
  }

  @Patch('reservas/:id')
  @UseGuards(JwtAuthGuard)
  async actualizarReserva(@Param('id') id: string, @Body() data: UpdateReservaDto, @Request() req: any) {
    const resultado = await this.reservasService.actualizarReserva(id, data);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Patch('reservas/:id/cancelar')
  @UseGuards(JwtAuthGuard)
  async cancelarReserva(@Param('id') id: string, @Request() req: any) {
    const resultado = await this.reservasService.cancelarReserva(id);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Patch('reservas/:id/confirmar')
  @UseGuards(JwtAuthGuard)
  async confirmarReserva(@Param('id') id: string, @Request() req: any) {
    const resultado = await this.reservasService.confirmarReserva(id);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Patch('reservas/:id/aceptar')
  @UseGuards(JwtAuthGuard)
  async aceptarReserva(@Param('id') id: string, @Request() req: any) {
    const resultado = await this.reservasService.aceptarReserva(id);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Patch('reservas/:id/rechazar')
  @UseGuards(JwtAuthGuard)
  async rechazarReserva(@Param('id') id: string, @Request() req: any) {
    const resultado = await this.reservasService.rechazarReserva(id);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Get('reservas/mis-reservas-activas')
  @UseGuards(JwtAuthGuard)
  async obtenerMisReservasActivas(@Request() req: any) {
    const propietarioId = req.user.id;
    console.log('🔍 [USUARIOS-CONTROLLER] Obteniendo reservas activas para propietario:', propietarioId);
    const resultado = await this.reservasService.obtenerReservasActivasPropietario(propietarioId);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Get('reservas/mi-historial-reservas')
  @UseGuards(JwtAuthGuard)
  async obtenerMiHistorialReservas(@Request() req: any) {
    const propietarioId = req.user.id;
    console.log('🔍 [USUARIOS-CONTROLLER] Obteniendo historial de reservas para propietario:', propietarioId);
    const resultado = await this.reservasService.obtenerHistorialReservasPropietario(propietarioId);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Get('reservas/test-simple')
  async testSimple() {
    console.log('🎯 [USUARIOS-CONTROLLER] Test simple ejecutado');
    return { message: 'Test simple funcionando', timestamp: new Date().toISOString() };
  }

  @Get('reservas/todas-mis-solicitudes')
  @UseGuards(JwtAuthGuard)
  async obtenerTodasMisSolicitudes(@Request() req: any) {
    console.log('🚀🚀🚀 [USUARIOS-CONTROLLER] obtenerTodasMisSolicitudes - MÉTODO EJECUTÁNDOSE 🚀🚀🚀');
    console.log('🎯 [USUARIOS-CONTROLLER] obtenerTodasMisSolicitudes - Iniciando');
    console.log('🎯 [USUARIOS-CONTROLLER] Usuario autenticado:', req.user);
    const propietarioId = req.user.id;
    console.log('🎯 [USUARIOS-CONTROLLER] PropietarioId extraído:', propietarioId);
    
    try {
      const resultado = await this.reservasService.obtenerTodasLasSolicitudes(propietarioId);
      console.log('🎯 [USUARIOS-CONTROLLER] Resultado del servicio:', resultado);
      return {
        ...resultado,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🎯 [USUARIOS-CONTROLLER] Error en obtenerTodasMisSolicitudes:', error);
      throw error;
    }
  }

  @Post('reservas/:id/activar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async activarReserva(@Param('id') reservaId: string, @Request() req: any) {
    try {
      console.log('🔥 [USUARIOS-CONTROLLER] Activando reserva:', reservaId);
      const resultado = await this.reservasService.activarReserva(reservaId);
      console.log('✅ [USUARIOS-CONTROLLER] Reserva activada exitosamente:', resultado);
      return resultado;
    } catch (error) {
      console.error('❌ [USUARIOS-CONTROLLER] Error al activar reserva:', error);
      throw error;
    }
  }

  // Rutas con parámetros deben ir al final para evitar conflictos
  @Get('reservas/:id')
  @UseGuards(JwtAuthGuard)
  async obtenerReserva(@Param('id') id: string, @Request() req: any) {
    const resultado = await this.reservasService.obtenerReservaPorId(id);
    return {
      ...resultado,
      timestamp: new Date().toISOString()
    };
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.usuariosService.obtenerPorId(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async actualizarPerfil(
    @Param('id') id: string,
    @Body() body: ActualizarPerfilDto,
  ) {
    return this.usuariosService.actualizarPerfil(id, body)
  }
}
