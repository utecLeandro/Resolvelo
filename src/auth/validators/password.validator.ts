/**
 * Validador personalizado de contraseñas siguiendo estándares OWASP.
 * Implementa validaciones adicionales de seguridad.
 */
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class EsContrasenaSeguraConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (!password) return false;

    // Lista de contraseñas comunes prohibidas (OWASP)
    const contrasenasComunes = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      '1234567890', 'password1', '123123', 'admin123'
    ];

    // Verificar que no sea una contraseña común
    if (contrasenasComunes.includes(password.toLowerCase())) {
      return false;
    }

    // Verificar que no contenga secuencias repetitivas
    if (/(.)\1{2,}/.test(password)) {
      return false;
    }

    // Verificar que no contenga secuencias numéricas simples
    if (/123456|654321|012345|987654/.test(password)) {
      return false;
    }

    // Verificar que no contenga secuencias de teclado
    if (/qwerty|asdfgh|zxcvbn|qwertyuiop/.test(password.toLowerCase())) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'La contraseña no cumple con los criterios de seguridad: no debe ser una contraseña común, contener secuencias repetitivas o patrones de teclado';
  }
}

/**
 * Decorador para validar contraseñas seguras
 */
export function EsContrasenaSegura(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EsContrasenaSeguraConstraint,
    });
  };
}