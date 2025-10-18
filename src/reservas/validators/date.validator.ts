/**
 * Validadores personalizados para fechas en reservas
 */

import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validador que verifica que una fecha sea en el futuro
 */
@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return false;
    
    try {
      const inputDate = new Date(value);
      const now = new Date();
      
      // Verificar que la fecha sea válida
      if (isNaN(inputDate.getTime())) {
        return false;
      }
      
      // Verificar que sea en el futuro (al menos 1 hora desde ahora)
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      return inputDate >= oneHourFromNow;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'La fecha debe ser al menos 1 hora en el futuro';
  }
}

/**
 * Validador que verifica que una fecha sea posterior a otra propiedad
 */
@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return false;
    
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    
    if (!relatedValue) return false;
    
    try {
      const currentDate = new Date(value);
      const relatedDate = new Date(relatedValue);
      
      // Verificar que ambas fechas sean válidas
      if (isNaN(currentDate.getTime()) || isNaN(relatedDate.getTime())) {
        return false;
      }
      
      // Verificar que la fecha actual sea posterior a la fecha relacionada
      // Debe ser al menos 1 hora después
      const oneHourAfterRelated = new Date(relatedDate.getTime() + 60 * 60 * 1000);
      return currentDate >= oneHourAfterRelated;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `La fecha debe ser al menos 1 hora posterior a ${relatedPropertyName}`;
  }
}

/**
 * Decorador para validar que una fecha sea en el futuro
 */
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}

/**
 * Decorador para validar que una fecha sea posterior a otra propiedad
 */
export function IsAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterConstraint,
    });
  };
}