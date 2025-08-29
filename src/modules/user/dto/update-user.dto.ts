import {
  IsOptional,
  IsString,
  IsEmail,
  ValidateNested,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileDto } from './profile.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'newuser@example.com',
    description: 'Updated email of the user',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'newusername',
    description: 'Updated username of the user',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    example: 'newStrongPass123',
    minLength: 8,
    maxLength: 20,
    description: 'Updated password (min 8, max 20 characters)',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'The min length of password is 8' })
  @MaxLength(20, {
    message: 'The password can not accept more than 20 characters',
  })
  password?: string;

  @ApiPropertyOptional({
    example: 'user',
    description: 'Updated role of the user',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    type: () => ProfileDto,
    description: 'Updated profile object',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;
}
