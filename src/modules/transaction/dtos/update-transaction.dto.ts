import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTransactionDto {
  @ApiProperty({
    description: 'The EPC (Electronic Product Code)',
    example: '3034257BF395F4B000000001',
    required: false
  })
  @IsString()
  @IsOptional()
  epc?: string;

  @ApiProperty({
    description: 'The RSSI (Received Signal Strength Indicator)',
    example: '-67',
    required: false
  })
  @IsString()
  @IsOptional()
  rssi?: string;

  @ApiProperty({
    description: 'The mode of the transaction',
    example: 'single',
    required: false
  })
  @IsString()
  @IsOptional()
  mode?: string;
} 