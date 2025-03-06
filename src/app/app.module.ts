import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { join } from 'path';
import { TerminusModule } from '@nestjs/terminus';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { PassportModule } from '@nestjs/passport';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { GlobalExceptionFilter } from 'src/interceptors/exception.interceptor';
import { LoggingMiddleware } from '../middlewares/logging.middleware';
import { AuthJwtAccessGuard } from 'src/guards/jwt.access.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { UserDetailModule } from '../modules/userdetail/userdetail.module';
import { CommonModule } from 'src/common/common.module';
import { TagModule } from '../modules/tag/tag.module';
import { ProductsModule } from '../modules/product/products.module';
import { BatchModule } from 'src/modules/batch/batch.module';
import { TransactionModule } from 'src/modules/transaction/transaction.module';
import { ScannerModule } from 'src/modules/scanner/scanner.module';

const translationsPath = join(__dirname, '../i18n/');
console.log('Translations Path:', translationsPath);

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserDetailModule,
    TagModule,
    ProductsModule,
    BatchModule,
    TransactionModule,
    ScannerModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthJwtAccessGuard,
    // }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
