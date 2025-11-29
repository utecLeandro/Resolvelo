import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CrearCalificacionDto {
  @IsString()
  @IsNotEmpty()
  reservaId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  puntuacion!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentario?: string;
}
