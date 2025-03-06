import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'EPC code' })
  epc: string;

  @ApiProperty({ description: 'RSSI value' })
  rssi: string;

  @ApiProperty({ description: 'Transaction mode' })
  mode: string;

  @ApiProperty({ description: 'Transaction timestamp' })
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Associated batch ID' })
  batchId?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 