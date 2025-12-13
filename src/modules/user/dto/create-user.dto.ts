import { OmitType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class CreateUserDto extends OmitType(UserDto, [
  '_id',
  'createdAt',
  'updatedAt',
  'isOAuthUser',
  '__v',
] as const) {}
