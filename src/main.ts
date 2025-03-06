import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { setupSwagger } from './swagger';

import express, { Request, Response } from 'express';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(express()),
    {
      cors: true,
    },
  );

  const configService = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 200,
      message: `Message from ${configService.get('app.name')}`,
      data: {
        timestamp: new Date(),
      },
    });
  });

  const port: number = configService.get<number>('app.http.port');
  const host: string = configService.get<string>('app.http.host');

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api/v1');

  setupSwagger(app);

  // Connect to multiple RabbitMQ queues
  const queues = [
    process.env.RABBITMQ_AUTH_QUEUE,
    process.env.RABBITMQ_TAG_QUEUE,
    process.env.RABBITMQ_PRODUCT_QUEUE,
    process.env.RABBITMQ_BATCH_QUEUE,
    process.env.RABBITMQ_TRANSACTION_QUEUE
  ];
  for (const queue of queues) {
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue,
        queueOptions: { durable: false },
      },
    });
  }

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  await app.startAllMicroservices();
  await app.listen(port, host);
  logger.log(
    `🚀 ${configService.get(
      'app.name',
    )} service started successfully on port ${port}`,
  );
}
bootstrap();
