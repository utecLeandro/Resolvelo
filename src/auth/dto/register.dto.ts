/**
 * DTO para el registro de usuario.
 * Valida campos requeridos según criterios de aceptación y estándares OWASP.
 */
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';
import { EsContrasenaSegura } from '../validators/password.validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido!: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial (@$!%*?&)',
  })
  @EsContrasenaSegura({
    message: 'La contraseña no cumple con los estándares de seguridad',
  })
  password!: string;

  @IsOptional()
  telefono?: string;

  @IsNotEmpty({ message: 'El documento de identidad es requerido' })
  documentoIdentidad!: string;
}
