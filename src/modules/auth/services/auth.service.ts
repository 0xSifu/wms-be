import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { JwtService } from '@nestjs/jwt';
  import {
    IAuthPayload,
    ITokenResponse,
    TokenType,
  } from '../interfaces/auth.interface';
  import { UserService } from '../../user/services/user.service';
  import { UserLoginDto } from '../dtos/auth.login.dto';
  import { UserCreateDto } from '../dtos/auth.signup.dto';
  import { HelperHashService } from '../../../common/helper/services/helper.hash.service';
  import { IAuthService } from '../interfaces/auth.service.interface';
  import { AuthResponseDto } from '../dtos/auth.response.dto';
  import { PrismaService } from '../../../common/services/prisma.service';
  import { ClientProxy } from '@nestjs/microservices';
  import { UserWithPassword } from '../interfaces/user-with-password.interface';
  
  @Injectable()
  export class AuthService implements IAuthService {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenExp: string;
    private readonly refreshTokenExp: string;
  
    constructor(
      @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
      private readonly configService: ConfigService,
      private readonly jwtService: JwtService,
      private readonly userService: UserService,
      private readonly helperHashService: HelperHashService,
      private readonly prismaService: PrismaService,
    ) {
      this.accessTokenSecret = this.configService.get<string>(
        'auth.accessToken.secret',
      );
      this.refreshTokenSecret = this.configService.get<string>(
        'auth.refreshToken.secret',
      );
      this.accessTokenExp = this.configService.get<string>(
        'auth.accessToken.expirationTime',
      );
      this.refreshTokenExp = this.configService.get<string>(
        'auth.refreshToken.expirationTime',
      );
    }
  
    async verifyToken(accessToken: string): Promise<IAuthPayload> {
      try {
        const data = await this.jwtService.verifyAsync(accessToken, {
          secret: this.accessTokenSecret,
        });
        return data;
      } catch (e) {
        throw e;
      }
    }
  
    async generateTokens(payload: IAuthPayload): Promise<ITokenResponse> {
      try {
        const accessToken = await this.jwtService.signAsync(
          {
            ...payload,
            tokenType: TokenType.ACCESS_TOKEN,
          },
          {
            secret: this.accessTokenSecret,
            expiresIn: this.accessTokenExp,
          },
        );
  
        const refreshToken = await this.jwtService.signAsync(
          {
            ...payload,
            tokenType: TokenType.REFRESH_TOKEN,
          },
          {
            secret: this.refreshTokenSecret,
            expiresIn: this.refreshTokenExp,
          },
        );
  
        await this.authClient.emit(
          process.env.RABBITMQ_AUTH_QUEUE,
          JSON.stringify({ accessToken, refreshToken, user: payload }),
        );
  
        return {
          accessToken,
          refreshToken,
        };
      } catch (e) {
        console.error('Error generating tokens:', e);
        throw e;
      }
    }
  
    async validateUser(email: string, password: string): Promise<UserWithPassword> {
      const user = await this.prismaService.user.findFirst({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const match = await this.helperHashService.match(user.password, password);
      if (!match) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Map Prisma enums to DTO enums
      const userStatusMap = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        PENDING: 'inactive'
      } as const;

      const languageMap = {
        en: 'en',
        fr: 'fr',
        es: 'es',
        cz: 'en', // fallback to en
        de: 'en', // fallback to en
        uk: 'en'  // fallback to en
      } as const;

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
        userStatus: userStatusMap[user.status],
        userLanguage: languageMap[user.language],
        password: user.password
      };
    }
  
    async login(data: UserLoginDto): Promise<AuthResponseDto> {
      const user = await this.validateUser(data.email, data.password);
      const tokens = await this.generateTokens({ id: user.id });

      await this.userService.updateLoginInfo(user.id);
      const userResponse = { ...user };
      delete (userResponse as any).password;

      return {
        ...tokens,
        user: userResponse,
      };
    }
  
    async signup(data: UserCreateDto): Promise<AuthResponseDto> {
      try {
        const { email, username, password, is_account_admin, is_admin, userLanguage, userStatus } = data;
        const findUser = await this.userService.getUserByEmail(email);
        if (findUser) {
          throw new HttpException('User already exists', HttpStatus.CONFLICT);
        }
        const passwordHashed = await this.helperHashService.createHash(password);
        const createdUser = await this.userService.createUser({
          email,
          username,
          password: passwordHashed,
          is_account_admin,
          is_admin,
          userLanguage,
          userStatus
        });

        const tokens = await this.generateTokens({ id: createdUser.id });
        const userResponse = { ...createdUser };
        delete (userResponse as any).password;

        return {
          ...tokens,
          user: userResponse,
        };
      } catch (e) {
        throw e;
      }
    }
    
    async logout(userId: string): Promise<boolean> {
      try {
        await this.authClient.emit('user.logout', { userId });
        return true;
      } catch (error) {
        console.error(`Logout failed for userId ${userId}:`, error);
        return false;
      }
    }
    
  }
  