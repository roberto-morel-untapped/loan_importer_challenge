import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ConsumerDto {
  @IsString()
  @IsNotEmpty()
  loan_number: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Date must be in MM/DD/YYYY format',
  })
  birth_date: string;

  @IsString()
  @Matches(/^[\d+\-]{9,15}$/, {
    message: 'Phone number must be 9-15 characters with digits, +, or -',
  })
  phone_number: string;
}
