import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDateInRange(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateInRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // TODO: Implement date validation
          // - Parse MM/DD/YYYY format
          // - Check if date is valid
          // - Ensure date is in the future
          // - Ensure date is not more than 10 years ahead
          return false;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Date must be in MM/DD/YYYY format, in the future and not more than 10 years ahead';
        },
      },
    });
  };
}
