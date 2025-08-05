import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class LoanDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  contract_date: string;

  @IsInt()
  @Min(0)
  total_amount: number;

  @IsInt()
  @Min(1)
  installments: number;
} 