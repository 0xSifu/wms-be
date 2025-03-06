import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the product',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'The name of the product',
    example: 'Tes Prod Name'
  })
  productName: string;

  @ApiProperty({
    description: 'The product code',
    example: '000192'
  })
  productCode: string;

  @ApiProperty({
    description: 'The type of the product',
    example: 'Type'
  })
  productType: string;

  @ApiProperty({
    description: 'The unit quantity',
    example: 1
  })
  unit: number;

  @ApiProperty({
    description: 'The tag ID associated with the product',
    example: 'E28069950000500F0B88B522'
  })
  tagId: string;

  @ApiProperty({
    description: 'The creation timestamp',
    example: '2023-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update timestamp',
    example: '2023-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}