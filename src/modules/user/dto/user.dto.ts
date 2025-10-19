import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileDto } from './profile.dto';

export class UserDto {
  @ApiProperty({
    example: '64c9b2f3e8a1a2b4c56789de',
    description: 'Unique identifier of the user',
  })
  @IsMongoId({
    message:
      'The provided ID does not match the expected format for identifiers.',
  })
  _id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Unique username of the user',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'strongPass123',
    minLength: 8,
    maxLength: 20,
    description: 'Password of the user (min 8, max 20 characters)',
  })
  @IsString()
  @MinLength(8, { message: 'The min length of password is 8' })
  @MaxLength(20, {
    message: 'The password can not accept more than 20 characters',
  })
  password: string;

  @ApiProperty({
    example: 'admin',
    description: 'Role assigned to the user',
  })
  @IsString()
  role: string;

  @ApiPropertyOptional({
    type: () => ProfileDto,
    description: 'Additional user profile information',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;

  @ApiPropertyOptional({
    example: '2025-08-28T10:15:30.000Z',
    description: 'Date when the user was created',
  })
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional({
    example: '2025-08-28T12:00:00.000Z',
    description: 'Date when the user was last updated',
  })
  @IsOptional()
  updatedAt?: Date;

  @ApiPropertyOptional({
    example: 0,
    description: 'Document version (managed by MongoDB)',
  })
  @IsOptional()
  __v?: number;
}
