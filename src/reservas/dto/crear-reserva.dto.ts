/**
 * DTO para crear una nueva reserva
 * Incluye validaciones de negocio y transformaciones necesarias
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsEnum,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsAfter, IsFutureDate } from '../validators/date.validator';

export enum TipoEntrega {
  DOMICILIO = 'DOMICILIO',
  RETIRO = 'RETIRO',
}

export class CrearReservaDto {
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsString({ message: 'El ID del usuario debe ser una cadena' })
  usuarioId!: string;

  @IsNotEmpty({ message: 'El ID de la publicación es requerido' })
  @IsString({ message: 'El ID de la publicación debe ser una cadena' })
  publicacionId!: string;

  @IsNotEmpty({ message: 'El ID del propietario es requerido' })
  @IsString({ message: 'El ID del propietario debe ser una cadena' })
  propietarioId!: string;

  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe ser una fecha válida en formato ISO' },
  )
  @IsFutureDate({ message: 'La fecha de inicio debe ser en el futuro' })
  fechaInicio!: string;

  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString(
    {},
    { message: 'La fecha de fin debe ser una fecha válida en formato ISO' },
  )
  @IsAfter('fechaInicio', {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  })
  fechaFin!: string;

  @IsNotEmpty({ message: 'El precio total es requerido' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio total debe ser un número decimal válido' },
  )
  @Min(0, { message: 'El precio total debe ser mayor o igual a 0' })
  precioTotal!: number;

  @IsNotEmpty({ message: 'La comisión de la plataforma es requerida' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'La comisión debe ser un número decimal válido' },
  )
  @Min(0, { message: 'La comisión debe ser mayor o igual a 0' })
  comisionPlataforma!: number;

  @IsNotEmpty({ message: 'El tipo de entrega es requerido' })
  @IsEnum(TipoEntrega, {
    message: 'El tipo de entrega debe ser DOMICILIO o RETIRO',
  })
  tipoEntrega!: TipoEntrega;

  @ValidateIf((o) => o.tipoEntrega === TipoEntrega.DOMICILIO)
  @IsNotEmpty({
    message: 'La dirección de entrega es requerida para entregas a domicilio',
  })
  @IsString({ message: 'La dirección de entrega debe ser una cadena' })
  @MaxLength(255, {
    message: 'La dirección de entrega no puede exceder 255 caracteres',
  })
  direccionEntrega?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono de contacto debe ser una cadena' })
  @MaxLength(20, {
    message: 'El teléfono de contacto no puede exceder 20 caracteres',
  })
  telefonoContacto?: string;

  @IsOptional()
  @IsString({ message: 'Las notas del usuario deben ser una cadena' })
  @MaxLength(1000, {
    message: 'Las notas del usuario no pueden exceder 1000 caracteres',
  })
  notasUsuario?: string;
}
