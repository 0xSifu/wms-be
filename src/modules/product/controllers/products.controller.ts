import { Controller, Get, Post, Body, Param, Delete, Put, Query, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { FilterProductDto } from '../dto/filter-product.dto';

@ApiTags('Products')
@Controller('products')
@ApiBearerAuth('accessToken')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: ProductResponseDto })
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated products', type: [ProductResponseDto] })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findAll(page, limit);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all products without pagination' })
  @ApiResponse({ status: 200, description: 'Return all products', type: [ProductResponseDto] })
  async getAllProducts(): Promise<ProductResponseDto[]> {
    return this.productsService.getAllProducts();
  }

  @Get('filter')
  @ApiOperation({ summary: 'Filter products based on criteria' })
  @ApiResponse({ status: 200, description: 'Return filtered products', type: [ProductResponseDto] })
  async filterProducts(@Query() filterDto: FilterProductDto): Promise<ProductResponseDto[]> {
    return this.productsService.filterProducts(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Return the product', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully', type: ProductResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}