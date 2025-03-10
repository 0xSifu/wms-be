import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { Product } from '@prisma/client';
import PusherClient from 'pusher-js';
import Pusher from 'pusher';
import { StatisticsResponseDto } from '../dto/statistics-response.dto';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly pusherServer: Pusher;
  private readonly pusherClient: PusherClient;

  constructor(private readonly prismaService: PrismaService) {
    // Initialize Pusher server for broadcasting
    this.pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID || '',
      key: process.env.PUSHER_KEY || '',
      secret: process.env.PUSHER_SECRET || '',
      cluster: process.env.PUSHER_CLUSTER || '',
      useTLS: true
    });

    // Initialize Pusher client for subscribing
    this.pusherClient = new PusherClient(process.env.PUSHER_KEY || '', {
      cluster: process.env.PUSHER_CLUSTER || '',
    });
  }

  async onModuleInit() {
    // Subscribe to the RFID scan channel
    await this.subscribeToRFIDScans();
  }

  /**
   * Subscribe to RFID scan events and handle product unit updates
   * @private
   */
  private async subscribeToRFIDScans() {
    console.log('Initializing RFID scan subscription...');
    const channel = this.pusherClient.subscribe('rfid-scan');
    
    channel.bind('tag-scanned', async (data: { epc: string; timestamp: string; rssi: string; mode: string }) => {
      console.log('Received RFID scan event:', data);
      
      try {
        // First, find the tag with the scanned EPC
        const tag = await this.prismaService.tag.findFirst({
          where: { 
            tag: data.epc
          },
          include: {
            products: true
          }
        });

        console.log('Found tag:', tag);

        if (tag?.products?.length > 0) {
          const product = tag.products[0]; // Get the associated product
          console.log('Found associated product:', product);
          
          // Update product unit count
          const updatedProduct = await this.prismaService.product.update({
            where: { id: product.id },
            data: {
              unit: {
                increment: 1
              }
            }
          });

          console.log('Updated product:', updatedProduct);

          // Create a transaction record with proper relations using nested create
          const transaction = await this.prismaService.transaction.create({
            data: {
              epc: data.epc,
              rssi: data.rssi,
              mode: data.mode,
              timestamp: new Date(data.timestamp),
              tag: {
                connect: {
                  id: tag.id
                }
              },
              product: {
                connect: {
                  id: product.id
                }
              }
            }
          });

          console.log('Created transaction:', transaction);

          // Broadcast the updated product to all clients
          await this.pusherServer.trigger('product-updates', 'unit-updated', {
            productId: updatedProduct.id,
            newUnit: updatedProduct.unit,
            tagId: tag.id,
            epc: data.epc,
            timestamp: data.timestamp,
            transactionId: transaction.id
          });

          console.log('Broadcasted update to clients');
        } else {
          console.log('No product found for tag:', data.epc);
        }
      } catch (error) {
        console.error('Error handling RFID scan:', error);
      }
    });

    // Add connection status logging
    this.pusherClient.connection.bind('connected', () => {
      console.log('Connected to Pusher');
    });

    this.pusherClient.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
    });

    this.pusherClient.connection.bind('disconnected', () => {
      console.log('Disconnected from Pusher');
    });
  }

  /**
   * Maps a Product entity to a ProductResponseDto
   * @param product The product entity to map
   * @returns The mapped product response DTO
   */
  private mapToResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      productName: product.productName,
      productCode: product.productCode,
      productType: product.productType,
      unit: product.unit,
      tagId: product.tagId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Create a new product
   * @param data Product data to create
   * @returns The created product
   */
  async createProduct(data: CreateProductDto): Promise<ProductResponseDto> {
    // Check if tag exists
    const tag = await this.prismaService.tag.findUnique({
      where: { id: data.tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${data.tagId} not found`);
    }

    const product = await this.prismaService.product.create({
      data: {
        productName: data.productName,
        productCode: data.productCode,
        productType: data.productType,
        unit: data.unit,
        tagId: data.tagId,
      },
    });
    
    return this.mapToResponseDto(product);
  }

  /**
   * Get all products with pagination
   * @param page Page number
   * @param limit Number of items per page
   * @returns List of products
   */
  async findAll(page: number = 1, limit: number = 10): Promise<ProductResponseDto[]> {
    const skip = (page - 1) * limit;
    const products = await this.prismaService.product.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return products.map(this.mapToResponseDto);
  }

  /**
   * Get all products without pagination
   * @returns List of all products
   */
  async getAllProducts(): Promise<ProductResponseDto[]> {
    const products = await this.prismaService.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return products.map(this.mapToResponseDto);
  }

  /**
   * Filter products based on criteria
   * @param filterDto Filter criteria
   * @returns Filtered list of products
   */
  async filterProducts(filterDto: FilterProductDto): Promise<ProductResponseDto[]> {
    const { productName, productCode, productType, tagId, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (productName) {
      where.productName = {
        contains: productName,
        mode: 'insensitive',
      };
    }
    
    if (productCode) {
      where.productCode = productCode;
    }
    
    if (productType) {
      where.productType = {
        contains: productType,
        mode: 'insensitive',
      };
    }
    
    if (tagId) {
      where.tagId = tagId;
    }
    
    const products = await this.prismaService.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return products.map(this.mapToResponseDto);
  }

  /**
   * Get a product by ID
   * @param id Product ID
   * @returns The product
   */
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.mapToResponseDto(product);
  }

  /**
   * Update a product
   * @param id Product ID
   * @param data Update data
   * @returns The updated product
   */
  async update(id: string, data: UpdateProductDto): Promise<ProductResponseDto> {
    // Check if product exists
    await this.findOne(id);
    
    // Check if tag exists if tagId is provided
    if (data.tagId) {
      const tag = await this.prismaService.tag.findUnique({
        where: { id: data.tagId },
      });

      if (!tag) {
        // Check if there's a transaction with this EPC
        const transaction = await this.prismaService.transaction.findFirst({
          where: { epc: data.tagId },
          orderBy: { createdAt: 'desc' }
        });

        if (transaction) {
          // Create a tag from the transaction
          const newTag = await this.prismaService.tag.create({
            data: {
              tag: transaction.epc,
              deviceNo: 1, // Default value
              antennaNo: 1, // Default value
              timestamp: transaction.timestamp,
              scanCount: 1,
              tagName: data.productName || transaction.epc, // Use product name if available
              transactions: {
                connect: {
                  id: transaction.id
                }
              }
            }
          });
          
          // Use the newly created tag
          data.tagId = newTag.id;
        } else {
          throw new NotFoundException(`Tag with ID ${data.tagId} not found`);
        }
      }
    }
    
    const product = await this.prismaService.product.update({
      where: { id },
      data,
    });
    
    return this.mapToResponseDto(product);
  }

  /**
   * Delete a product
   * @param id Product ID
   */
  async remove(id: string): Promise<void> {
    // Check if product exists
    await this.findOne(id);
    
    await this.prismaService.product.delete({
      where: { id },
    });
  }

  /**
   * Get comprehensive statistics about products and tags
   * @returns Extended statistics including product, tag, and transaction data
   */
  async getStatistics(): Promise<StatisticsResponseDto> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get the start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Get the start of 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalTags,
      tagsWithProducts,
      totalTransactions,
      productsWithTags,
      transactionsLast24Hours,
      newTagsLast24Hours,
      lastScan,
      mostScannedTag,
      productWithMostTags,
      // New queries for chart data
      dailyTransactionCounts,
      hourlyTransactionCounts,
      productTypes,
      tagScans
    ] = await Promise.all([
      // Get total number of products
      this.prismaService.product.count(),
      
      // Get total number of tags
      this.prismaService.tag.count(),
      
      // Get number of tags that are linked to products
      this.prismaService.tag.count({
        where: {
          products: {
            some: {}
          }
        }
      }),

      // Get total number of transactions
      this.prismaService.transaction.count(),

      // Get number of products that have tags
      this.prismaService.product.count(),  // Since tagId is required, all products have tags

      // Get transactions in last 24 hours
      this.prismaService.transaction.count({
        where: {
          timestamp: {
            gte: yesterday
          }
        }
      }),

      // Get new tags in last 24 hours
      this.prismaService.tag.count({
        where: {
          timestamp: {
            gte: yesterday
          }
        }
      }),

      // Get most recent scan
      this.prismaService.transaction.findFirst({
        orderBy: {
          timestamp: 'desc'
        },
        select: {
          timestamp: true
        }
      }),

      // Get most scanned tag
      this.prismaService.tag.findFirst({
        orderBy: {
          scanCount: 'desc'
        },
        select: {
          tag: true,
          scanCount: true
        }
      }),

      // Get product with most transactions
      this.prismaService.product.findFirst({
        select: {
          productName: true,
          _count: {
            select: {
              transactions: true
            }
          }
        },
        orderBy: {
          transactions: {
            _count: 'desc'
          }
        }
      }),

      // Get daily transaction counts for the last 7 days
      this.prismaService.transaction.groupBy({
        by: ['timestamp'],
        _count: {
          id: true
        },
        where: {
          timestamp: {
            gte: sevenDaysAgo
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      }),

      // Get hourly transaction counts for today
      this.prismaService.transaction.groupBy({
        by: ['timestamp'],
        _count: {
          id: true
        },
        where: {
          timestamp: {
            gte: startOfToday
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      }),

      // Get product type distribution
      this.prismaService.product.groupBy({
        by: ['productType'],
        _count: {
          id: true
        }
      }),

      // Get tag scan trends
      this.prismaService.transaction.groupBy({
        by: ['timestamp'],
        _count: {
          id: true
        },
        where: {
          timestamp: {
            gte: startOfToday
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      })
    ]);

    // Calculate average scans per tag
    const averageScansPerTag = totalTags > 0
      ? (await this.prismaService.tag.aggregate({
          _avg: {
            scanCount: true
          }
        }))._avg.scanCount || 0
      : 0;

    // Process daily transactions for chart
    const dailyTransactions = dailyTransactionCounts.map(day => ({
      label: day.timestamp.toISOString().split('T')[0],
      value: day._count.id
    }));

    // Process hourly transactions for chart
    const hourlyTransactions = hourlyTransactionCounts.map(hour => ({
      label: hour.timestamp.getHours().toString().padStart(2, '0') + ':00',
      value: hour._count.id
    }));

    // Process product type distribution for chart
    const productTypeDistribution = productTypes.map(type => ({
      label: type.productType,
      value: type._count.id
    }));

    // Process tag scan trends for chart
    const tagScanTrends = tagScans.map(scan => ({
      label: scan.timestamp.getHours().toString().padStart(2, '0') + ':00',
      value: scan._count.id
    }));

    return {
      totalProducts,
      totalTagsScanned: totalTags,
      totalTagsUnsync: totalTags - tagsWithProducts,
      totalTransactions,
      productsWithTags: totalProducts,  // All products have tags
      productsWithoutTags: 0,  // No products can exist without tags
      averageScansPerTag,
      lastScanTimestamp: lastScan?.timestamp || null,
      mostScannedTag: mostScannedTag ? {
        epc: mostScannedTag.tag,
        scanCount: mostScannedTag.scanCount
      } : null,
      productWithMostTags: productWithMostTags ? {
        productName: productWithMostTags.productName,
        tagCount: productWithMostTags._count.transactions
      } : null,
      transactionsLast24Hours,
      newTagsLast24Hours,
      // Add chart data
      dailyTransactions,
      hourlyTransactions,
      productTypeDistribution,
      tagScanTrends
    };
  }
}