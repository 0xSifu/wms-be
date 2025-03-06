import { ApiProperty } from '@nestjs/swagger';
import { Language as PrismaLanguage } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  lastLogin: Date | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isDelete: boolean;

  @ApiProperty({ required: false })
  ipAddress: string | null;

  @ApiProperty({ type: 'array' })
  log: any[];

  @ApiProperty()
  is_account_admin: boolean;

  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty({ enum: ['active', 'inactive'] })
  userStatus: 'active' | 'inactive';

  @ApiProperty({ enum: ['en', 'fr', 'es'] })
  userLanguage: 'en' | 'fr' | 'es';
}
