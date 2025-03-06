import { IsString, IsDate, IsBoolean, IsInt, IsOptional, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { Transform, Type } from 'class-transformer';

export class UserDetailCreateDto {
  
    @ApiProperty({ description: 'User ID associated with this profile' })
    @IsString()
    userId: string;
  
    @ApiProperty({ description: 'Display name of the user' })
    @IsString()
    @IsNotEmpty({ message: 'FullName not provided' })
    displayName: string;
  
    @ApiProperty({ description: 'Gender of the user', enum: ['male', 'female', 'other'] })
    @IsString()
    @IsNotEmpty({ message: 'gender not provided' })
    gender: string;
  
    @ApiProperty({ description: 'Birthday of the user', example: '1990-01-01' })
    @IsDateString()
    @IsNotEmpty({ message: 'Birthday not provided' })
    @Transform(({ value }) => new Date(value))
    birthday: Date;
  
    @ApiProperty({ description: 'Horoscope of the user' })
    @IsString()
    @IsOptional()
    horoscope: string;
  
    @ApiProperty({ description: 'Zodiac sign of the user' })
    @IsString()
    @IsOptional()
    zodiac: string;
  
    @ApiProperty({ description: 'Height of the user in centimeters' })
    @IsNumber()
    @IsNotEmpty({ message: 'height not provided' })
    height: number;
  
    @ApiProperty({ description: 'Weight of the user in kilograms' })
    @IsNumber()
    @IsNotEmpty({ message: 'weight not provided' })
    weight: number;
  
    @ApiProperty({ description: 'Whether the user detail is active' })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;
}