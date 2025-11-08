/**
 * DTO para filtrar y buscar publicaciones
 * Incluye parámetros de búsqueda, filtros y paginación
 */

import { IsOptional, IsString, IsEnum, IsDecimal, IsInt, Min, Max, IsBoolean, IsDate, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CategoriaEquipo, EstadoPublicacion, EstadoModeracion } from '@prisma/client';

export class FiltrosPublicacionDto {
  // Búsqueda por texto
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  busqueda?: string;

  // Filtros por categoría
  @IsOptional()
  @IsEnum(CategoriaEquipo, { message: 'La categoría debe ser válida' })
  categoria?: CategoriaEquipo;

  // Filtros por ubicación
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  ciudad?: string;

  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  departamento?: string;

  // Filtros por precio
  @IsOptional()
  @IsNumber({}, { message: 'El precio mínimo debe ser un número válido' })
  @Min(0, { message: 'El precio mínimo debe ser mayor o igual a 0' })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  precioMinimo?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio máximo debe ser un número válido' })
  @Min(0, { message: 'El precio máximo debe ser mayor o igual a 0' })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  precioMaximo?: number;

  // Filtros por disponibilidad
  @IsOptional()
  @IsBoolean({ message: 'La disponibilidad debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  disponible?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'La entrega a domicilio debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  entregaDomicilio?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El retiro local debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  retiroLocal?: boolean;

  // Filtros por estado
  @IsOptional()
  @IsEnum(EstadoPublicacion, { message: 'El estado debe ser válido' })
  estado?: EstadoPublicacion;

  // Filtros por estado de moderación (solo para vistas/admin)
  @IsOptional()
  @IsEnum(EstadoModeracion, { message: 'El estado de moderación debe ser válido' })
  estadoModeracion?: EstadoModeracion;

  // Flag: incluir todos los estados de moderación (para vistas de administración)
  // Cuando es true, no se aplica filtro por estadoModeracion y se listan todas las publicaciones
  @IsOptional()
  @IsBoolean({ message: 'incluirTodosEstadosModeracion debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  incluirTodosEstadosModeracion?: boolean;

  // Filtros por calificación
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' }, { message: 'La calificación mínima debe ser un decimal válido' })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @Min(0, { message: 'La calificación mínima debe ser mayor o igual a 0' })
  @Max(5, { message: 'La calificación mínima debe ser menor o igual a 5' })
  calificacionMinima?: number;

  // Ordenamiento
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena de texto' })
  ordenarPor?: string = 'fechaCreacion';

  @IsOptional()
  @IsString({ message: 'La dirección de ordenamiento debe ser una cadena de texto' })
  direccionOrden?: 'asc' | 'desc' = 'desc';

  // Paginación
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limite?: number = 10;

  // Filtros geográficos (para búsqueda por proximidad)
  @IsOptional()
  @IsDecimal({ decimal_digits: '8' }, { message: 'La latitud debe ser un decimal válido' })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  latitud?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '8' }, { message: 'La longitud debe ser un decimal válido' })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  longitud?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' }, { message: 'El radio debe ser un decimal válido' })
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @Min(0.1, { message: 'El radio debe ser mayor a 0.1 km' })
  @Max(100, { message: 'El radio no puede ser mayor a 100 km' })
  radioKm?: number;

  // Filtro por rango de fechas (para verificar disponibilidad)
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  fechaInicio?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin?: Date;
}