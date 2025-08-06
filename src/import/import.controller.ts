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
        // TODO: Implement file type validation
        // Only allow CSV files
        callback(null, true);
      },
    }),
  )
  async importFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ImportResponseDto> {
    // TODO: Implement file validation
    // - Check if exactly 3 files are provided
    // - Validate file names (loans.csv, consumers.csv, balances.csv)
    // - Extract files by their original names

    // TODO: Call the service to process the import
    // return this.importService.processImport(loansFile, consumersFile, balancesFile);

    throw new BadRequestException('Implementation required');
  }
}
