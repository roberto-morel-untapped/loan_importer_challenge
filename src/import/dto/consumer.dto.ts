import { IsString, IsNotEmpty } from 'class-validator';

export class ConsumerDto {
  @IsString()
  @IsNotEmpty()
  loan_number: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  birth_date: string;

  @IsString()
  phone_number: string;
} 