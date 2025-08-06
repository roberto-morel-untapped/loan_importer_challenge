import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';

describe('ImportService', () => {
  let service: ImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportService],
    }).compile();

    service = module.get<ImportService>(ImportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processImport', () => {
    it('should process valid CSV files successfully', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getDate()).padStart(2, '0');
      const year = futureDate.getFullYear();
      const futureDateStr = `${month}/${day}/${year}`;

      const loansFile = {
        fieldname: 'loans',
        buffer: Buffer.from(
          `number,contract_date,total_amount,installments\nLOAN001,${futureDateStr},50000,60`,
        ),
      } as Express.Multer.File;

      const consumersFile = {
        fieldname: 'consumers',
        buffer: Buffer.from(
          `loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890`,
        ),
      } as Express.Multer.File;

      const balancesFile = {
        fieldname: 'balances',
        buffer: Buffer.from(
          `loan_number,finance_type,bucket,amount\nLOAN001,auto,principal,50000`,
        ),
      } as Express.Multer.File;

      const result = await service.processImport(
        loansFile,
        consumersFile,
        balancesFile,
      );

      expect(result.message).toBe('Valid import');
      expect(result.loans).toBeDefined();
      expect(result.consumers).toBeDefined();
      expect(result.balances).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for past date', async () => {
      const loansFile = {
        fieldname: 'loans',
        buffer: Buffer.from(
          `number,contract_date,total_amount,installments\nLOAN001,12/25/2020,50000,60`,
        ),
      } as Express.Multer.File;

      const consumersFile = {
        fieldname: 'consumers',
        buffer: Buffer.from(
          `loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890`,
        ),
      } as Express.Multer.File;

      const balancesFile = {
        fieldname: 'balances',
        buffer: Buffer.from(
          `loan_number,finance_type,bucket,amount\nLOAN001,auto,principal,50000`,
        ),
      } as Express.Multer.File;

      const result = await service.processImport(
        loansFile,
        consumersFile,
        balancesFile,
      );

      expect(result.errors).toBeDefined();
      expect(result.errors.loans.length).toBeGreaterThan(0);
      expect(result.errors.loans[0].column).toBe('contract_date');
    });

    it('should return errors for duplicate loan numbers', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getDate()).padStart(2, '0');
      const year = futureDate.getFullYear();
      const futureDateStr = `${month}/${day}/${year}`;

      const loansFile = {
        fieldname: 'loans',
        buffer: Buffer.from(
          `number,contract_date,total_amount,installments\nLOAN001,${futureDateStr},50000,60\nLOAN001,${futureDateStr},60000,72`,
        ),
      } as Express.Multer.File;

      const consumersFile = {
        fieldname: 'consumers',
        buffer: Buffer.from(
          `loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890`,
        ),
      } as Express.Multer.File;

      const balancesFile = {
        fieldname: 'balances',
        buffer: Buffer.from(
          `loan_number,finance_type,bucket,amount\nLOAN001,auto,principal,50000`,
        ),
      } as Express.Multer.File;

      const result = await service.processImport(
        loansFile,
        consumersFile,
        balancesFile,
      );

      expect(result.errors).toBeDefined();
      expect(result.errors.loans.length).toBeGreaterThan(0);
      expect(result.errors.loans.some((e) => e.error.includes('unique'))).toBe(
        true,
      );
    });

    it('should return errors for invalid bucket rules', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getDate()).padStart(2, '0');
      const year = futureDate.getFullYear();
      const futureDateStr = `${month}/${day}/${year}`;

      const loansFile = {
        fieldname: 'loans',
        buffer: Buffer.from(
          `number,contract_date,total_amount,installments\nLOAN001,${futureDateStr},50000,60`,
        ),
      } as Express.Multer.File;

      const consumersFile = {
        fieldname: 'consumers',
        buffer: Buffer.from(
          `loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890`,
        ),
      } as Express.Multer.File;

      const balancesFile = {
        fieldname: 'balances',
        buffer: Buffer.from(
          `loan_number,finance_type,bucket,amount\nLOAN001,real_estate,interest,50000`,
        ),
      } as Express.Multer.File;

      const result = await service.processImport(
        loansFile,
        consumersFile,
        balancesFile,
      );

      expect(result.errors).toBeDefined();
      expect(result.errors.balances.length).toBeGreaterThan(0);
      expect(result.errors.balances[0].column).toBe('bucket');
    });

    it('should return errors for cross-reference validation', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getDate()).padStart(2, '0');
      const year = futureDate.getFullYear();
      const futureDateStr = `${month}/${day}/${year}`;

      const loansFile = {
        fieldname: 'loans',
        buffer: Buffer.from(
          `number,contract_date,total_amount,installments\nLOAN001,${futureDateStr},50000,60`,
        ),
      } as Express.Multer.File;

      const consumersFile = {
        fieldname: 'consumers',
        buffer: Buffer.from(
          `loan_number,full_name,birth_date,phone_number\nLOAN002,John Doe,01/15/1990,1234567890`,
        ),
      } as Express.Multer.File;

      const balancesFile = {
        fieldname: 'balances',
        buffer: Buffer.from(
          `loan_number,finance_type,bucket,amount\nLOAN001,auto,principal,50000`,
        ),
      } as Express.Multer.File;

      const result = await service.processImport(
        loansFile,
        consumersFile,
        balancesFile,
      );

      expect(result.errors).toBeDefined();
      expect(result.errors.consumers.length).toBeGreaterThan(0);
      expect(result.errors.consumers[0].column).toBe('loan_number');
    });

    it('should return errors for total amount mismatch', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getDate()).padStart(2, '0');
      const year = futureDate.getFullYear();
      const futureDateStr = `${month}/${day}/${year}`;

      const loansFile = {
        fieldname: 'loans',
        buffer: Buffer.from(
          `number,contract_date,total_amount,installments\nLOAN001,${futureDateStr},50000,60`,
        ),
      } as Express.Multer.File;

      const consumersFile = {
        fieldname: 'consumers',
        buffer: Buffer.from(
          `loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890`,
        ),
      } as Express.Multer.File;

      const balancesFile = {
        fieldname: 'balances',
        buffer: Buffer.from(
          `loan_number,finance_type,bucket,amount\nLOAN001,auto,principal,40000`,
        ),
      } as Express.Multer.File;

      const result = await service.processImport(
        loansFile,
        consumersFile,
        balancesFile,
      );

      expect(result.errors).toBeDefined();
      expect(result.errors.loans.length).toBeGreaterThan(0);
      expect(result.errors.loans[0].column).toBe('total_amount');
    });
  });
});
