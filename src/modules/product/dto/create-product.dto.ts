import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Tes Prod Name'
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    description: 'The product code',
    example: '000192'
  })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({
    description: 'The type of the product',
    example: 'Type'
  })
  @IsString()
  @IsNotEmpty()
  productType: string;

  @ApiProperty({
    description: 'The unit quantity',
    example: 1
  })
  @IsInt()
  @Min(1)
  unit: number;

  @ApiProperty({
    description: 'The tag ID associated with the product',
    example: 'E28069950000500F0B88B522'
  })
  @IsString()
  @IsNotEmpty()
  tagId: string;
}