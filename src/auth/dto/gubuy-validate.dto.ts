import { IsString, IsEmail, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsCedulaUruguaya, normalizeCiUy } from '../validators/ci-uy.validator';

export class GubuyValidateDto {
  @IsString()
  @MinLength(1)
  nombre!: string;

  @IsString()
  @MinLength(1)
  apellido!: string;

  @IsString()
  @MinLength(3)
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeCiUy(value) : value,
  )
  @IsCedulaUruguaya({ message: 'La cédula de identidad no es válida' })
  documentoIdentidad!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
