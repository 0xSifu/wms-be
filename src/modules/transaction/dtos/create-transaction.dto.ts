import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The EPC (Electronic Product Code)',
    example: '3034257BF395F4B000000001'
  })
  @IsString()
  @IsNotEmpty()
  epc: string;

  @ApiProperty({
    description: 'The RSSI (Received Signal Strength Indicator)',
    example: '-67'
  })
  @IsString()
  @IsNotEmpty()
  rssi: string;

  @ApiProperty({
    description: 'The mode of the transaction',
    example: 'single',
    default: 'single'
  })
  @IsString()
  @IsNotEmpty()
  mode: string;
} 