import { Module } from '@nestjs/common';
import { ScannerController } from './controllers/scanner.controller';
import { ScannerService } from './services/scanner.service';
import { PrismaService } from '../../common/services/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SCANNER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.RABBITMQ_SCANNER_QUEUE || 'scanner_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  controllers: [ScannerController],
  providers: [ScannerService, PrismaService],
  exports: [ScannerService]
})
export class ScannerModule {} 