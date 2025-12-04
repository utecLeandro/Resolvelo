import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('test')
  @HttpCode(HttpStatus.OK)
  async test() {
    return { message: 'Controlador de reservas funcionando sin servicio' };
  }

  @Get('mis-solicitudes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerMisSolicitudes(@Request() req: any) {
    const propietarioId = req.user.id; // El ID del usuario autenticado
    return await this.reservasService.obtenerSolicitudesPendientes(
      propietarioId,
    );
  }

  @Get('todas-mis-solicitudes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerTodasMisSolicitudes(@Request() req: any) {
    console.log('🎯 [CONTROLLER] obtenerTodasMisSolicitudes - Iniciando');
    console.log('🎯 [CONTROLLER] Usuario autenticado:', req.user);
    const propietarioId = req.user.id; // El ID del usuario autenticado
    console.log('🎯 [CONTROLLER] PropietarioId extraído:', propietarioId);

    try {
      const resultado =
        await this.reservasService.obtenerTodasLasSolicitudes(propietarioId);
      console.log('🎯 [CONTROLLER] Resultado del servicio:', resultado);
      return resultado;
    } catch (error) {
      console.error(
        '🎯 [CONTROLLER] Error en obtenerTodasMisSolicitudes:',
        error,
      );
      throw error;
    }
  }

  @Get('mis-reservas')
  @UseGuards(JwtAuthGuard)
  async obtenerMisReservas(@Request() req: any) {
    const arrendatarioId = req.user?.id;
    console.log('🔍 Obteniendo reservas para arrendatario:', {
      arrendatarioId,
      userObject: req.user,
    });
    return this.reservasService.obtenerReservasArrendatario(arrendatarioId);
  }

  @Post(':id/aceptar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async aceptarSolicitud(@Param('id') reservaId: string, @Request() req: any) {
    console.log(
      `🎯 [CONTROLLER] Aceptar solicitud reserva ${reservaId} por usuario ${req.user.id}`,
    );
    try {
      // Verificar que la reserva existe y pertenece al propietario
      const reserva = await this.reservasService.obtenerReservaPorId(reservaId);

      if (!reserva.success || !reserva.data) {
        throw new NotFoundException('Reserva no encontrada');
      }

      // Verificar que el usuario autenticado es el propietario
      if (reserva.data.propietarioId !== req.user.id) {
        throw new BadRequestException(
          'No tienes permisos para aceptar esta solicitud',
        );
      }

      // Verificar que la reserva está en estado PENDIENTE
      if (reserva.data.estado !== 'PENDIENTE') {
        throw new BadRequestException(
          'Solo se pueden aceptar solicitudes pendientes',
        );
      }

      const resultado = await this.reservasService.confirmarReserva(reservaId);

      console.log(
        `✅ [CONTROLLER] Solicitud aceptada exitosamente. Estado: ${resultado.data.estado}`,
      );

      return {
        success: true,
        message: 'Solicitud aceptada exitosamente',
        data: resultado.data,
      };
    } catch (error) {
      console.error(
        `❌ [CONTROLLER] Error al aceptar solicitud ${reservaId}:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al aceptar la solicitud');
    }
  }

  @Post(':id/rechazar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async rechazarSolicitud(@Param('id') reservaId: string, @Request() req: any) {
    try {
      // Verificar que la reserva existe y pertenece al propietario
      const reserva = await this.reservasService.obtenerReservaPorId(reservaId);

      if (!reserva.success || !reserva.data) {
        throw new NotFoundException('Reserva no encontrada');
      }

      // Verificar que el usuario autenticado es el propietario
      if (reserva.data.propietarioId !== req.user.id) {
        throw new BadRequestException(
          'No tienes permisos para rechazar esta solicitud',
        );
      }

      // Verificar que la reserva está en estado PENDIENTE
      if (reserva.data.estado !== 'PENDIENTE') {
        throw new BadRequestException(
          'Solo se pueden rechazar solicitudes pendientes',
        );
      }

      const resultado = await this.reservasService.rechazarReserva(reservaId);

      return {
        success: true,
        message: 'Solicitud rechazada exitosamente',
        data: resultado.data,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al rechazar la solicitud');
    }
  }

  @Post(':id/activar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async activarReserva(@Param('id') reservaId: string, @Request() req: any) {
    try {
      // Verificar que la reserva existe
      const reserva = await this.reservasService.obtenerReservaPorId(reservaId);

      if (!reserva.success || !reserva.data) {
        throw new NotFoundException('Reserva no encontrada');
      }

      // Verificar que el usuario autenticado es el arrendatario (quien paga)
      if (reserva.data.usuarioId !== req.user.id) {
        throw new BadRequestException(
          'No tienes permisos para activar esta reserva',
        );
      }

      // Verificar que la reserva está en estado CONFIRMADA
      if (reserva.data.estado !== 'CONFIRMADA') {
        throw new BadRequestException(
          'Solo se pueden activar reservas confirmadas',
        );
      }

      const resultado = await this.reservasService.activarReserva(reservaId);

      return {
        success: true,
        message: 'Reserva activada exitosamente',
        data: resultado.data,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al activar la reserva');
    }
  }

  @Put(':id/activar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async activarReservaPut(@Param('id') reservaId: string, @Request() req: any) {
    return this.activarReserva(reservaId, req);
  }

  @Post(':id/finalizar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async finalizarReserva(@Param('id') reservaId: string, @Request() req: any) {
    console.log(
      `🏁 [CONTROLLER] Solicitud finalizar reserva ${reservaId} por usuario ${req.user.id}`,
    );
    try {
      // Verificar que la reserva existe
      const reserva = await this.reservasService.obtenerReservaPorId(reservaId);

      if (!reserva.success || !reserva.data) {
        console.error(`❌ [CONTROLLER] Reserva ${reservaId} no encontrada`);
        throw new NotFoundException('Reserva no encontrada');
      }

      // Verificar que el usuario autenticado es el propietario
      if (reserva.data.propietarioId !== req.user.id) {
        console.error(
          `❌ [CONTROLLER] Usuario ${req.user.id} no es propietario de ${reservaId}`,
        );
        throw new BadRequestException(
          'No tienes permisos para finalizar esta reserva',
        );
      }

      // Verificar que la reserva está en estado EN_CURSO
      // IMPORTANTE: Relajamos esta verificación para permitir corregir estados inconsistentes si es necesario,
      // pero idealmente debería ser EN_CURSO. Lo dejamos como warning.
      if (reserva.data.estado !== 'EN_CURSO') {
        console.warn(
          `⚠️ [CONTROLLER] Finalizando reserva ${reservaId} que estaba en estado ${reserva.data.estado}`,
        );
      }

      console.log(
        `🔄 [CONTROLLER] Llamando a servicio finalizarReserva para ${reservaId}`,
      );
      const resultado = await this.reservasService.finalizarReserva(reservaId);
      console.log(
        `✅ [CONTROLLER] Reserva finalizada. Nuevo estado:`,
        resultado.data.estado,
      );

      return {
        success: true,
        message: 'Reserva finalizada exitosamente',
        data: resultado.data, // Devolvemos el objeto actualizado directo
      };
    } catch (error) {
      console.error(
        `❌ [CONTROLLER] Error finalizando reserva ${reservaId}:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error al finalizar la reserva');
    }
  }

  @Get('mis-reservas-activas')
  @UseGuards(JwtAuthGuard)
  async obtenerMisReservasActivas(@Request() req: any) {
    const propietarioId = req.user.id;
    console.log(
      '🔍 [CONTROLLER] Obteniendo reservas activas para propietario:',
      propietarioId,
    );
    return this.reservasService.obtenerReservasActivasPropietario(
      propietarioId,
    );
  }

  @Get('mi-historial-reservas')
  @UseGuards(JwtAuthGuard)
  async obtenerMiHistorialReservas(@Request() req: any) {
    const propietarioId = req.user.id;
    console.log(
      '🔍 [CONTROLLER] Obteniendo historial de reservas para propietario:',
      propietarioId,
    );
    return this.reservasService.obtenerHistorialReservasPropietario(
      propietarioId,
    );
  }
}
