import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'The transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'The EPC (Electronic Product Code)',
    example: '3034257BF395F4B000000001'
  })
  epc: string;

  @ApiProperty({
    description: 'The RSSI (Received Signal Strength Indicator)',
    example: '-67'
  })
  rssi: string;

  @ApiProperty({
    description: 'The mode of the transaction',
    example: 'single'
  })
  mode: string;

  @ApiProperty({
    description: 'The timestamp when the transaction was created',
    example: '2024-03-02T12:00:00Z'
  })
  timestamp: Date;

  @ApiProperty({
    description: 'The batch ID if the transaction is part of a batch',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  batchId?: string;

  @ApiProperty({
    description: 'When the transaction was created',
    example: '2024-03-02T12:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the transaction was last updated',
    example: '2024-03-02T12:00:00Z'
  })
  updatedAt: Date;
} 