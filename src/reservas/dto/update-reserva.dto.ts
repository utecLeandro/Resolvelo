import { IsEnum, IsOptional, IsDateString, IsNumber, IsString } from 'class-validator';
import { EstadoReserva } from '@prisma/client';

export class UpdateReservaDto {
  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string; // El servicio espera Date, pero el controller recibe string del JSON. El pipe lo transforma o lo hacemos manual.
  // Nota: En ReservasService.actualizarReserva espera Date. Aquí definimos lo que entra por HTTP.

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsNumber()
  precioTotal?: number;
  
  @IsOptional()
  @IsString()
  notasUsuario?: string;
}
