import { IsString, IsDate, IsBoolean, IsInt, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';

export class UserDetailUpdateDto {
  @ApiProperty({ description: 'Display name of the user' })
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiProperty({ description: 'Gender of the user', enum: ['male', 'female', 'other'] })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ description: 'Birthday of the user', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  birthday?: string;

  @ApiProperty({ description: 'Horoscope of the user' })
  @IsString()
  @IsOptional()
  horoscope?: string;

  @ApiProperty({ description: 'Zodiac sign of the user' })
  @IsString()
  @IsOptional()
  zodiac?: string;

  @ApiProperty({ description: 'Height of the user in centimeters' })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({ description: 'Weight of the user in kilograms' })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Whether the user detail is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}