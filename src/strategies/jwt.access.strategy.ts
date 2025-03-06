import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAuthPayload } from 'src/modules/auth/interfaces/auth.interface';

@Injectable()
export class AuthJwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  private readonly logger = new Logger(AuthJwtAccessStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('auth.accessToken.secret') || process.env.ACCESS_TOKEN_SECRET_KEY;
    
    if (!secret) {
      throw new Error('JWT secret key is not configured. Please check your environment variables and configuration.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    this.logger.log('JWT Access Strategy initialized with secret key');
  }

  async validate(payload: IAuthPayload) {
    return payload;
  }
}
