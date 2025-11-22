/**
 * DTO para el login de usuario
 * Valida email y contraseña requeridos
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  /**
   * Email del usuario (requerido y debe ser válido)
   */
  @IsEmail({}, { message: "Debe proporcionar un email válido" })
  @IsNotEmpty({ message: "El email es requerido" })
  email!: string;

  /**
   * Contraseña del usuario (requerida, mínimo 6 caracteres)
   */
  @IsString({ message: "La contraseña debe ser una cadena de texto" })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password!: string;
}
