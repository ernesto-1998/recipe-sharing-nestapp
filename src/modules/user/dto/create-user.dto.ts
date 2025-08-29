import { OmitType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class CreateUserDto extends OmitType(UserDto, [
  '_id',
  'createdAt',
  'updatedAt',
  '__v',
] as const) {}
