import { IsString, IsOptional, MinLength } from 'class-validator'

export class EnviarMensajeDto {
  @IsString()
  @MinLength(1)
  reservaId!: string

  @IsString()
  @MinLength(1)
  contenido!: string

  @IsOptional()
  @IsString()
  receptorId?: string
}