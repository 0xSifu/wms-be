import { Module } from '@nestjs/common';
import { HelperHashService } from './services/helper.hash.service';

@Module({
  providers: [HelperHashService],
  exports: [HelperHashService],
})
export class HelperModule {} 