import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

describe('ImportController', () => {
  let controller: ImportController;
  let service: ImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [
        {
          provide: ImportService,
          useValue: {
            processImport: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImportController>(ImportController);
    service = module.get<ImportService>(ImportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importFiles', () => {
    it('should process valid files successfully', async () => {
      const mockFiles = [
        {
          fieldname: 'files',
          originalname: 'loans.csv',
          buffer: Buffer.from('number,contract_date,total_amount,installments\nLOAN001,12/25/2025,50000,60'),
        },
        {
          fieldname: 'files',
          originalname: 'consumers.csv',
          buffer: Buffer.from('loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890'),
        },
        {
          fieldname: 'files',
          originalname: 'balances.csv',
          buffer: Buffer.from('loan_number,finance_type,bucket,amount\nLOAN001,auto,principal,50000'),
        },
      ] as Express.Multer.File[];

      const mockResponse = {
        message: 'Valid import',
        loans: [],
        consumers: [],
        balances: [],
      };

      jest.spyOn(service, 'processImport').mockResolvedValue(mockResponse);

      const result = await controller.importFiles(mockFiles);

      expect(service.processImport).toHaveBeenCalledWith(
        mockFiles[0],
        mockFiles[1],
        mockFiles[2],
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle missing files', async () => {
      const mockFiles = [
        {
          fieldname: 'files',
          originalname: 'loans.csv',
          buffer: Buffer.from('number,contract_date,total_amount,installments\nLOAN001,12/25/2025,50000,60'),
        },
      ] as Express.Multer.File[];

      await expect(controller.importFiles(mockFiles)).rejects.toThrow(
        'Exactly 3 CSV files are required',
      );
    });

    it('should handle wrong number of files', async () => {
      const mockFiles = [
        {
          fieldname: 'files',
          originalname: 'loans.csv',
          buffer: Buffer.from('number,contract_date,total_amount,installments\nLOAN001,12/25/2025,50000,60'),
        },
        {
          fieldname: 'files',
          originalname: 'consumers.csv',
          buffer: Buffer.from('loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890'),
        },
      ] as Express.Multer.File[];

      await expect(controller.importFiles(mockFiles)).rejects.toThrow(
        'Exactly 3 CSV files are required',
      );
    });

    it('should handle missing required files', async () => {
      const mockFiles = [
        {
          fieldname: 'files',
          originalname: 'loans.csv',
          buffer: Buffer.from('number,contract_date,total_amount,installments\nLOAN001,12/25/2025,50000,60'),
        },
        {
          fieldname: 'files',
          originalname: 'consumers.csv',
          buffer: Buffer.from('loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890'),
        },
        {
          fieldname: 'files',
          originalname: 'wrong-name.csv',
          buffer: Buffer.from('loan_number,finance_type,bucket,amount\nLOAN001,auto,principal,50000'),
        },
      ] as Express.Multer.File[];

      await expect(controller.importFiles(mockFiles)).rejects.toThrow(
        'Files must be named: loans.csv, consumers.csv, balances.csv',
      );
    });

    it('should handle service errors', async () => {
      const mockFiles = [
        {
          fieldname: 'files',
          originalname: 'loans.csv',
          buffer: Buffer.from('number,contract_date,total_amount,installments\nLOAN001,12/25/2025,50000,60'),
        },
        {
          fieldname: 'files',
          originalname: 'consumers.csv',
          buffer: Buffer.from('loan_number,full_name,birth_date,phone_number\nLOAN001,John Doe,01/15/1990,1234567890'),
        },
        {
          fieldname: 'files',
          originalname: 'balances.csv',
          buffer: Buffer.from('loan_number,finance_type,bucket,amount\nLOAN001,auto,principal,50000'),
        },
      ] as Express.Multer.File[];

      jest.spyOn(service, 'processImport').mockRejectedValue(new Error('Service error'));

      await expect(controller.importFiles(mockFiles)).rejects.toThrow('Service error');
    });
  });
});
