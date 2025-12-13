import { OmitType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from 'src/modules/user/dto';

export class CreateUserOAuthDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;
}
