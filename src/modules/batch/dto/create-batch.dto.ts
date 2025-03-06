import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBatchDto {
  @ApiProperty({ description: 'Name of the batch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the batch' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Array of transaction IDs (UUIDs) to include in the batch', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  transactionIds: string[];
} 