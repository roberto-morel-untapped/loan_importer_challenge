export class ImportErrorDto {
  line: number;
  column: string;
  error: string;
}

export class ImportResponseDto {
  message?: string;
  loans?: any[];
  consumers?: any[];
  balances?: any[];
  errors?: {
    loans?: ImportErrorDto[];
    consumers?: ImportErrorDto[];
    balances?: ImportErrorDto[];
  };
} 