import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ImportResponseDto, ImportErrorDto } from './dto/import-response.dto';
import { LoanDto } from './dto/loan.dto';
import { ConsumerDto } from './dto/consumer.dto';
import { BalanceDto } from './dto/balance.dto';

@Injectable()
export class ImportService {
  async processImport(
    loansFile: Express.Multer.File,
    consumersFile: Express.Multer.File,
    balancesFile: Express.Multer.File,
  ): Promise<ImportResponseDto> {
    try {
      // Parse CSV files
      const loans = await this.parseCsv(loansFile.buffer);
      const consumers = await this.parseCsv(consumersFile.buffer);
      const balances = await this.parseCsv(balancesFile.buffer);

      // Validate each file
      const loanErrors = await this.validateLoans(loans);
      const consumerErrors = await this.validateConsumers(consumers);
      const balanceErrors = await this.validateBalances(balances);

      // Cross-reference validation
      const crossReferenceErrors = await this.validateCrossReferences(
        loans,
        consumers,
        balances,
      );

      // Combine all errors
      const allErrors = {
        loans: [...loanErrors, ...crossReferenceErrors.loans],
        consumers: [...consumerErrors, ...crossReferenceErrors.consumers],
        balances: [...balanceErrors, ...crossReferenceErrors.balances],
      };

      // Check if there are any errors
      const hasErrors =
        allErrors.loans.length > 0 ||
        allErrors.consumers.length > 0 ||
        allErrors.balances.length > 0;

      if (hasErrors) {
        return {
          errors: allErrors,
        };
      }

      return {
        message: 'Valid import',
        loans,
        consumers,
        balances,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to process import: ${error.message}`,
      );
    }
  }

  private async parseCsv(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      parser.on('data', (row) => {
        results.push(row);
      });

      parser.on('end', () => {
        resolve(results);
      });

      parser.on('error', (error) => {
        reject(error);
      });

      parser.write(buffer);
      parser.end();
    });
  }

  private async validateLoans(loans: any[]): Promise<ImportErrorDto[]> {
    const errors: ImportErrorDto[] = [];
    const loanNumbers = new Set<string>();

    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i];
      const lineNumber = i + 2; // +2 because CSV has header and 0-based index

      try {
        // Convert string values to proper types
        const loanData = {
          ...loan,
          total_amount: parseInt(loan.total_amount, 10),
          installments: parseInt(loan.installments, 10),
        };

        const loanDto = plainToClass(LoanDto, loanData);
        const validationErrors = await validate(loanDto);

        for (const error of validationErrors) {
          errors.push({
            line: lineNumber,
            column: error.property,
            error:
              Object.values(error.constraints || {})[0] || 'Validation failed',
          });
        }

        // Check for duplicate loan numbers (only if number is valid)
        if (!validationErrors.some((e) => e.property === 'number')) {
          if (loanNumbers.has(loan.number)) {
            errors.push({
              line: lineNumber,
              column: 'number',
              error: 'Loan number must be unique',
            });
          } else {
            loanNumbers.add(loan.number);
          }
        }
      } catch (error) {
        errors.push({
          line: lineNumber,
          column: 'unknown',
          error: 'Invalid data format',
        });
      }
    }

    return errors;
  }

  private async validateConsumers(consumers: any[]): Promise<ImportErrorDto[]> {
    const errors: ImportErrorDto[] = [];

    for (let i = 0; i < consumers.length; i++) {
      const consumer = consumers[i];
      const lineNumber = i + 2;

      try {
        const consumerDto = plainToClass(ConsumerDto, consumer);
        const validationErrors = await validate(consumerDto);

        for (const error of validationErrors) {
          errors.push({
            line: lineNumber,
            column: error.property,
            error:
              Object.values(error.constraints || {})[0] || 'Validation failed',
          });
        }
      } catch (error) {
        errors.push({
          line: lineNumber,
          column: 'unknown',
          error: 'Invalid data format',
        });
      }
    }

    return errors;
  }

  private async validateBalances(balances: any[]): Promise<ImportErrorDto[]> {
    const errors: ImportErrorDto[] = [];

    for (let i = 0; i < balances.length; i++) {
      const balance = balances[i];
      const lineNumber = i + 2;

      try {
        // Convert string values to proper types
        const balanceData = {
          ...balance,
          amount: parseFloat(balance.amount),
        };

        const balanceDto = plainToClass(BalanceDto, balanceData);
        const validationErrors = await validate(balanceDto);

        for (const error of validationErrors) {
          errors.push({
            line: lineNumber,
            column: error.property,
            error:
              Object.values(error.constraints || {})[0] || 'Validation failed',
          });
        }
      } catch (error) {
        errors.push({
          line: lineNumber,
          column: 'unknown',
          error: 'Invalid data format',
        });
      }
    }

    return errors;
  }

  private async validateCrossReferences(
    loans: any[],
    consumers: any[],
    balances: any[],
  ): Promise<{
    loans: ImportErrorDto[];
    consumers: ImportErrorDto[];
    balances: ImportErrorDto[];
  }> {
    const errors = {
      loans: [] as ImportErrorDto[],
      consumers: [] as ImportErrorDto[],
      balances: [] as ImportErrorDto[],
    };

    // Create set of valid loan numbers
    const validLoanNumbers = new Set(loans.map((loan) => loan.number));

    // Check consumer loan_number references
    for (let i = 0; i < consumers.length; i++) {
      const consumer = consumers[i];
      const lineNumber = i + 2;

      if (!validLoanNumbers.has(consumer.loan_number)) {
        errors.consumers.push({
          line: lineNumber,
          column: 'loan_number',
          error: 'Loan number must exist in loans.csv',
        });
      }
    }

    // Check balance loan_number references and sum validation
    const balanceSums = new Map<string, number>();

    for (let i = 0; i < balances.length; i++) {
      const balance = balances[i];
      const lineNumber = i + 2;

      if (!validLoanNumbers.has(balance.loan_number)) {
        errors.balances.push({
          line: lineNumber,
          column: 'loan_number',
          error: 'Loan number must exist in loans.csv',
        });
      } else {
        // Accumulate balance amounts
        const currentSum = balanceSums.get(balance.loan_number) || 0;
        balanceSums.set(
          balance.loan_number,
          currentSum + Number(balance.amount),
        );
      }
    }

    // Check if balance sums match loan total_amount
    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i];
      const lineNumber = i + 2;
      const expectedAmount = Number(loan.total_amount);
      const actualAmount = balanceSums.get(loan.number) || 0;

      if (Math.abs(expectedAmount - actualAmount) > 0.01) {
        // Allow for floating point precision
        errors.loans.push({
          line: lineNumber,
          column: 'total_amount',
          error: `Total amount (${expectedAmount}) must equal sum of balance amounts (${actualAmount})`,
        });
      }
    }

    return errors;
  }
}
