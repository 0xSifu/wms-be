import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TagModule } from './modules/tag/tag.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import configuration from './config/configuration';
import authConfig from './config/auth.config';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration, authConfig],
      isGlobal: true,
    }),
    CommonModule,
    AuthModule,
    TagModule,
    TransactionModule,
  ],
})
export class AppModule {} 