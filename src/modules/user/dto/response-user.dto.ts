import { OmitType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class ResponseUserDto extends OmitType(UserDto, [
  'password',
  '__v',
] as const) {}
