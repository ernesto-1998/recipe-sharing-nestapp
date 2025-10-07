import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { UserDto } from './user.dto';

export class ResponseUserDto extends OmitType(UserDto, [
  'password',
  'isOAuthUser',
  '__v',
] as const) {
  @Exclude()
  password?: string;

  @Exclude()
  isOAuthUser?: boolean;

  @Exclude()
  __v?: number;
}
