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
          if (typeof value !== 'string') {
            return false;
          }

          // Parse MM/DD/YYYY format
          const dateParts = value.split('/');
          if (dateParts.length !== 3) {
            return false;
          }

          const month = parseInt(dateParts[0], 10);
          const day = parseInt(dateParts[1], 10);
          const year = parseInt(dateParts[2], 10);

          if (isNaN(month) || isNaN(day) || isNaN(year)) {
            return false;
          }

          // Create date object
          const date = new Date(year, month - 1, day);

          // Check if date is valid
          if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
          ) {
            return false;
          }

          const now = new Date();
          const tenYearsFromNow = new Date();
          tenYearsFromNow.setFullYear(now.getFullYear() + 10);

          // Check if date is in the future and not more than 10 years ahead
          return date > now && date <= tenYearsFromNow;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Date must be in MM/DD/YYYY format, in the future and not more than 10 years ahead';
        },
      },
    });
  };
}
