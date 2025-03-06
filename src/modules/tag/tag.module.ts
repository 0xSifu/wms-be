import { Module } from '@nestjs/common';
import { TagController } from './controllers/tag.controller';
import { TagService } from './services/tag.service';
import { PrismaService } from '../../common/services/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TAG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: process.env.RABBITMQ_TAG_QUEUE || 'tag_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  controllers: [TagController],
  providers: [TagService, PrismaService],
  exports: [TagService]
})
export class TagModule {} 