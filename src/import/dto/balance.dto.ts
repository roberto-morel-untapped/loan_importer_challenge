import { IsString, IsNumber, Min, IsIn } from 'class-validator';

export class BalanceDto {
  @IsString()
  loan_number: string;

  @IsString()
  @IsIn(['auto', 'real_estate'])
  finance_type: string;

  @IsString()
  bucket: string;

  @IsNumber()
  @Min(0)
  amount: number;
} 