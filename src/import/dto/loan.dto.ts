import { IsString, IsInt, Min, IsNotEmpty, Matches } from 'class-validator';
import { IsDateInRange } from '../../validators';

export class LoanDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Date must be in MM/DD/YYYY format',
  })
  @IsDateInRange()
  contract_date: string;

  @IsInt()
  @Min(0)
  total_amount: number;

  @IsInt()
  @Min(1)
  installments: number;
}
