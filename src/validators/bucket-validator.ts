import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidBucket(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidBucket',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // TODO: Implement bucket validation
          // 1. Get finance_type from the object
          // 2. For 'auto': bucket must be 'principal' or 'interest'
          // 3. For 'real_estate': bucket must be 'principal'
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Invalid bucket for finance type';
        },
      },
    });
  };
} 