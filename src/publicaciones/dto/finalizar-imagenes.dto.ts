import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator'

export class FinalizarImagenDto {
  @IsString()
  @IsNotEmpty()
  url!: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean
}

export class FinalizarImagenesDto {
  @IsArray()
  images!: FinalizarImagenDto[]
}

