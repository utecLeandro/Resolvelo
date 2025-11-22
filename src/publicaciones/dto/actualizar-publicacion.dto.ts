/**
 * DTO para actualizar una publicación existente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */

import {
  IsString,
  IsOptional,
  IsDecimal,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsEnum,
  MaxLength,
  IsDateString,
  IsNumber,
} from "class-validator";
import { Transform } from "class-transformer";
import { CategoriaEquipo, EstadoPublicacion } from "@prisma/client";

export class ActualizarPublicacionDto {
  // Información básica del instrumento/equipo musical
  @IsOptional()
  @IsString({ message: "El título debe ser una cadena de texto" })
  @MaxLength(200, { message: "El título no puede exceder 200 caracteres" })
  titulo?: string;

  @IsOptional()
  @IsString({ message: "La descripción debe ser una cadena de texto" })
  descripcion?: string;

  @IsOptional()
  @IsEnum(CategoriaEquipo, { message: "La categoría debe ser válida" })
  categoria?: CategoriaEquipo;

  @IsOptional()
  @IsString({ message: "La marca debe ser una cadena de texto" })
  @MaxLength(100, { message: "La marca no puede exceder 100 caracteres" })
  marca?: string;

  @IsOptional()
  @IsString({ message: "El modelo debe ser una cadena de texto" })
  @MaxLength(100, { message: "El modelo no puede exceder 100 caracteres" })
  modelo?: string;

  @IsOptional()
  @IsInt({ message: "El año de fabricación debe ser un número entero" })
  @Min(1900, { message: "El año de fabricación debe ser mayor a 1900" })
  @Max(new Date().getFullYear(), {
    message: "El año de fabricación no puede ser futuro",
  })
  anioFabricacion?: number;

  // Información de precios
  @IsOptional()
  @IsNumber({}, { message: "El precio por día debe ser un número válido" })
  @Min(0.01, { message: "El precio por día debe ser mayor a 0" })
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  precioPorDia?: number;

  @IsOptional()
  @IsNumber({}, { message: "El precio por semana debe ser un número válido" })
  @Min(0.01, { message: "El precio por semana debe ser mayor a 0" })
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  precioPorSemana?: number;

  @IsOptional()
  @IsNumber({}, { message: "El precio por mes debe ser un número válido" })
  @Min(0.01, { message: "El precio por mes debe ser mayor a 0" })
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  precioPorMes?: number;

  @IsOptional()
  @IsNumber({}, { message: "El depósito debe ser un número válido" })
  @Min(0, { message: "El depósito debe ser mayor o igual a 0" })
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  deposito?: number;

  // Disponibilidad y restricciones
  @IsOptional()
  @IsBoolean({ message: "La disponibilidad debe ser verdadero o falso" })
  disponible?: boolean;

  @IsOptional()
  @IsInt({ message: "Los días mínimo de alquiler debe ser un número entero" })
  @Min(1, { message: "Los días mínimo de alquiler debe ser al menos 1" })
  diasMinimoAlquiler?: number;

  @IsOptional()
  @IsInt({ message: "Los días máximo de alquiler debe ser un número entero" })
  @Min(1, { message: "Los días máximo de alquiler debe ser al menos 1" })
  diasMaximoAlquiler?: number;

  // Ubicación del instrumento/equipo
  @IsOptional()
  @IsString({ message: "La dirección debe ser una cadena de texto" })
  @MaxLength(255, { message: "La dirección no puede exceder 255 caracteres" })
  direccion?: string;

  @IsOptional()
  @IsString({ message: "La ciudad debe ser una cadena de texto" })
  @MaxLength(100, { message: "La ciudad no puede exceder 100 caracteres" })
  ciudad?: string;

  @IsOptional()
  @IsString({ message: "El departamento debe ser una cadena de texto" })
  @MaxLength(100, {
    message: "El departamento no puede exceder 100 caracteres",
  })
  departamento?: string;

  @IsOptional()
  @IsString({ message: "El código postal debe ser una cadena de texto" })
  @MaxLength(10, { message: "El código postal no puede exceder 10 caracteres" })
  codigoPostal?: string;

  @IsOptional()
  @IsDecimal(
    { decimal_digits: "8" },
    { message: "La latitud debe ser un decimal válido" },
  )
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  latitud?: number;

  @IsOptional()
  @IsDecimal(
    { decimal_digits: "8" },
    { message: "La longitud debe ser un decimal válido" },
  )
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  longitud?: number;

  // Estado y configuración
  @IsOptional()
  @IsEnum(EstadoPublicacion, {
    message: "El estado de la publicación debe ser válido",
  })
  estado?: EstadoPublicacion;

  @IsOptional()
  @IsBoolean({ message: "La entrega a domicilio debe ser verdadero o falso" })
  entregaDomicilio?: boolean;

  @IsOptional()
  @IsBoolean({ message: "El retiro local debe ser verdadero o falso" })
  retiroLocal?: boolean;

  // Estado del equipo
  @IsOptional()
  @IsString({ message: "El estado del equipo debe ser una cadena de texto" })
  @MaxLength(50, {
    message: "El estado del equipo no puede exceder 50 caracteres",
  })
  estadoEquipo?: string;

  @IsOptional()
  @IsString({ message: "Las instrucciones deben ser una cadena de texto" })
  instrucciones?: string;
}
