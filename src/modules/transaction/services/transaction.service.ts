import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      epc: transaction.epc,
      rssi: transaction.rssi,
      mode: transaction.mode,
      timestamp: transaction.timestamp,
      batchId: transaction.batchId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  async createTransaction(data: CreateTransactionDto): Promise<TransactionResponseDto> {
    try {
      // Check if a transaction with this EPC already exists
      const existingTransaction = await this.prisma.transaction.findFirst({
        where: { epc: data.epc },
        orderBy: { createdAt: 'desc' }
      });

      // Create the transaction
      const transaction = await this.prisma.transaction.create({
        data: {
          epc: data.epc,
          rssi: data.rssi,
          mode: data.mode || 'single',
          timestamp: new Date(),
        },
      });

      // Check if a tag with this EPC already exists
      const existingTag = await this.prisma.tag.findFirst({
        where: { tag: data.epc }
      });

      // If tag doesn't exist, create it
      if (!existingTag) {
        await this.prisma.tag.create({
          data: {
            tag: data.epc,
            deviceNo: 1, // Default value
            antennaNo: 1, // Default value
            timestamp: new Date(),
            scanCount: 1,
            tagName: data.epc, // Use EPC as tag name
            transactions: {
              connect: {
                id: transaction.id
              }
            }
          }
        });
      } else {
        // Update existing tag with new scan count and timestamp
        await this.prisma.tag.update({
          where: { id: existingTag.id },
          data: {
            scanCount: existingTag.scanCount + 1,
            timestamp: new Date()
          }
        });

        // If tag is associated with a product, update the product unit count
        const product = await this.prisma.product.findFirst({
          where: { tagId: existingTag.id }
        });

        if (product) {
          await this.prisma.product.update({
            where: { id: product.id },
            data: { unit: product.unit + 1 }
          });
        }
      }

      return this.mapToResponseDto(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getAllTransactions(batchId?: string): Promise<TransactionResponseDto[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: batchId ? { batchId } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return transactions.map(this.mapToResponseDto);
  }

  async getUnbatchedTransactions(): Promise<TransactionResponseDto[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        batchId: null
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return transactions.map(this.mapToResponseDto);
  }

  async getTransactionById(id: string): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return this.mapToResponseDto(transaction);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<TransactionResponseDto[]> {
    const transactions = await this.prisma.transaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tag: true,
        product: true,
        batch: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return transactions.map(this.mapToResponseDto);
  }

  async findOne(id: string): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        tag: true,
        product: true,
        batch: true
      }
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return this.mapToResponseDto(transaction);
  }

  async update(id: string, data: UpdateTransactionDto): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data,
    });
    return this.mapToResponseDto(transaction);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.transaction.delete({
      where: { id },
    });
  }
} 