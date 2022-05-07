import {
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/decorators/public.decorator';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { multerOptions } from '../config/multer-options.config';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly configService: ConfigService) {}

  @Public()
  @Post('file')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  uploadFileWithMulterOptions(@UploadedFile() file) {
    /*
    {
      "fieldname": "avatar",
      "originalname": "elo.jpg",
      "encoding": "7bit",
      "mimetype": "image/jpeg",
      "destination": "./uploads/temp",
      "filename": "ca263280-d8a1-4395-8e68-cbfe45ec9a10.jpg",
      "path": "uploads\\temp\\ca263280-d8a1-4395-8e68-cbfe45ec9a10.jpg",
      "size": 59900
    }
    */
    return { message: 'File is uploaded' };
  }

  @Public()
  @Post('file2')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadFileWithoutMulterOptions(@UploadedFile() file) {
    try {
      const uploadTempDir = this.configService.get<string>('UPLOAD_TEMP_DIR');
      fs.writeFileSync(`${uploadTempDir}/${file.originalname}`, file.buffer);
      return {
        status: 'success',
        message: 'File upload successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: error.message,
      });
    }
  }
}
