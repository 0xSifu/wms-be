import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class FilterProductDto {
  @ApiProperty({
    description: 'The name of the product (partial match)',
    example: 'Prod',
    required: false
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({
    description: 'The product code (exact match)',
    example: '000192',
    required: false
  })
  @IsString()
  @IsOptional()
  productCode?: string;

  @ApiProperty({
    description: 'The type of the product (partial match)',
    example: 'Type',
    required: false
  })
  @IsString()
  @IsOptional()
  productType?: string;

  @ApiProperty({
    description: 'The tag ID associated with the product (exact match)',
    example: 'E28069950000500F0B88B522',
    required: false
  })
  @IsString()
  @IsOptional()
  tagId?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}