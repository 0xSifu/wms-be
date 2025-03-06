import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { IUserDetailService } from '../interfaces/userdetail.service.interface';
import { UserDetailCreateDto } from '../dtos/userdetail.create.dto';
import { UserDetailUpdateDto } from '../dtos/userdetail.update.dto';
import { UserDetailResponseDto } from '../dtos/userdetail.response.dto';
import { User, UserDetail } from '@prisma/client';
import { GeneralResponseDto } from 'src/modules/user/dtos/general.response.dto';

@Injectable()
export class UserDetailService implements IUserDetailService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateProfile(userId: string, data: UserDetailUpdateDto): Promise<UserDetailResponseDto> {
    try {
      const updatedUserDetail = await this.prismaService.userDetail.update({
        where: { userId },
        data: {
          ...data,
          birthday: data.birthday ? new Date(data.birthday) : undefined,
          updatedAt: new Date(),
        },
      });
      return this.mapToResponseDto(updatedUserDetail);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }
  

  async createProfile(data: UserDetailCreateDto): Promise<UserDetailResponseDto> {
    const createdUserDetail = await this.prismaService.userDetail.create({
      data: {
        userId: data.userId,
        displayName: data.displayName,
        gender: data.gender,
        birthday: new Date(data.birthday),
        horoscope: data.horoscope,
        zodiac: data.zodiac,
        height: data.height,
        weight: data.weight,
        isActive: data.isActive
      }
    });

    return this.mapToResponseDto(createdUserDetail);
  }

  async getProfileById(userId: string): Promise<UserDetailResponseDto> {
    const userDetail = await this.prismaService.userDetail.findUnique({
      where: { userId },
    });

    return this.mapToResponseDto(userDetail);
  }

  async getAllUsers(): Promise<GeneralResponseDto[]> {
    const users = await this.prismaService.user.findMany();
    return users.map(user => this.mapToGeneralResponseDto(user));
  }
  
  private mapToGeneralResponseDto(user: User): GeneralResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
    };
  }

  private mapToResponseDto(userDetail: UserDetail | null): UserDetailResponseDto {
    if (!userDetail) {
      return null;
    }

    const { id, displayName, gender, birthday, horoscope, zodiac, height, weight, isActive, createdAt, updatedAt } = userDetail;

    return new UserDetailResponseDto({
      id,
      displayName,
      gender,
      birthday,
      horoscope,
      zodiac,
      height,
      weight,
      isActive,
      createdAt,
      updatedAt,
    });
  }

  async findUserDetailByUserId(userId: string): Promise<UserDetail | null> {
    return this.prismaService.userDetail.findUnique({
      where: { userId }
    });
  }

  async createUserDetail(data: UserDetailCreateDto): Promise<UserDetail> {
    return this.prismaService.userDetail.create({
      data: {
        userId: data.userId,
        displayName: data.displayName,
        gender: data.gender,
        birthday: new Date(data.birthday),
        horoscope: data.horoscope,
        zodiac: data.zodiac,
        height: data.height,
        weight: data.weight
      }
    });
  }

  async updateUserDetail(userId: string, data: UserDetailUpdateDto): Promise<UserDetail> {
    return this.prismaService.userDetail.update({
      where: { userId },
      data
    });
  }
}