import type { Batch, Transaction } from '@prisma/client';

export interface BatchWithTransactions extends Batch {
  transactions: Transaction[];
} 