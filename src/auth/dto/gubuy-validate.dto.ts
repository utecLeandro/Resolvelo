import { IsString, IsEmail, MinLength } from 'class-validator'

export class GubuyValidateDto {
  @IsString()
  @MinLength(1)
  nombre!: string

  @IsString()
  @MinLength(1)
  apellido!: string

  @IsString()
  @MinLength(3)
  documentoIdentidad!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string
}