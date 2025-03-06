import { registerAs } from '@nestjs/config';
import ms from 'ms';

function seconds(msValue: string): number {
  return ms(msValue) / 1000;
}

export default registerAs(
  'auth',
  (): Record<string, any> => {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET_KEY;
    const accessTokenExpired = process.env.ACCESS_TOKEN_EXPIRED;
    const refreshTokenExpired = process.env.REFRESH_TOKEN_EXPIRED;

    if (!accessTokenSecret) {
      console.warn('WARNING: ACCESS_TOKEN_SECRET_KEY is not set in environment variables');
    }

    if (!refreshTokenSecret) {
      console.warn('WARNING: REFRESH_TOKEN_SECRET_KEY is not set in environment variables');
    }

    return {
      accessToken: {
        secret: accessTokenSecret,
        expirationTime: seconds(accessTokenExpired ?? '1d'),
      },
      refreshToken: {
        secret: refreshTokenSecret,
        expirationTime: seconds(refreshTokenExpired ?? '7d'),
      },
    };
  },
);