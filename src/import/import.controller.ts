import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { ImportResponseDto } from './dto/import-response.dto';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype === 'text/csv' ||
          file.originalname.endsWith('.csv')
        ) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only CSV files are allowed'),
            false,
          );
        }
      },
    }),
  )
  async importFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ImportResponseDto> {
    if (!files || files.length !== 3) {
      throw new BadRequestException('Exactly 3 CSV files are required');
    }

    // Extract files by filename since they all have the same field name
    const loansFile = files.find((f) => f.originalname === 'loans.csv');
    const consumersFile = files.find((f) => f.originalname === 'consumers.csv');
    const balancesFile = files.find((f) => f.originalname === 'balances.csv');

    if (!loansFile || !consumersFile || !balancesFile) {
      throw new BadRequestException(
        'Files must be named: loans.csv, consumers.csv, balances.csv',
      );
    }

    return this.importService.processImport(
      loansFile,
      consumersFile,
      balancesFile,
    );
  }
}
