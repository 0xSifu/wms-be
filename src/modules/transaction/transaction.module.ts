import { Module } from '@nestjs/common';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionService } from './services/transaction.service';
import { PrismaService } from '../../common/services/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'TRANSACTION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.RABBITMQ_TRANSACTION_QUEUE || 'transaction_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, PrismaService],
  exports: [TransactionService]
})
export class TransactionModule {} 