import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'EPC code of the transaction' })
  @IsString()
  @IsNotEmpty()
  epc: string;

  @ApiProperty({ description: 'RSSI value' })
  @IsString()
  @IsNotEmpty()
  rssi: string;

  @ApiProperty({ description: 'Transaction mode', default: 'single' })
  @IsString()
  @IsOptional()
  mode?: string = 'single';

  @ApiProperty({ description: 'Tag name (optional)', required: false })
  @IsString()
  @IsOptional()
  tagName?: string;
}