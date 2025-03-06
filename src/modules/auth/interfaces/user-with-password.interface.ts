import { UserResponseDto } from '../../user/dtos/user.response.dto';

export interface UserWithPassword extends UserResponseDto {
  password: string;
} 