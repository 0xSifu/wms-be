import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';

export class UserDetailResponseDto {
  @ApiProperty({ description: 'Unique identifier of the user detail' })
  id: string;

  @ApiProperty()
  @Exclude()
  userId: string;

  @ApiProperty({ description: 'Display name of the user' })
  displayName: string;

  @ApiProperty({ description: 'Gender of the user', enum: ['male', 'female', 'other'] })
  gender: string;

  @ApiProperty({ description: 'Birthday of the user' })
  @Transform(({ value }) => value ? value.toISOString() : null)
  birthday: Date | null;

  @ApiProperty({ description: 'Horoscope of the user' })
  horoscope: string;

  @ApiProperty({ description: 'Zodiac sign of the user' })
  zodiac: string;

  @ApiProperty({ description: 'Height of the user in centimeters' })
  height: number;

  @ApiProperty({ description: 'Weight of the user in kilograms' })
  weight: number;

  @ApiProperty({ description: 'Whether the user detail is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date | null;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date | null;

  constructor(partial: Partial<UserDetailResponseDto>) {
    Object.assign(this, partial);
  }
}