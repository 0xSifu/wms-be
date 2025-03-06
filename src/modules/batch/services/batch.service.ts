import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import type { Batch, Prisma, Transaction, BatchStatus } from '@prisma/client';
import { BatchWithTransactions } from '../types/batch.types';

@Injectable()
export class BatchService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBatches(status?: BatchStatus): Promise<BatchWithTransactions[]> {
    return this.prisma.batch.findMany({
      where: status ? { status } : undefined,
      include: {
        transactions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createBatch(data: { name: string; description?: string; transactionIds: string[] }): Promise<BatchWithTransactions> {
    // Use a transaction to ensure all updates happen atomically
    return this.prisma.$transaction(async (prisma) => {
      // First check if all transactions exist and are not already in a batch
      const existingTransactions = await prisma.transaction.findMany({
        where: {
          id: {
            in: data.transactionIds
          },
          batchId: null // Only allow transactions that aren't already in a batch
        }
      });

      if (existingTransactions.length !== data.transactionIds.length) {
        const foundIds = existingTransactions.map(t => t.id);
        const missingOrBatchedIds = data.transactionIds.filter(id => !foundIds.includes(id));
        const alreadyBatchedTransactions = await prisma.transaction.findMany({
          where: {
            id: { in: missingOrBatchedIds },
            batchId: { not: null }
          }
        });
        
        if (alreadyBatchedTransactions.length > 0) {
          throw new NotFoundException(`Some transactions are already in a batch: ${alreadyBatchedTransactions.map(t => t.id).join(', ')}`);
        } else {
          throw new NotFoundException(`Some transactions were not found: ${missingOrBatchedIds.join(', ')}`);
        }
      }

      // Create the batch
      const batch = await prisma.batch.create({
        data: {
          name: data.name,
          description: data.description,
          status: 'PENDING',
        }
      });

      // Update all transactions to link them to the batch
      await prisma.transaction.updateMany({
        where: {
          id: {
            in: data.transactionIds
          }
        },
        data: {
          batchId: batch.id
        }
      });

      // Return the batch with updated transactions
      return prisma.batch.findUnique({
        where: { id: batch.id },
        include: {
          transactions: true
        }
      });
    });
  }

  async getBatchById(id: string): Promise<BatchWithTransactions> {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        transactions: true
      }
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  async updateBatchStatus(id: string, status: BatchStatus): Promise<BatchWithTransactions> {
    return this.prisma.batch.update({
      where: { id },
      data: { status },
      include: {
        transactions: true
      }
    });
  }
} 