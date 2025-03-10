import { Controller, Get, Post, Body, Param, Delete, Put, Query, NotFoundException } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiOkResponse,
  ApiExtraModels
} from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { StatisticsResponseDto } from '../dto/statistics-response.dto';

@ApiTags('Products')
@Controller('products')
@ApiBearerAuth('accessToken')
@ApiExtraModels(StatisticsResponseDto)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get comprehensive product and tag statistics with chart data',
    description: `
Returns detailed statistics about products, tags, and transactions in the system, including chart data for visualization.

Statistics include:
1. Basic Counts:
   - Total products, tags, and transactions
   - Products with/without tags
   - Unsynced tags

2. Recent Activity:
   - Transactions in last 24 hours
   - New tags in last 24 hours
   - Most recent scan timestamp

3. Performance Metrics:
   - Average scans per tag
   - Most scanned tag
   - Product with most transactions

4. Chart Data:
   - Daily transaction trends (7-day history)
   - Hourly transaction distribution (today)
   - Product type distribution
   - Tag scan trends (hourly)
    `
  })
  @ApiOkResponse({ 
    description: 'Statistics retrieved successfully', 
    type: StatisticsResponseDto,
    schema: {
      example: {
        // Basic statistics
        totalProducts: 150,
        totalTagsScanned: 500,
        totalTagsUnsync: 50,
        totalTransactions: 1000,
        productsWithTags: 150,
        productsWithoutTags: 0,
        averageScansPerTag: 5.5,
        
        // Recent activity
        lastScanTimestamp: "2024-03-10T15:30:00Z",
        transactionsLast24Hours: 245,
        newTagsLast24Hours: 15,
        
        // Top performers
        mostScannedTag: {
          epc: "E280116060000123456",
          scanCount: 50
        },
        productWithMostTags: {
          productName: "Premium Product A",
          tagCount: 30
        },

        // Chart Data
        dailyTransactions: [
          { label: "2024-03-04", value: 120 },
          { label: "2024-03-05", value: 145 },
          { label: "2024-03-06", value: 135 },
          { label: "2024-03-07", value: 158 },
          { label: "2024-03-08", value: 165 },
          { label: "2024-03-09", value: 142 },
          { label: "2024-03-10", value: 138 }
        ],
        hourlyTransactions: [
          { label: "09:00", value: 25 },
          { label: "10:00", value: 35 },
          { label: "11:00", value: 42 },
          { label: "12:00", value: 28 },
          { label: "13:00", value: 38 }
        ],
        productTypeDistribution: [
          { label: "Electronics", value: 45 },
          { label: "Clothing", value: 35 },
          { label: "Accessories", value: 40 },
          { label: "Home Goods", value: 30 }
        ],
        tagScanTrends: [
          { label: "09:00", value: 28 },
          { label: "10:00", value: 38 },
          { label: "11:00", value: 45 },
          { label: "12:00", value: 30 },
          { label: "13:00", value: 42 }
        ]
      }
    }
  })
  async getStatistics(): Promise<StatisticsResponseDto> {
    return this.productsService.getStatistics();
  }

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