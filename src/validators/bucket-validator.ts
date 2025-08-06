import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidBucket(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidBucket',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          const obj = args.object as any;
          const financeType = obj.finance_type;

          if (!financeType) {
            return false;
          }

          if (financeType === 'real_estate') {
            return value === 'principal';
          } else if (financeType === 'auto') {
            return value === 'principal' || value === 'interest';
          }

          return false;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Invalid bucket for finance type';
        },
      },
    });
  };
}
