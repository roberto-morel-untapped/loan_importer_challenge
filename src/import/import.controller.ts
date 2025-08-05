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
  @UseInterceptors(FilesInterceptor('files', 3))
  async importFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ImportResponseDto> {
    // TODO: Implement file handling logic
    // 1. Validate that exactly 3 files are uploaded
    // 2. Extract files by field name (loans, consumers, balances)
    // 3. Call importService.processImport with the three files
    // 4. Return the result

    throw new BadRequestException('Not implemented');
  }
} 