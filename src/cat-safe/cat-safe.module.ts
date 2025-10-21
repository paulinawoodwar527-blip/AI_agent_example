import { Module } from '@nestjs/common';
import { CatSafeController } from './cat-safe.controller';
import { CatSafeService } from './cat-safe.service';

@Module({
  controllers: [CatSafeController],
  providers: [CatSafeService],
})
export class CatSafeModule {}
