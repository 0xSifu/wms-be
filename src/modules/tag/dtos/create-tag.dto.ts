import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTagDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  Tag: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  DeviceNo: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  AntennaNo: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  Timestamp: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  ScanCount: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  TagName?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  Quantity?: number;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  ExpiredDate?: Date;
} 