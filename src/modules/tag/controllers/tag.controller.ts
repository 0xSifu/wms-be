import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { TagService } from '../services/tag.service';
import { CreateTagDto } from '../dtos/create-tag.dto';
import { Tag } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginatedOutputDto } from '../dtos/paginated-output.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create new tags' })
  @ApiResponse({ status: 201, description: 'Tags created successfully' })
  async createTags(@Body() tags: CreateTagDto[]) {
    return this.tagService.addTags(tags);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all tags with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated tags' })
  async getTags(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
    @Query('q') q?: string
  ): Promise<PaginatedOutputDto<Tag>> {
    return this.tagService.getTags(page, perPage, q);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a tag by id' })
  @ApiResponse({ status: 200, description: 'Return a tag' })
  async getTag(@Param('id') id: string): Promise<Tag> {
    return this.tagService.getTagById(id);
  }
}