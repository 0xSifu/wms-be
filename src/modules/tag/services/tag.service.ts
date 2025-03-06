import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CreateTagDto } from '../dtos/create-tag.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Tag, Transaction, Prisma } from '@prisma/client';
import { PaginatedOutputDto } from '../dtos/paginated-output.dto';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @Inject('TAG_SERVICE') private readonly tagClient: ClientProxy,
    private readonly prisma: PrismaService,
  ) {}

  async findTagByTagName(tagName: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: { tag: tagName },
    });
  }

  async addTags(tags: CreateTagDto[]): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
      for (const tag of tags) {
        const existingTag = await this.prisma.tag.findFirst({
          where: { tag: tag.Tag }
        });

        if (existingTag) {
          // Update existing tag
          await this.prisma.tag.update({
            where: { id: existingTag.id },
            data: {
              scanCount: tag.ScanCount,
              timestamp: new Date(tag.Timestamp)
            }
          });
        } else {
          // Create new transaction and tag
          const transaction = await this.prisma.$transaction(async (prisma) => {
            const newTransaction = await prisma.transaction.create({
              data: {
                epc: tag.Tag,
                rssi: '-50.00', // Default value since not provided
                timestamp: new Date(tag.Timestamp),
                mode: 'single'
              }
            });

            const newTag = await prisma.tag.create({
              data: {
                tag: tag.Tag,
                deviceNo: tag.DeviceNo || 1,
                antennaNo: tag.AntennaNo || 1,
                timestamp: new Date(tag.Timestamp),
                scanCount: 1,
                tagName: tag.TagName,
                transactions: {
                  connect: {
                    id: newTransaction.id
                  }
                }
              },
              include: {
                transactions: true,
                products: true
              }
            });

            return { transaction: newTransaction, tag: newTag };
          });

          // Emit tag to queue for processing
          await this.emitTagToQueue(transaction.tag);
        }
      }

      return {
        success: true,
        message: 'Tags processed successfully'
      };
    } catch (error) {
      this.logger.error('Error in addTags:', error.stack);
      return {
        success: false,
        message: 'Failed to process tags',
        errors: [error.message]
      };
    }
  }

  async emitTagToQueue(tag: Tag): Promise<void> {
    try {
      await this.tagClient.emit(process.env.RABBITMQ_TAG_QUEUE || 'tag_queue', tag);
    } catch (error) {
      this.logger.error(`Failed to emit tag to RabbitMQ: ${error.message}`, error.stack);
    }
  }

  async getTags(
    page: number = 1,
    perPage: number = 10,
    q?: string
  ): Promise<PaginatedOutputDto<Tag>> {
    const whereClause: Prisma.TagWhereInput = q ? {
      OR: [
        { tag: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { tagName: { contains: q, mode: Prisma.QueryMode.insensitive } }
      ]
    } : {};

    const [total, tags] = await Promise.all([
      this.prisma.tag.count({
        where: whereClause
      }),
      this.prisma.tag.findMany({
        where: whereClause,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          transactions: true,
          products: true
        },
        orderBy: {
          timestamp: 'desc'
        }
      })
    ]);

    return {
      data: tags,
      meta: {
        total,
        lastPage: Math.ceil(total / perPage),
        currentPage: page,
        perPage,
        prev: page > 1 ? page - 1 : null,
        next: page < Math.ceil(total / perPage) ? page + 1 : null,
      }
    };
  }

  async getTagById(id: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        transactions: true,
        products: true
      }
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }
}