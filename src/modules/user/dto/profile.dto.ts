import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { SocialNetworksDto } from './social-networks.dto';
import { IsNotFutureDate } from 'src/common/decorators';

export class ProfileDto {
  @ApiPropertyOptional({
    example: 'John Mike',
    description: 'Firstname of the user',
  })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional({
    example: 'Morales Figueroa',
    description: 'Lastname of the user',
  })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({
    example: 'Software engineer with 5 years of experience',
    description: 'Users biograhpy',
  })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'Profile users photo',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsDateString()
  @IsNotFutureDate({ message: 'Birth date cannot be in the future' })
  birthDate?: string;

  @ApiPropertyOptional({
    type: () => SocialNetworksDto,
    description: 'Social networks of the user',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialNetworksDto)
  socialNetworks?: SocialNetworksDto;

  @ApiPropertyOptional({
    type: () => AddressDto,
    description: 'Users Address',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
