export enum TokenType {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export interface IAuthPayload {
  id: string;
  tokenType?: TokenType;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IGetPermissionFromRolePayload {
  module: string;
}