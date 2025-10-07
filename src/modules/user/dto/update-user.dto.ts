import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDtoOmitted extends OmitType(CreateUserDto, [
  'email',
  'password',
] as const) {}

export class UpdateUserDto extends PartialType(UpdateUserDtoOmitted) {}
