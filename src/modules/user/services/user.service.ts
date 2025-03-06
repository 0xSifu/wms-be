import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { UpdateUserDto } from '../dtos/update.user.dto';
import { UserCreateDto } from 'src/modules/auth/dtos/auth.signup.dto';
import { UserResponseDto } from '../dtos/user.response.dto';
import { GenericResponseDto } from '../dtos/generic.response.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService) {}

  private mapToUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      isDelete: user.isDelete,
      ipAddress: user.ipAddress,
      log: user.log,
      is_account_admin: user.isAccountAdmin,
      isAdmin: user.isAdmin,
      userStatus: user.status as 'active' | 'inactive',
      userLanguage: user.language as 'en' | 'fr' | 'es',
    };
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id: userId }
    });
  }

  async updateUser(userId: string, data: Partial<User>): Promise<UserResponseDto> {
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data
    });
    return this.mapToUserResponseDto(updatedUser);
  }

  async deleteUser(userId: string): Promise<User> {
    return this.prismaService.user.delete({
      where: { id: userId }
    });
  }

  async findUserByIds(userIds: string[]): Promise<User[]> {
    return this.prismaService.user.findMany({
      where: {
        id: {
          in: userIds
        }
      }
    });
  }

  async deleteUsers(userIds: string[]): Promise<{ count: number }> {
    const result = await this.prismaService.user.deleteMany({
      where: {
        id: {
          in: userIds
        }
      }
    });
    return { count: result.count };
  }

  async updateLoginInfo(userId: string): Promise<UserResponseDto> {
    const updatedUser = await this.prismaService.user.update({
      data: {
        lastLogin: new Date(),
      },
      where: {
        id: userId,
      },
    });

    return this.mapToUserResponseDto(updatedUser);
  }

  async createUser(data: UserCreateDto): Promise<UserResponseDto> {
    const newUser = await this.prismaService.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        isAccountAdmin: data.is_account_admin ?? false,
        isAdmin: data.is_admin ?? false,
        language: data.userLanguage ?? 'en',
        status: data.userStatus ?? 'ACTIVE',
      },
    });

    return this.mapToUserResponseDto(newUser);
  }

  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return this.mapToUserResponseDto(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    return user ? this.mapToUserResponseDto(user) : null;
  }

  async softDeleteUsers(userIds: string[]): Promise<GenericResponseDto> {
    await this.prismaService.user.updateMany({
      where: {
        id: {
          in: userIds
        },
      },
      data: {
        isDelete: true,
      },
    });
    return {
      status: true,
      message: 'User(s) soft-deleted',
    };
  }
}
