import { OmitType } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength, MaxLength } from 'class-validator';
import { UserDto } from './user.dto';

export class CreateUserDto extends OmitType(UserDto, [
  '_id',
  'isOAuthUser',
  'createdAt',
  'updatedAt',
  '__v',
] as const) {
  @IsDefined({ message: 'Password is required for traditional registration.' })
  @IsString()
  @MinLength(8, { message: 'Minimum password length is 8 characters.' })
  @MaxLength(20, {
    message: 'Password cannot exceed 20 characters.',
  })
  password: string;
}
