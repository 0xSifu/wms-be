import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Updated Product Name',
    required: false
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({
    description: 'The product code',
    example: '000193',
    required: false
  })
  @IsString()
  @IsOptional()
  productCode?: string;

  @ApiProperty({
    description: 'The type of the product',
    example: 'Updated Type',
    required: false
  })
  @IsString()
  @IsOptional()
  productType?: string;

  @ApiProperty({
    description: 'The unit quantity',
    example: 2,
    required: false
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  unit?: number;

  @ApiProperty({
    description: 'The tag ID associated with the product',
    example: 'E28069950000500F0B88B522',
    required: false
  })
  @IsString()
  @IsOptional()
  tagId?: string;
}