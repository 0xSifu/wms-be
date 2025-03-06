import { Controller, Get, Post, Body, Param, Delete, Put, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Transaction')
@Controller('transaction')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', type: TransactionResponseDto })
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all transactions with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated transactions', type: [TransactionResponseDto] })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<TransactionResponseDto[]> {
    return this.transactionService.findAll(page, limit);
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Get all transactions without pagination' })
  @ApiResponse({ status: 200, description: 'Return all transactions', type: [TransactionResponseDto] })
  async getAllTransactions(): Promise<TransactionResponseDto[]> {
    return this.transactionService.getAllTransactions();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Return the transaction', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    return this.transactionService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully', type: TransactionResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ): Promise<TransactionResponseDto> {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.transactionService.remove(id);
  }
} 