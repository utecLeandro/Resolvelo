import { IsEnum } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class CambiarRolDto {
  @IsEnum(RolUsuario)
  rol!: RolUsuario;
}
