import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CatSafeService } from './cat-safe.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('cat-safe')
export class CatSafeController {
  constructor(private readonly catSafeService: CatSafeService) {}

  @Post('check-harmful')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'the image of the user',
        },
        longitude: {
          type: 'number',
          description: 'the longitude of the plant',
          example: -73.968285,
        },
        latitude: {
          type: 'number',
          description: 'the latitude of the plant',
          example: 40.785091,
        },
      },
    },
  })
  async checkHarmful(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
    @Body()
    body: { longitude: number; latitude: number },
  ) {
    return this.catSafeService.checkThePlantIsHarmful(
      image,
      body.longitude,
      body.latitude,
    );
  }
}
