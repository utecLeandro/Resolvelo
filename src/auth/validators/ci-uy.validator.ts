import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export function normalizeCiUy(input: string): string {
  if (!input) return '';
  return String(input).replace(/\D+/g, '');
}

export function isValidCiUy(input: string): boolean {
  const digits = normalizeCiUy(input);
  if (!/^\d{8}$/.test(digits)) return false;
  const base = digits.slice(0, 7).split('').map((d) => parseInt(d, 10));
  const check = parseInt(digits[7], 10);
  const multipliers = [2, 9, 8, 7, 6, 3, 4];
  const sum = base.reduce((acc, d, i) => acc + d * multipliers[i], 0);
  const dv = (10 - (sum % 10)) % 10;
  return dv === check;
}

@ValidatorConstraint({ async: false })
export class IsCedulaUruguayaConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments) {
    if (typeof value !== 'string') return false;
    return isValidCiUy(value);
  }
  defaultMessage(_args: ValidationArguments) {
    return 'La cédula de identidad uruguaya no es válida';
  }
}

export function IsCedulaUruguaya(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCedulaUruguayaConstraint,
    });
  };
}
