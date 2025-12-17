import { IsNotEmpty, IsString, Length, Matches, IsIn } from 'class-validator';

export class DatosBancariosDto {
  @IsNotEmpty({ message: 'El banco es requerido' })
  @IsString({ message: 'El banco debe ser una cadena de texto' })
  @Length(2, 100, { message: 'El nombre del banco debe tener entre 2 y 100 caracteres' })
  banco: string;

  @IsNotEmpty({ message: 'El tipo de cuenta es requerido' })
  @IsString()
  @IsIn(['CA', 'CC'], { message: 'El tipo de cuenta debe ser CA (Caja de Ahorro) o CC (Cuenta Corriente)' })
  tipoCuenta: string;

  @IsNotEmpty({ message: 'El número de cuenta es requerido' })
  @IsString({ message: 'El número de cuenta debe ser una cadena de texto' })
  @Length(5, 50, { message: 'El número de cuenta debe tener entre 5 y 50 caracteres' })
  numeroCuenta: string;

  @IsNotEmpty({ message: 'La moneda es requerida' })
  @IsString()
  @IsIn(['UYU', 'USD'], { message: 'La moneda debe ser UYU o USD' })
  moneda: string;

  @IsNotEmpty({ message: 'El titular de la cuenta es requerido' })
  @IsString({ message: 'El titular debe ser una cadena de texto' })
  @Length(2, 100, { message: 'El nombre del titular debe tener entre 2 y 100 caracteres' })
  titular: string;
}
