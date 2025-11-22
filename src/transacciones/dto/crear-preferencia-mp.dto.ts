import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CrearPreferenciaMpDto {
  @IsString()
  @IsNotEmpty()
  reservaId: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
