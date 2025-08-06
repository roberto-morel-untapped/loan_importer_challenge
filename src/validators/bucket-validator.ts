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
          // TODO: Implement bucket validation based on finance_type
          // - Get finance_type from the object
          // - For 'real_estate': bucket must be 'principal'
          // - For 'auto': bucket must be 'principal' or 'interest'
          return false;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Invalid bucket for finance type';
        },
      },
    });
  };
}
