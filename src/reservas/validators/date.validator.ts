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
  validate(value: any, _args: ValidationArguments) {
    if (!value) return false;

    const parseLocalDate = (v: any) => {
      if (typeof v === 'string') {
        const m = v.match(
          /^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:[T ]([0-9]{2}):([0-9]{2}):([0-9]{2}))?$/,
        );
        if (m) {
          const y = Number(m[1]);
          const mo = Number(m[2]) - 1;
          const d = Number(m[3]);
          const hh = m[4] ? Number(m[4]) : 0;
          const mm = m[5] ? Number(m[5]) : 0;
          const ss = m[6] ? Number(m[6]) : 0;
          return new Date(y, mo, d, hh, mm, ss);
        }
      }
      return new Date(v);
    };

    try {
      const inputDate = parseLocalDate(value);
      const now = new Date();

      if (isNaN(inputDate.getTime())) {
        return false;
      }

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return inputDate >= today;
    } catch (_error) {
      return false;
    }
  }

  defaultMessage(_args: ValidationArguments) {
    return 'La fecha debe ser desde el día actual en adelante';
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

    const parseLocalDate = (v: any) => {
      if (typeof v === 'string') {
        const m = v.match(
          /^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:[T ]([0-9]{2}):([0-9]{2}):([0-9]{2}))?$/,
        );
        if (m) {
          const y = Number(m[1]);
          const mo = Number(m[2]) - 1;
          const d = Number(m[3]);
          const hh = m[4] ? Number(m[4]) : 0;
          const mm = m[5] ? Number(m[5]) : 0;
          const ss = m[6] ? Number(m[6]) : 0;
          return new Date(y, mo, d, hh, mm, ss);
        }
      }
      return new Date(v);
    };

    try {
      const currentDate = parseLocalDate(value);
      const relatedDate = parseLocalDate(relatedValue);

      if (isNaN(currentDate.getTime()) || isNaN(relatedDate.getTime())) {
        return false;
      }

      return currentDate >= relatedDate;
    } catch (_error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `La fecha debe ser posterior o igual a ${relatedPropertyName}`;
  }
}

/**
 * Decorador para validar que una fecha sea en el futuro
 */
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
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
export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterConstraint,
    });
  };
}
