import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { BatchService } from '../services/batch.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BatchStatus } from '@prisma/client';
import { CreateBatchDto } from '../dto/create-batch.dto';
import { BatchWithTransactions } from '../types/batch.types';

@ApiTags('Batch')
@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new batch' })
  @ApiResponse({ status: 201, description: 'Batch created successfully' })
  async createBatch(@Body() createBatchDto: CreateBatchDto): Promise<BatchWithTransactions> {
    return this.batchService.createBatch(createBatchDto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get all batches' })
  @ApiResponse({ status: 200, description: 'List of all batches' })
  async getAllBatches(@Query('status') status?: BatchStatus): Promise<BatchWithTransactions[]> {
    return this.batchService.getAllBatches(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a batch by ID' })
  @ApiResponse({ status: 200, description: 'Batch details' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async getBatchById(@Param('id') id: string): Promise<BatchWithTransactions> {
    return this.batchService.getBatchById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update batch status' })
  @ApiResponse({ status: 200, description: 'Batch status updated' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async updateBatchStatus(
    @Param('id') id: string,
    @Body('status') status: BatchStatus
  ): Promise<BatchWithTransactions> {
    return this.batchService.updateBatchStatus(id, status);
  }
} 